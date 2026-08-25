# KWISMO API — Performance & Health Probe
**Date:** 2026-08-24 11:44:14
**Target:** `https://api.kwismo.com`
**Repeat:** 3x per endpoint

## Endpoint Results

| | Endpoint | Method | Status | Avg | Min | Max | Cache | Cold/Warm |
|---|---|:---:|:---:|---:|---:|---:|:---:|:---:|
| ✅ | `health` | GET | **200** | 501ms | 169ms | 1143ms | — | COLD +534% |
| ✅ | `openapi` | GET | **200** | 262ms | 239ms | 306ms | — | WARM |
| ✅ | `docs` | GET | **200** | 194ms | 167ms | 247ms | — | WARM |
| ✅ | `register_bad` | POST | **422** | 374ms | 186ms | 629ms | — | WARM |
| ✅ | `login_bad` | POST | **422** | 192ms | 171ms | 223ms | — | WARM |
| ✅ | `forgot_pw` | POST | **422** | 324ms | 206ms | 448ms | — | WARM |
| ✅ | `countries` | GET | **200** | 500ms | 172ms | 723ms | — | COLD +86% |
| ✅ | `verify_num` | POST | **401** | 190ms | 181ms | 199ms | — | WARM |
| ✅ | `me` | GET | **401** | 208ms | 173ms | 261ms | — | COLD +44% |
| ✅ | `users_list` | GET | **401** | 181ms | 163ms | 197ms | — | WARM |
| ✅ | `my_phones` | GET | **401** | 188ms | 172ms | 200ms | — | WARM |
| ✅ | `reports_list` | GET | **401** | 197ms | 176ms | 230ms | — | WARM |
| ✅ | `partners_list` | GET | **401** | 175ms | 164ms | 184ms | — | WARM |
| ✅ | `ussd_countries` | GET | **404** | 169ms | 166ms | 170ms | — | WARM |
| ✅ | `ussd_operators` | GET | **404** | 169ms | 164ms | 172ms | — | WARM |
| ✅ | `ussd_actions` | GET | **404** | 172ms | 171ms | 174ms | — | WARM |
| ✅ | `notifications` | GET | **401** | 178ms | 165ms | 195ms | — | WARM |
| ✅ | `surveys` | GET | **404** | 186ms | 171ms | 208ms | — | WARM |

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
- **Overall Avg Latency:** 242ms
- **Endpoints OK:** 18/18
- **Connection Errors:** 0