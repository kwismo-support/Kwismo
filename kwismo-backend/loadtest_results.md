# KWISMO Backend — Load Test Results
**Date:** 2026-08-24 12:08 W. Central Africa Standard Time
**Target:** `https://api.kwismo.com`

## Summary Table

| Users | Total Reqs | RPS | Avg | P50 | P95 | P99 | Errors | 429s | 5xx |
|------:|-----------:|----:|----:|----:|----:|----:|-------:|-----:|----:|
| **10000** | 1006 | 33.2 | **454ms** | 351ms | 1025ms | 1264ms | 1 | 0 | 0 |

## Per-Endpoint Breakdown (10000 users)

| Endpoint | Reqs | Avg | P50 | P95 | P99 |
|----------|-----:|----:|----:|----:|----:|
| `health` | 53 | **481ms** | 344ms | 1114ms | 1231ms |
| `countries` | 90 | **530ms** | 387ms | 1259ms | 1420ms |
| `login` | 124 | **451ms** | 350ms | 1034ms | 1215ms |
| `register` | 50 | **467ms** | 359ms | 923ms | 1289ms |
| `verify_num` | 179 | **449ms** | 355ms | 966ms | 1264ms |
| `reports_list` | 217 | **445ms** | 356ms | 1046ms | 1219ms |
| `surveys` | 100 | **422ms** | 325ms | 1056ms | 1236ms |
| `ussd_actions` | 96 | **422ms** | 351ms | 962ms | 1092ms |
| `partners` | 97 | **457ms** | 325ms | 1010ms | 1325ms |

## Analysis
> **Verdict: OK** — Avg 454ms at 10000 users.
