#!/usr/bin/env python3
"""
KWISMO Backend -- Realistic Load Tester
========================================
Simulates real mobile app users with think time, gradual ramp-up,
and realistic concurrency rates. Generates a markdown report.

HOW TO RUN:
  python scripts/loadtest.py --users 100
  python scripts/loadtest.py --users 500 --duration 60
  python scripts/loadtest.py --users 100 500
"""

import argparse
import asyncio
import math
import os
import random
import statistics
import sys
import time
from dataclasses import dataclass, field

# Force UTF-8 on Windows
if sys.platform == "win32":
    os.environ.setdefault("PYTHONUTF8", "1")
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import httpx
except ImportError:
    print("[!] Missing dependency. Run: pip install httpx")
    sys.exit(1)

# -----------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------

DEFAULT_URL = "https://kwismo-backend-production.up.railway.app"
DEFAULT_ACTIVE_PCT = 1
DEFAULT_DURATION = 30
THINK_TIME_MIN = 1.0
THINK_TIME_MAX = 4.0
RAMP_UP_SECONDS = 3.0

ENDPOINTS = {
    "health": {"method": "GET", "path": "/health", "body": None, "weight": 5, "desc": "Health check"},
    "countries": {"method": "GET", "path": "/countries", "body": None, "weight": 10, "desc": "List countries"},
    "login": {"method": "POST", "path": "/auth/login", "body": {"email": "loadtest@kwismo.invalid", "mot_de_passe": "WrongPassword123!", "device_id": "loadtest-001", "device_name": "Test"}, "weight": 10, "desc": "Login attempt"},
    "register": {"method": "POST", "path": "/auth/register", "body": {"nom": "Test", "prenom": "Bot", "email": "test@kwismo.invalid", "mot_de_passe": "Pass123!"}, "weight": 5, "desc": "Register attempt"},
    "verify_num": {"method": "POST", "path": "/numbers/verify", "body": {"valeur": "+237690000001"}, "weight": 20, "desc": "Number verify"},
    "reports_list": {"method": "GET", "path": "/reports", "body": None, "weight": 20, "desc": "List recent reports"},
    "surveys": {"method": "GET", "path": "/surveys", "body": None, "weight": 10, "desc": "List active surveys"},
    "ussd_actions": {"method": "GET", "path": "/ussd/actions", "body": None, "weight": 10, "desc": "List USSD actions"},
    "partners": {"method": "GET", "path": "/partners", "body": None, "weight": 10, "desc": "List partners"},
}

def build_weighted_picker(endpoints: dict) -> list[str]:
    pool = []
    for name, ep in endpoints.items():
        pool.extend([name] * ep["weight"])
    return pool

@dataclass
class EndpointStats:
    name: str
    latencies: list[float] = field(default_factory=list)
    status_codes: dict[int, int] = field(default_factory=dict)
    errors: int = 0

    def record(self, latency_ms: float, status_code: int | None):
        if status_code is not None:
            self.latencies.append(latency_ms)
            self.status_codes[status_code] = self.status_codes.get(status_code, 0) + 1
        else:
            self.errors += 1

    @property
    def total(self) -> int: return len(self.latencies) + self.errors

    def percentile(self, pct: float) -> float:
        if not self.latencies: return 0
        s = sorted(self.latencies)
        return s[min(int(len(s) * pct), len(s) - 1)]

    @property
    def avg(self) -> float:
        return statistics.mean(self.latencies) if self.latencies else 0
    @property
    def count_5xx(self) -> int:
        return sum(v for k, v in self.status_codes.items() if k >= 500)
    @property
    def count_429(self) -> int:
        return self.status_codes.get(429, 0)

@dataclass
class TestRun:
    total_users: int
    active_users: int
    duration_s: float
    start_time: float = 0
    stats: dict[str, EndpointStats] = field(default_factory=dict)

    @property
    def elapsed(self) -> float: return time.time() - self.start_time if self.start_time else 0
    @property
    def total_reqs(self) -> int: return sum(s.total for s in self.stats.values())
    @property
    def total_errors(self) -> int: return sum(s.errors for s in self.stats.values())
    @property
    def total_5xx(self) -> int: return sum(s.count_5xx for s in self.stats.values())
    @property
    def total_429(self) -> int: return sum(s.count_429 for s in self.stats.values())
    @property
    def rps(self) -> float:
        e = self.elapsed
        return self.total_reqs / e if e > 0 else 0
    @property
    def all_latencies(self) -> list[float]:
        out = []
        for s in self.stats.values(): out.extend(s.latencies)
        return out
    def overall_pct(self, p: float) -> float:
        lats = sorted(self.all_latencies)
        if not lats: return 0
        return lats[min(int(len(lats) * p), len(lats) - 1)]

async def simulated_user(user_id: int, client: httpx.AsyncClient, base_url: str, endpoint_pool: list[str], endpoints: dict, run: TestRun, stop: asyncio.Event, ramp_delay: float):
    await asyncio.sleep(ramp_delay)
    while not stop.is_set():
        name = random.choice(endpoint_pool)
        ep = endpoints[name]
        t0 = time.perf_counter()
        try:
            if ep["method"] == "GET":
                resp = await client.get(base_url + ep["path"])
            else:
                resp = await client.post(base_url + ep["path"], json=ep["body"])
            ms = (time.perf_counter() - t0) * 1000
            run.stats[name].record(ms, resp.status_code)
        except Exception:
            run.stats[name].record(0, None)
        
        think = random.uniform(THINK_TIME_MIN, THINK_TIME_MAX)
        try:
            await asyncio.wait_for(stop.wait(), timeout=think)
            break
        except asyncio.TimeoutError:
            pass

def plain_report(run: TestRun) -> str:
    lines = []
    lines.append(f"{'Endpoint':<14} {'Reqs':>6} {'Avg':>8} {'P50':>8} {'P95':>8} {'P99':>8} {'Max':>8} {'Err':>5} {'429':>5} {'5xx':>5}")
    lines.append("-" * 90)
    for name, s in run.stats.items():
        lines.append(
            f"{name:<14} {s.total:>6} {s.avg:>7.0f}ms {s.percentile(0.5):>7.0f}ms "
            f"{s.percentile(0.95):>7.0f}ms {s.percentile(0.99):>7.0f}ms {s.percentile(1.0):>7.0f}ms "
            f"{s.errors:>5} {s.count_429:>5} {s.count_5xx:>5}"
        )
    return "\n".join(lines)

def generate_markdown(all_runs: list[TestRun], target_url: str, filename: str = "loadtest_results.md"):
    lines = [
        "# KWISMO Backend — Load Test Results",
        f"**Date:** {time.strftime('%Y-%m-%d %H:%M %Z')}",
        f"**Target:** `{target_url}`",
        "",
        "## Summary Table",
        "",
        "| Users | Total Reqs | RPS | Avg | P50 | P95 | P99 | Errors | 429s | 5xx |",
        "|------:|-----------:|----:|----:|----:|----:|----:|-------:|-----:|----:|"
    ]
    for r in all_runs:
        avg = statistics.mean(r.all_latencies) if r.all_latencies else 0
        lines.append(
            f"| **{r.total_users}** | {r.total_reqs} | {r.rps:.1f} | **{avg:.0f}ms** | {r.overall_pct(0.5):.0f}ms | {r.overall_pct(0.95):.0f}ms | {r.overall_pct(0.99):.0f}ms | {r.total_errors} | {r.total_429} | {r.total_5xx} |"
        )
    
    final_run = all_runs[-1]
    lines.extend([
        "",
        f"## Per-Endpoint Breakdown ({final_run.total_users} users)",
        "",
        "| Endpoint | Reqs | Avg | P50 | P95 | P99 |",
        "|----------|-----:|----:|----:|----:|----:|"
    ])
    for name, s in final_run.stats.items():
        lines.append(
            f"| `{name}` | {s.total} | **{s.avg:.0f}ms** | {s.percentile(0.5):.0f}ms | {s.percentile(0.95):.0f}ms | {s.percentile(0.99):.0f}ms |"
        )
    
    avg_final = statistics.mean(final_run.all_latencies) if final_run.all_latencies else 0
    verdict = "OK"
    if avg_final > 1000 or final_run.total_5xx > 0:
        verdict = "SLOW / STRUGGLING"
    
    lines.extend([
        "",
        "## Analysis",
        f"> **Verdict: {verdict}** — Avg {avg_final:.0f}ms at {final_run.total_users} users.",
        ""
    ])
    
    pass

async def run_test(base_url: str, total_users: int, active_pct: int, duration_s: float, endpoints: dict) -> TestRun:
    active_users = max(1, int(total_users * active_pct / 100))
    run = TestRun(total_users=total_users, active_users=active_users, duration_s=duration_s)
    for name in endpoints: run.stats[name] = EndpointStats(name=name)
    pool = build_weighted_picker(endpoints)
    stop = asyncio.Event()

    limits = httpx.Limits(max_connections=min(active_users + 20, 500), max_keepalive_connections=min(active_users, 200))

    async with httpx.AsyncClient(limits=limits, timeout=httpx.Timeout(30.0, connect=10.0), follow_redirects=True, http2=True) as client:
        print(f"  Warming up {base_url} ...")
        try:
            r = await client.get(base_url + "/health")
            print(f"  Warm-up: {r.status_code}")
        except Exception as e:
            print(f"  Warm-up failed: {e}")

        run.start_time = time.time()
        tasks = []
        for i in range(active_users):
            ramp_delay = (i / active_users) * RAMP_UP_SECONDS
            tasks.append(asyncio.create_task(simulated_user(i, client, base_url, pool, endpoints, run, stop, ramp_delay)))

        while run.elapsed < duration_s:
            await asyncio.sleep(3)
            print(f"  [{run.elapsed:.0f}s] {run.total_reqs} reqs  |  {run.rps:.1f} rps  |  avg={run.overall_pct(0.5):.0f}ms  p95={run.overall_pct(0.95):.0f}ms")

        stop.set()
        await asyncio.gather(*tasks, return_exceptions=True)
    return run

async def main():
    parser = argparse.ArgumentParser(description="KWISMO Backend -- Realistic Load Tester")
    parser.add_argument("--users", nargs="+", type=int, default=[100, 500])
    parser.add_argument("--active-pct", type=int, default=DEFAULT_ACTIVE_PCT)
    parser.add_argument("--duration", type=int, default=DEFAULT_DURATION)
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--endpoint", nargs="*", default=None)
    args = parser.parse_args()

    selected = {k: ENDPOINTS[k] for k in args.endpoint} if args.endpoint else ENDPOINTS

    print("\n" + "="*70)
    print("  KWISMO Backend -- Realistic Load Tester")
    print("="*70)
    print(f"  Target:      {args.url}")
    print(f"  User levels: {' -> '.join(str(u) for u in args.users)}")
    print(f"  Active rate: {args.active_pct}% (realistic concurrency)")
    print(f"  Duration:    {args.duration}s per level")
    print()

    all_runs: list[TestRun] = []
    for user_count in args.users:
        print(f"\n{'-'*70}")
        print(f"  Level: {user_count} total users")
        print(f"{'-'*70}\n")
        run = await run_test(args.url, user_count, args.active_pct, args.duration, selected)
        all_runs.append(run)
        print(plain_report(run))
        if user_count != args.users[-1]:
            print("\n  Cooling down 5s ...")
            await asyncio.sleep(5)
            
    # Generate Markdown doc and print to console
    print("\n" + "="*70)
    print("  FINAL RESULTS (MARKDOWN FORMAT)")
    print("="*70 + "\n")
    
    lines = [
        "# KWISMO Backend — Load Test Results",
        f"**Date:** {time.strftime('%Y-%m-%d %H:%M %Z')}",
        f"**Target:** `{args.url}`",
        "",
        "## Summary Table",
        "",
        "| Users | Total Reqs | RPS | Avg | P50 | P95 | P99 | Errors | 429s | 5xx |",
        "|------:|-----------:|----:|----:|----:|----:|----:|-------:|-----:|----:|"
    ]
    for r in all_runs:
        avg = statistics.mean(r.all_latencies) if r.all_latencies else 0
        lines.append(
            f"| **{r.total_users}** | {r.total_reqs} | {r.rps:.1f} | **{avg:.0f}ms** | {r.overall_pct(0.5):.0f}ms | {r.overall_pct(0.95):.0f}ms | {r.overall_pct(0.99):.0f}ms | {r.total_errors} | {r.total_429} | {r.total_5xx} |"
        )
    
    final_run = all_runs[-1]
    lines.extend([
        "",
        f"## Per-Endpoint Breakdown ({final_run.total_users} users)",
        "",
        "| Endpoint | Reqs | Avg | P50 | P95 | P99 |",
        "|----------|-----:|----:|----:|----:|----:|"
    ])
    for name, s in final_run.stats.items():
        lines.append(
            f"| `{name}` | {s.total} | **{s.avg:.0f}ms** | {s.percentile(0.5):.0f}ms | {s.percentile(0.95):.0f}ms | {s.percentile(0.99):.0f}ms |"
        )
    
    avg_final = statistics.mean(final_run.all_latencies) if final_run.all_latencies else 0
    verdict = "OK"
    if avg_final > 1000 or final_run.total_5xx > 0:
        verdict = "SLOW / STRUGGLING"
    
    lines.extend([
        "",
        "## Analysis",
        f"> **Verdict: {verdict}** — Avg {avg_final:.0f}ms at {final_run.total_users} users.",
        ""
    ])
    
    markdown_output = "\n".join(lines)
    print(markdown_output)
    
if __name__ == "__main__":
    asyncio.run(main())
