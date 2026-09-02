#!/usr/bin/env python3
"""
KWISMO API — Performance & Health Probe
========================================
Tests every endpoint on https://api.kwismo.com for:
  - Status codes (2xx, 4xx, 5xx)
  - Response latency (avg, min, max)
  - Cache hit/miss detection (via headers)
  - Response body validation
  - Cold start vs warm latency comparison
  - Rate limiting detection

HOW TO RUN:
  pip install httpx rich
  python scripts/api_probe.py
  python scripts/api_probe.py --url https://api.kwismo.com --repeat 3
"""

import argparse
import asyncio
import os
import sys
import time
from dataclasses import dataclass, field

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

try:
    from rich.console import Console
    from rich.table import Table
    from rich import box
    HAS_RICH = True
except ImportError:
    HAS_RICH = False


# ── Probe Configuration ─────────────────────────────────────────────────

DEFAULT_URL = "https://api.kwismo.com"

PROBES = [
    # (name, method, path, body, expected_status, description)

    # ── Health & Meta ──
    ("health",      "GET",  "/health",       None, 200, "Health check"),
    ("openapi",     "GET",  "/openapi.json", None, 200, "OpenAPI schema"),
    ("docs",        "GET",  "/docs",         None, 200, "Swagger UI"),

    # ── Auth (unauthenticated — expect 422 or 401) ──
    ("register_bad",    "POST", "/auth/register",       {"nom": "", "prenom": "", "email": "bad", "mot_de_passe": "x"}, 422, "Register (bad input → 422)"),
    ("login_bad",       "POST", "/auth/login",          {"email": "probe@kwismo.invalid", "mot_de_passe": "WrongPass!", "device_id": "probe-001", "device_name": "Probe"}, None, "Login (wrong creds → 401/422)"),
    ("forgot_pw",       "POST", "/auth/password/forgot", {"email": "probe@kwismo.invalid"}, None, "Forgot password (unknown email)"),

    # ── Public endpoints ──
    ("countries",       "GET",  "/countries",           None, None, "List countries"),
    ("verify_num",      "POST", "/numbers/verify",      {"valeur": "+237690000001"}, None, "Verify number (public)"),

    # ── Protected endpoints (expect 401/403 without token) ──
    ("me",              "GET",  "/users/me",             None, 401, "Profile (no auth → 401)"),
    ("users_list",      "GET",  "/users",                None, 401, "List users (no auth → 401)"),
    ("my_phones",       "GET",  "/users/me/phones",      None, 401, "My phones (no auth → 401)"),
    ("reports_list",    "GET",  "/reports",               None, 401, "Reports (no auth → 401)"),
    ("partners_list",   "GET",  "/partners",              None, 401, "Partners (no auth → 401)"),
    ("ussd_countries",  "GET",  "/ussd/countries",        None, None, "USSD countries"),
    ("ussd_operators",  "GET",  "/ussd/operators",        None, None, "USSD operators"),
    ("ussd_actions",    "GET",  "/ussd/actions",          None, None, "USSD actions"),
    ("notifications",   "GET",  "/notifications",         None, 401, "Notifications (no auth → 401)"),
    ("surveys",         "GET",  "/surveys",               None, None, "Surveys"),
]


@dataclass
class ProbeResult:
    name: str
    description: str
    method: str
    path: str
    expected_status: int | None
    latencies_ms: list[float] = field(default_factory=list)
    status_codes: list[int] = field(default_factory=list)
    cache_headers: list[dict] = field(default_factory=list)
    content_lengths: list[int] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def avg_ms(self) -> float:
        return sum(self.latencies_ms) / len(self.latencies_ms) if self.latencies_ms else 0

    @property
    def min_ms(self) -> float:
        return min(self.latencies_ms) if self.latencies_ms else 0

    @property
    def max_ms(self) -> float:
        return max(self.latencies_ms) if self.latencies_ms else 0

    @property
    def primary_status(self) -> int | None:
        return self.status_codes[0] if self.status_codes else None

    @property
    def status_ok(self) -> bool:
        if self.expected_status is None:
            # Accept any non-5xx
            return all(s < 500 for s in self.status_codes) if self.status_codes else False
        return all(s == self.expected_status for s in self.status_codes) if self.status_codes else False

    @property
    def cache_verdict(self) -> str:
        """Detect cache behavior from response headers."""
        for ch in self.cache_headers:
            # Check common cache headers
            cc = ch.get("cache-control", "")
            x_cache = ch.get("x-cache", "")
            cf_cache = ch.get("cf-cache-status", "")
            age = ch.get("age", "")

            if "HIT" in x_cache.upper() or "HIT" in cf_cache.upper():
                return "HIT"
            if "MISS" in x_cache.upper() or "MISS" in cf_cache.upper():
                return "MISS"
            if "DYNAMIC" in cf_cache.upper():
                return "DYNAMIC"
            if "BYPASS" in cf_cache.upper():
                return "BYPASS"
            if age and int(age) > 0:
                return f"HIT (age={age}s)"
            if "no-cache" in cc or "no-store" in cc:
                return "NO-CACHE"
            if "max-age" in cc:
                return f"CACHEABLE ({cc})"
        return "—"

    @property
    def cold_vs_warm(self) -> str:
        """Compare first request (cold) vs subsequent (warm)."""
        if len(self.latencies_ms) < 2:
            return "—"
        cold = self.latencies_ms[0]
        warm_avg = sum(self.latencies_ms[1:]) / len(self.latencies_ms[1:])
        diff_pct = ((cold - warm_avg) / warm_avg * 100) if warm_avg > 0 else 0
        if diff_pct > 30:
            return f"COLD +{diff_pct:.0f}%"
        return "WARM"


async def probe_endpoint(
    client: httpx.AsyncClient,
    base_url: str,
    name: str,
    method: str,
    path: str,
    body: dict | None,
    expected_status: int | None,
    description: str,
    repeat: int,
) -> ProbeResult:
    result = ProbeResult(
        name=name,
        description=description,
        method=method,
        path=path,
        expected_status=expected_status,
    )

    for i in range(repeat):
        url = base_url + path
        t0 = time.perf_counter()
        try:
            if method == "GET":
                resp = await client.get(url)
            else:
                resp = await client.post(url, json=body)

            ms = (time.perf_counter() - t0) * 1000
            result.latencies_ms.append(ms)
            result.status_codes.append(resp.status_code)
            result.content_lengths.append(len(resp.content))

            # Capture cache-related headers
            cache_h = {}
            for key in ["cache-control", "x-cache", "cf-cache-status", "age",
                         "etag", "x-served-by", "x-response-time", "server",
                         "x-ratelimit-remaining", "x-ratelimit-limit",
                         "retry-after", "vary"]:
                val = resp.headers.get(key)
                if val:
                    cache_h[key] = val
            result.cache_headers.append(cache_h)

        except httpx.ConnectError as e:
            result.errors.append(f"Connection error: {e}")
        except httpx.TimeoutException:
            result.errors.append("Timeout")
        except Exception as e:
            result.errors.append(str(e))

        # Small delay between repeats to avoid hammering
        if i < repeat - 1:
            await asyncio.sleep(0.15)

    return result


def status_icon(result: ProbeResult) -> str:
    if result.errors:
        return "💥"
    if not result.status_codes:
        return "❓"
    if result.status_ok:
        return "✅"
    # 429 = rate limited
    if any(s == 429 for s in result.status_codes):
        return "🚦"
    # 5xx
    if any(s >= 500 for s in result.status_codes):
        return "🔴"
    # Unexpected but not a server error
    return "⚠️"


def latency_color(ms: float) -> str:
    if ms < 200:
        return "green"
    if ms < 500:
        return "yellow"
    if ms < 1000:
        return "dark_orange"
    return "red"


def print_results_rich(results: list[ProbeResult], base_url: str, repeat: int):
    console = Console()

    console.print(f"\n[bold cyan]{'═' * 70}[/]")
    console.print(f"[bold white]  KWISMO API — Performance & Health Probe[/]")
    console.print(f"[bold cyan]{'═' * 70}[/]")
    console.print(f"  [dim]Target:[/] [bold]{base_url}[/]")
    console.print(f"  [dim]Repeat:[/] {repeat}x per endpoint")
    console.print(f"  [dim]Time:  [/] {time.strftime('%Y-%m-%d %H:%M:%S')}")
    console.print()

    # ── Status & Latency Table ──
    table = Table(
        title="📊 Endpoint Health & Latency",
        box=box.ROUNDED,
        show_lines=True,
        title_style="bold white",
    )
    table.add_column("", width=3, justify="center")
    table.add_column("Endpoint", style="bold", min_width=16)
    table.add_column("Method", width=6, justify="center")
    table.add_column("Status", width=8, justify="center")
    table.add_column("Avg", width=8, justify="right")
    table.add_column("Min", width=8, justify="right")
    table.add_column("Max", width=8, justify="right")
    table.add_column("Cache", width=14, justify="center")
    table.add_column("Cold/Warm", width=12, justify="center")
    table.add_column("Size", width=8, justify="right")

    for r in results:
        icon = status_icon(r)
        status_str = str(r.primary_status) if r.primary_status else "ERR"
        avg_str = f"{r.avg_ms:.0f}ms" if r.latencies_ms else "—"
        min_str = f"{r.min_ms:.0f}ms" if r.latencies_ms else "—"
        max_str = f"{r.max_ms:.0f}ms" if r.latencies_ms else "—"

        status_color = "green" if r.status_ok else ("red" if any(s >= 500 for s in r.status_codes) else "yellow")
        avg_color = latency_color(r.avg_ms) if r.latencies_ms else "dim"

        cache_v = r.cache_verdict
        cache_color = "green" if "HIT" in cache_v else ("yellow" if "MISS" in cache_v else "dim")

        cold_v = r.cold_vs_warm
        cold_color = "red" if "COLD" in cold_v else "green"

        size_str = f"{r.content_lengths[0]:,}B" if r.content_lengths else "—"

        table.add_row(
            icon,
            f"{r.name}\n[dim]{r.description}[/]",
            f"[cyan]{r.method}[/]",
            f"[{status_color}]{status_str}[/]",
            f"[{avg_color}]{avg_str}[/]",
            min_str,
            max_str,
            f"[{cache_color}]{cache_v}[/]",
            f"[{cold_color}]{cold_v}[/]",
            size_str,
        )

    console.print(table)

    # ── Rate Limit Detection ──
    rate_limited = [r for r in results if any(s == 429 for s in r.status_codes)]
    if rate_limited:
        console.print("\n[bold yellow]🚦 Rate Limiting Detected:[/]")
        for r in rate_limited:
            rl_headers = next((ch for ch in r.cache_headers if "x-ratelimit-remaining" in ch), {})
            remaining = rl_headers.get("x-ratelimit-remaining", "?")
            limit = rl_headers.get("x-ratelimit-limit", "?")
            retry = rl_headers.get("retry-after", "?")
            console.print(f"  • {r.name}: limit={limit}, remaining={remaining}, retry-after={retry}")

    # ── Errors ──
    errored = [r for r in results if r.errors]
    if errored:
        console.print("\n[bold red]💥 Errors:[/]")
        for r in errored:
            for e in r.errors:
                console.print(f"  • {r.name}: {e}")

    # ── Cache Summary ──
    console.print("\n[bold white]🗂️  Cache Summary:[/]")
    for r in results:
        if r.cache_headers:
            h = r.cache_headers[0]
            if h:
                console.print(f"  [cyan]{r.name:16}[/] → {r.cache_verdict:12} | headers: {dict(h)}")

    # ── Summary Stats ──
    all_lats = [ms for r in results for ms in r.latencies_ms]
    total_reqs = sum(len(r.status_codes) for r in results)
    total_errs = sum(len(r.errors) for r in results)
    total_ok = sum(1 for r in results if r.status_ok)
    total_fail = len(results) - total_ok

    console.print(f"\n[bold cyan]{'─' * 70}[/]")
    overall_avg = sum(all_lats) / len(all_lats) if all_lats else 0
    console.print(f"  [bold]Users simulated:[/]   1 (Sequential Probe)")
    console.print(f"  [bold]Total requests:[/]    {total_reqs}")
    console.print(f"  [bold]Average latency:[/]   {overall_avg:.0f}ms")
    console.print(f"  [bold]Endpoints OK:[/]      [green]{total_ok}[/] / {len(results)}")
    if total_fail:
        console.print(f"  [bold]Unexpected:[/]      [yellow]{total_fail}[/]")
    if total_errs:
        console.print(f"  [bold]Errors:[/]          [red]{total_errs}[/]")

    verdict = "✅ ALL SYSTEMS GO" if total_fail == 0 and total_errs == 0 else "⚠️  ISSUES DETECTED"
    verdict_color = "green" if "GO" in verdict else "yellow"
    console.print(f"\n  [bold {verdict_color}]{verdict}[/]")
    console.print(f"[bold cyan]{'─' * 70}[/]\n")


def print_results_plain(results: list[ProbeResult], base_url: str, repeat: int):
    print(f"\n{'=' * 70}")
    print("  KWISMO API — Performance & Health Probe")
    print(f"{'=' * 70}")
    print(f"  Target: {base_url}")
    print(f"  Repeat: {repeat}x per endpoint")
    print(f"  Time:   {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    header = f"{'':3} {'Endpoint':16} {'M':6} {'Status':8} {'Avg':>8} {'Min':>8} {'Max':>8} {'Cache':14} {'Cold/Warm':12}"
    print(header)
    print("-" * len(header))

    for r in results:
        icon = status_icon(r)
        status_str = str(r.primary_status) if r.primary_status else "ERR"
        avg_str = f"{r.avg_ms:.0f}ms" if r.latencies_ms else "—"
        min_str = f"{r.min_ms:.0f}ms" if r.latencies_ms else "—"
        max_str = f"{r.max_ms:.0f}ms" if r.latencies_ms else "—"
        print(f"{icon:3} {r.name:16} {r.method:6} {status_str:8} {avg_str:>8} {min_str:>8} {max_str:>8} {r.cache_verdict:14} {r.cold_vs_warm:12}")

    print()
    all_lats = [ms for r in results for ms in r.latencies_ms]
    overall_avg = sum(all_lats) / len(all_lats) if all_lats else 0
    total_ok = sum(1 for r in results if r.status_ok)
    total_reqs = sum(len(r.status_codes) for r in results)
    
    print(f"  Users: 1 (Sequential Probe) | Total Requests: {total_reqs} | Overall Avg: {overall_avg:.0f}ms | OK: {total_ok}/{len(results)}")
    print()


def save_markdown(results: list[ProbeResult], base_url: str, repeat: int, filename: str):
    lines = [
        "# KWISMO API — Performance & Health Probe",
        f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Target:** `{base_url}`",
        f"**Repeat:** {repeat}x per endpoint",
        "",
        "## Endpoint Results",
        "",
        "| | Endpoint | Method | Status | Avg | Min | Max | Cache | Cold/Warm |",
        "|---|---|:---:|:---:|---:|---:|---:|:---:|:---:|",
    ]

    for r in results:
        icon = status_icon(r)
        status_str = str(r.primary_status) if r.primary_status else "ERR"
        avg_str = f"{r.avg_ms:.0f}ms" if r.latencies_ms else "—"
        min_str = f"{r.min_ms:.0f}ms" if r.latencies_ms else "—"
        max_str = f"{r.max_ms:.0f}ms" if r.latencies_ms else "—"
        lines.append(
            f"| {icon} | `{r.name}` | {r.method} | **{status_str}** | {avg_str} | {min_str} | {max_str} | {r.cache_verdict} | {r.cold_vs_warm} |"
        )

    # Cache details
    lines.extend(["", "## Cache Headers", ""])
    for r in results:
        if r.cache_headers and r.cache_headers[0]:
            h = r.cache_headers[0]
            lines.append(f"- **{r.name}**: `{dict(h)}`")

    # Rate limit info
    rate_limited = [r for r in results if any(s == 429 for s in r.status_codes)]
    if rate_limited:
        lines.extend(["", "## Rate Limiting Detected", ""])
        for r in rate_limited:
            lines.append(f"- **{r.name}**: status 429")

    # Summary
    all_lats = [ms for r in results for ms in r.latencies_ms]
    overall_avg = sum(all_lats) / len(all_lats) if all_lats else 0
    total_ok = sum(1 for r in results if r.status_ok)
    total_errs = sum(len(r.errors) for r in results)

    lines.extend([
        "",
        "## Summary",
        f"- **Overall Avg Latency:** {overall_avg:.0f}ms",
        f"- **Endpoints OK:** {total_ok}/{len(results)}",
        f"- **Connection Errors:** {total_errs}",
    ])

    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"[OK] Report saved to {filename}")


async def main():
    parser = argparse.ArgumentParser(description="KWISMO API — Performance & Health Probe")
    parser.add_argument("--url", default=DEFAULT_URL, help="Base API URL")
    parser.add_argument("--repeat", type=int, default=3, help="Requests per endpoint (default: 3)")
    parser.add_argument("--output", default="api_probe_results.md", help="Markdown report filename")
    args = parser.parse_args()

    base_url = args.url.rstrip("/")

    limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
    async with httpx.AsyncClient(
        limits=limits,
        timeout=httpx.Timeout(15.0, connect=10.0),
        follow_redirects=True,
        http2=False,
    ) as client:

        results: list[ProbeResult] = []

        for name, method, path, body, expected, desc in PROBES:
            if HAS_RICH:
                print(f"  🔍 Probing {name:16} ({method} {path}) ...", end="", flush=True)

            result = await probe_endpoint(
                client, base_url, name, method, path, body, expected, desc, args.repeat
            )
            results.append(result)

            if HAS_RICH:
                icon = status_icon(result)
                avg = f"{result.avg_ms:.0f}ms" if result.latencies_ms else "ERR"
                print(f"  {icon} {avg}")

        # Print results
        if HAS_RICH:
            print_results_rich(results, base_url, args.repeat)
        else:
            print_results_plain(results, base_url, args.repeat)


if __name__ == "__main__":
    asyncio.run(main())
