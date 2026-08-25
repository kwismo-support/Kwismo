# KWISMO API — Performance & Health Probe
**Date:** 2026-08-24 11:30:24
**Target:** `https://api.kwismo.com`
**Repeat:** 3x per endpoint

## Endpoint Results

| | Endpoint | Method | Status | Avg | Min | Max | Cache | Cold/Warm |
|---|---|:---:|:---:|---:|---:|---:|:---:|:---:|
| ✅ | `health` | GET | **200** | 4127ms | 3047ms | 5702ms | — | COLD +71% |
| ✅ | `openapi` | GET | **200** | 3674ms | 2016ms | 4606ms | — | COLD +33% |
| ✅ | `docs` | GET | **200** | 618ms | 485ms | 820ms | — | COLD +59% |
| ✅ | `register_bad` | POST | **422** | 955ms | 889ms | 1038ms | — | WARM |
| ✅ | `login_bad` | POST | **422** | 787ms | 212ms | 1784ms | — | COLD +518% |
| ✅ | `forgot_pw` | POST | **422** | 880ms | 269ms | 1703ms | — | WARM |
| ✅ | `countries` | GET | **200** | 2142ms | 1317ms | 3163ms | — | COLD +94% |
| ✅ | `verify_num` | POST | **401** | 574ms | 313ms | 944ms | — | COLD +143% |
| ✅ | `me` | GET | **401** | 826ms | 601ms | 1019ms | — | WARM |
| ✅ | `users_list` | GET | **401** | 1070ms | 861ms | 1394ms | — | WARM |
| ✅ | `my_phones` | GET | **401** | 598ms | 441ms | 760ms | — | COLD +47% |
| ✅ | `reports_list` | GET | **401** | 563ms | 462ms | 723ms | — | WARM |
| ✅ | `partners_list` | GET | **401** | 503ms | 264ms | 768ms | — | COLD +107% |
| ✅ | `ussd_countries` | GET | **404** | 599ms | 485ms | 794ms | — | WARM |
| ✅ | `ussd_operators` | GET | **404** | 1093ms | 824ms | 1285ms | — | WARM |
| ✅ | `ussd_actions` | GET | **404** | 752ms | 551ms | 984ms | — | WARM |
| ✅ | `notifications` | GET | **401** | 1426ms | 706ms | 2019ms | — | WARM |
| ✅ | `surveys` | GET | **404** | 2397ms | 613ms | 3629ms | — | WARM |

## Cache Headers

- **health**: `{'server': 'railway-hikari', 'x-ratelimit-remaining': '99', 'x-ratelimit-limit': '100', 'retry-after': '60'}`
- **openapi**: `{'server': 'railway-hikari', 'x-ratelimit-remaining': '99', 'x-ratelimit-limit': '100', 'retry-after': '60', 'vary': 'Accept-Encoding'}`
- **docs**: `{'server': 'railway-hikari', 'x-ratelimit-remaining': '99', 'x-ratelimit-limit': '100', 'retry-after': '60', 'vary': 'accept-encoding'}`
- **register_bad**: `{'server': 'railway-hikari', 'vary': 'accept-encoding'}`
- **login_bad**: `{'server': 'railway-hikari', 'vary': 'accept-encoding'}`
- **forgot_pw**: `{'server': 'railway-hikari', 'vary': 'accept-encoding'}`
- **countries**: `{'server': 'railway-hikari', 'vary': 'accept-encoding'}`
- **verify_num**: `{'server': 'railway-hikari'}`
- **me**: `{'server': 'railway-hikari'}`
- **users_list**: `{'server': 'railway-hikari'}`
- **my_phones**: `{'server': 'railway-hikari'}`
- **reports_list**: `{'server': 'railway-hikari'}`
- **partners_list**: `{'server': 'railway-hikari'}`
- **ussd_countries**: `{'server': 'railway-hikari'}`
- **ussd_operators**: `{'server': 'railway-hikari'}`
- **ussd_actions**: `{'server': 'railway-hikari'}`
- **notifications**: `{'server': 'railway-hikari'}`
- **surveys**: `{'server': 'railway-hikari'}`

## Summary
- **Overall Avg Latency:** 1310ms
- **Endpoints OK:** 18/18
- **Connection Errors:** 0