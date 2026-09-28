"""Cache Redis wrapper avec fallback mémoire."""

import json
import logging
from typing import Any, Callable

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")
settings = get_settings()

_redis_client = None
_redis_disabled = False
_memory_cache: dict[str, Any] = {}


def get_redis_client():
    global _redis_client, _redis_disabled
    if _redis_disabled:
        return None
    if _redis_client is None:
        try:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=1.0,
                socket_connect_timeout=1.0,
            )
        except Exception as e:
            logger.info("Redis unavailable, using memory cache fallback.")
            _redis_disabled = True
            _redis_client = None
    return _redis_client


async def get_cached(
    key: str,
    fetcher: Callable,
    ttl: int = 3600,
) -> Any:
    """Récupère depuis le cache Redis ou exécute fetcher() et cache le résultat.
    
    Args:
        key: clé de cache
        fetcher: fonction async qui retourne la valeur si cache miss
        ttl: durée de vie en secondes (défaut 1h)
    """
    global _redis_disabled
    client = get_redis_client()
    
    if client and not _redis_disabled:
        try:
            cached = await client.get(key)
            if cached:
                return json.loads(cached)
        except Exception:
            _redis_disabled = True
            client = None

    if key in _memory_cache:
        return _memory_cache[key]
    
    value = await fetcher()
    
    if client and not _redis_disabled:
        try:
            await client.set(key, json.dumps(value, default=str), ex=ttl)
        except Exception:
            _redis_disabled = True

    _memory_cache[key] = value
    
    return value


async def invalidate_cache(key: str) -> None:
    """Invalide une entrée du cache."""
    global _redis_disabled
    client = get_redis_client()
    
    if client and not _redis_disabled:
        try:
            await client.delete(key)
        except Exception:
            _redis_disabled = True
    _memory_cache.pop(key, None)


async def invalidate_pattern(pattern: str) -> None:
    """Invalide toutes les clés matchant le pattern (Redis uniquement)."""
    global _redis_disabled
    client = get_redis_client()
    
    if client and not _redis_disabled:
        try:
            keys = []
            async for key in client.scan_iter(match=pattern):
                keys.append(key)
            if keys:
                await client.delete(*keys)
        except Exception:
            _redis_disabled = True
    
    to_delete = [k for k in _memory_cache if pattern.replace("*", "") in k]
    for k in to_delete:
        _memory_cache.pop(k, None)
