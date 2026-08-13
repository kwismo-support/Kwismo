"""Limitation de debit — anti brute-force, anti DoS. / Rate limiting — anti brute-force, anti DoS.

FR — Une limite par defaut sur toutes les routes, plus deux limites plus
strictes (`AUTH_RATE_LIMIT`, `OTP_RATE_LIMIT`) a poser sur les routes
sensibles via `@limiter.limit(...)`. Stockage "memory://" par defaut (aucune
dependance externe) ; passer a Redis en production multi-workers.
EN — A default limit on every route, plus two stricter limits
(`AUTH_RATE_LIMIT`, `OTP_RATE_LIMIT`) to apply on sensitive routes via
`@limiter.limit(...)`. Defaults to "memory://" storage (no external
dependency); switch to Redis in a multi-worker production setup.
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
