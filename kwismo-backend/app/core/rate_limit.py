"""Limitation de debit — anti brute-force, anti DoS. / Rate limiting — anti brute-force, anti DoS.

FR — Cf. cahier des charges Backend §8.1 ("Anti-force brute : limitation des
tentatives de connexion, de vérification d'OTP et d'ajout de numéros") et
§8.5 ("Limitation de débit : plafonnement des requêtes par IP/utilisateur").

Deux niveaux :
- `limiter` avec une limite par defaut appliquee a TOUTES les routes (protege
  contre la surcharge / les requetes en masse) ;
- `AUTH_RATE_LIMIT` / `OTP_RATE_LIMIT`, des limites plus strictes a apposer
  explicitement sur les routes sensibles (login, OTP, mot de passe, ajout de
  numero) via le decorateur `@limiter.limit(...)`.

Stockage : "memory://" par defaut (aucune dependance externe, ne peut jamais
empecher le demarrage si Redis est indisponible). Passer RATE_LIMIT_STORAGE_URI
a l'URL Redis en production multi-workers pour partager les compteurs entre
processus Gunicorn.

EN — See Backend spec §8.1 ("Anti brute-force: rate limiting login attempts,
OTP verification and number additions") and §8.5 ("Rate limiting: capping
requests per IP/user").

Two tiers:
- `limiter` with a default limit applied to EVERY route (guards against
  overload / mass requests);
- `AUTH_RATE_LIMIT` / `OTP_RATE_LIMIT`, stricter limits to apply explicitly on
  sensitive routes (login, OTP, password, adding a number) via the
  `@limiter.limit(...)` decorator.

Storage: "memory://" by default (no external dependency, can never block
startup if Redis is down). Set RATE_LIMIT_STORAGE_URI to the Redis URL in a
multi-worker production deployment to share counters across Gunicorn workers.
"""

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import get_settings
from app.core.schemas import ErrorResponse

settings = get_settings()

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.rate_limit_storage_uri,
    default_limits=[settings.rate_limit_default],
    headers_enabled=True,  # expose X-RateLimit-* pour que le client sache où il en est
)

# A apposer sur /auth/login, /auth/refresh, /auth/password/*... (brute-force mot de passe/jeton)
AUTH_RATE_LIMIT = settings.rate_limit_auth

# A apposer sur les endpoints d'envoi/verification d'OTP (email ET sms)
OTP_RATE_LIMIT = settings.rate_limit_otp


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Reponse bilingue 429, coherente avec le reste de l'API. / Bilingual 429 response, consistent with the rest of the API."""

    body = ErrorResponse(
        code="rate_limited",
        message_fr="Trop de requêtes. Réessayez plus tard.",
        message_en="Too many requests. Try again later.",
    )
    return JSONResponse(status_code=429, content=body.model_dump())
