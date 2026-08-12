"""Blacklist des refresh tokens via Redis. / Refresh token blacklist via Redis.

FR — Stocke les tokens revolques dans Redis avec un TTL egal a leur duree de
vie restante. Repli gracieux sur une liste memoire si Redis est indisponible
(dev sans Redis). Utilise par auth.service : logout, refresh, et
get_current_user pour le refresh token.
EN — Stores revoked tokens in Redis with a TTL equal to their remaining
lifetime. Gracefully falls back to an in-memory set if Redis is unavailable
(dev without Redis). Used by auth.service: logout, refresh, and
get_current_user for the refresh token.
"""

import logging
from functools import lru_cache

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")

_BLACKLIST_PREFIX = "kwismo:rt:blacklist:"
_fallback: set[str] = set()


@lru_cache
def _redis() -> Redis:
    return Redis.from_url(get_settings().redis_url, decode_responses=True)


async def revoke_token(jti: str, ttl_seconds: int) -> None:
    """Ajoute un token a la blacklist avec TTL. / Adds a token to the blacklist with TTL."""
    key = _BLACKLIST_PREFIX + jti
    try:
        await _redis().setex(key, ttl_seconds, "1")
    except RedisError as exc:
        logger.warning("Redis indisponible, repli memoire pour la blacklist : %s", exc)
        _fallback.add(jti)


async def is_revoked(jti: str) -> bool:
    """Verifie si un token est revolque. / Checks whether a token is revoked."""
    if jti in _fallback:
        return True
    try:
        return await _redis().exists(_BLACKLIST_PREFIX + jti) == 1
    except RedisError as exc:
        logger.warning("Redis indisponible, verification blacklist impossible : %s", exc)
        return False
