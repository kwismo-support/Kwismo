"""Résolution de la langue de la requête.

Priorité :
1. Préférence stockée dans le compte (user.langue) — si l'utilisateur est authentifié.
2. En-tête Accept-Language de la requête.
3. Fallback : "fr".
"""

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

_bearer = HTTPBearer(auto_error=False)
_settings = get_settings()

SUPPORTED_LANGS = {"fr", "en"}


def _parse_accept_language(header: str | None) -> str:
    """Extrait la première langue supportée depuis Accept-Language."""
    if not header:
        return "fr"
    for part in header.split(","):
        lang = part.strip().split(";")[0].strip()[:2].lower()
        if lang in SUPPORTED_LANGS:
            return lang
    return "fr"


async def get_lang(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Dépendance FastAPI : retourne la langue active pour cette requête."""
    # 1. Si un token JWT est présent, charger la préférence stockée.
    if credentials is not None:
        try:
            from app.core.security import decode_token
            from app.db.prisma_client import db

            payload = decode_token(credentials.credentials, expected_type="access")
            user_id: str = payload.get("sub", "")
            if user_id:
                user = await db.user.find_unique(where={"id": user_id})
                if user and hasattr(user, "langue") and user.langue in SUPPORTED_LANGS:
                    return user.langue
        except Exception:
            pass

    # 2. Accept-Language header.
    return _parse_accept_language(request.headers.get("Accept-Language"))
