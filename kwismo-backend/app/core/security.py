"""Authentification JWT (squelette). / JWT authentication (skeleton).

FR — Ce module fournit le schema de securite (pour que Swagger affiche le
cadenas "Authorize" et exige un Bearer token) et la dependance
`get_current_user` utilisee par toutes les routes protegees. Le decodage JWT
reel (python-jose) et le hachage Argon2 seront branches dans une passe
ulterieure : pour l'instant, toute route protegee repond 501 tant qu'aucun
jeton valide n'est fourni, afin de ne jamais donner une fausse impression de
securite active.

EN — This module provides the security scheme (so Swagger shows the
"Authorize" lock and requires a Bearer token) and the `get_current_user`
dependency used by every protected route. Real JWT decoding (python-jose)
and Argon2 hashing land in a later pass: for now, any protected route
returns 501 rather than silently pretending auth is enforced.
"""

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer(
    auto_error=False,
    description="Jeton d'acces JWT / JWT access token: `Bearer <token>`.",
)


@dataclass
class CurrentUser:
    """Principal authentifie (placeholder). / Authenticated principal (placeholder)."""

    id: str
    role: str


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise / Authentication required.",
        )
    # TODO: decoder le JWT (python-jose) et charger l'utilisateur reel.
    # TODO: decode the JWT (python-jose) and load the real user.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Verification JWT pas encore implementee / JWT verification not implemented yet.",
    )
