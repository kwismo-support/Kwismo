"""Blacklist des refresh tokens via Redis.

FR — Stocke les tokens revolques dans Redis avec un TTL egal a leur duree de
vie restante. Repli gracieux sur une liste memoire si Redis est indisponible
(dev sans Redis). Un nouveau client est cree a chaque echec de connexion pour
permettre la reconnexion automatique apres un redemarrage Redis.
EN — Stores revoked tokens in Redis with a TTL equal to their remaining
lifetime. Gracefully falls back to an in-memory set if Redis is unavailable
(dev without Redis). A new client is created on each connection failure to
allow automatic reconnection after a Redis restart.
"""

import logging

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")

_BLACKLIST_PREFIX = "kwismo:rt:blacklist:"
_fallback: set[str] = set()

# Client module-level — None tant qu'il n'a pas ete cree, False si Redis
# est definitivement indisponible en dev (evite de retenter en boucle).
_redis_client: Redis | None | bool = None


def _get_redis() -> Redis | None:
    """Retourne le client Redis, en le creant si necessaire."""
    global _redis_client
    if _redis_client is False:
        return None
    if _redis_client is None:
        try:
            _redis_client = Redis.from_url(
                get_settings().redis_url,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
        except Exception as exc:
            logger.warning("Impossible de creer le client Redis : %s", exc)
            _redis_client = False
            return None
    return _redis_client


def _reset_redis() -> None:
    """Reinitialise le client pour forcer une reconnexion au prochain appel."""
    global _redis_client
    _redis_client = None


async def revoke_token(jti: str, ttl_seconds: int) -> None:
    """Ajoute un token a la blacklist avec TTL."""
    key = _BLACKLIST_PREFIX + jti
    client = _get_redis()
    if client is not None:
        try:
            await client.setex(key, max(ttl_seconds, 1), "1")
            return
        except RedisError as exc:
            logger.warning("Redis indisponible, repli memoire pour la blacklist : %s", exc)
            _reset_redis()
    _fallback.add(jti)


async def is_revoked(jti: str) -> bool:
    """Verifie si un token est revolque."""
    if jti in _fallback:
        return True
    client = _get_redis()
    if client is not None:
        try:
            return await client.exists(_BLACKLIST_PREFIX + jti) == 1
        except RedisError as exc:
            logger.warning("Redis indisponible, verification blacklist memoire uniquement : %s", exc)
            _reset_redis()
    return False
