# KWISMO Backend — Load Test Results
**Date:** 2026-08-21 12:22 W. Central Africa Standard Time
**Target:** `https://kwismo-backend-production.up.railway.app`

## Summary Table

| Users | Total Reqs | RPS | Avg | P50 | P95 | P99 | Errors | 429s | 5xx |
|------:|-----------:|----:|----:|----:|----:|----:|-------:|-----:|----:|
| **100** | 136 | 4.5 | **764ms** | 687ms | 1591ms | 1766ms | 0 | 0 | 0 |

## Per-Endpoint Breakdown (100 users)

| Endpoint | Reqs | Avg | P50 | P95 | P99 |
|----------|-----:|----:|----:|----:|----:|
| `health` | 1 | **1262ms** | 1262ms | 1262ms | 1262ms |
| `countries` | 31 | **848ms** | 733ms | 1766ms | 2017ms |
| `login` | 33 | **761ms** | 687ms | 1591ms | 1644ms |
| `register` | 10 | **892ms** | 913ms | 1627ms | 1627ms |
| `verify_num` | 44 | **665ms** | 611ms | 1174ms | 1445ms |
| `docs` | 8 | **619ms** | 673ms | 1116ms | 1116ms |
| `openapi` | 9 | **905ms** | 831ms | 1596ms | 1596ms |

## Analysis
> **Verdict: OK** — Avg 764ms at 100 users.
