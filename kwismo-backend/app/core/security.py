"""Authentification JWT reelle. / Real JWT authentication."""

import logging
import uuid
from dataclasses import dataclass, field

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings
from app.db.prisma_client import db

logger = logging.getLogger("kwismo.backend")

bearer_scheme = HTTPBearer(
    auto_error=False,
    description="Jeton d'acces JWT / JWT access token: `Bearer <token>`.",
)

_ph = PasswordHasher()

ALGORITHM = "HS256"


@dataclass
class CurrentUser:
    """Principal authentifie. / Authenticated principal."""

    id: str
    role: str
    langue: str = "fr"
    partner_id: str | None = field(default=None)


# ---------------------------------------------------------------------------
# Hachage / Hash
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def create_access_token(user_id: str, role: str, partner_id: str | None = None) -> str:
    """Cree un jeton d'acces JWT (courte duree)."""
    from app.utils.dates import minutes_from_now
    settings = get_settings()
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "exp": minutes_from_now(settings.jwt_access_expire_min),
    }
    if partner_id:
        payload["partner_id"] = partner_id
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def create_refresh_token(user_id: str, role: str, partner_id: str | None = None) -> str:
    """Cree un jeton de rafraichissement JWT (longue duree)."""
    from datetime import UTC, datetime, timedelta
    settings = get_settings()
    payload = {
        "sub": user_id,
        "role": role,
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "exp": datetime.now(UTC) + timedelta(days=settings.jwt_refresh_expire_days),
    }
    if partner_id:
        payload["partner_id"] = partner_id
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> dict:
    """Decode et valide un JWT. Leve 401 si invalide."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide ou expire / Invalid or expired token.",
        ) from exc
    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Type de jeton incorrect / Incorrect token type.",
        )
    return payload


# ---------------------------------------------------------------------------
# Dependance FastAPI
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Dependance FastAPI : resout l'utilisateur authentifie."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise / Authentication required.",
        )
    payload = decode_token(credentials.credentials, expected_type="access")
    user_id: str = payload.get("sub", "")
    role: str = payload.get("role", "")
    partner_id: str | None = payload.get("partner_id")

    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compte introuvable / Account not found.",
        )
    if user.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte suspendu / Account suspended.",
        )

    langue = getattr(user, "langue", "fr") or "fr"
    # partner_id depuis le JWT — fallback sur user.partnerId si absent du token (migration)
    resolved_partner_id = partner_id or getattr(user, "partnerId", None)

    return CurrentUser(id=user_id, role=role, langue=langue, partner_id=resolved_partner_id)
