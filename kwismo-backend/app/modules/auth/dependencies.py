"""Dependances specifiques a l'auth. / Auth-specific dependencies."""

from fastapi import HTTPException, status

from app.core.security import decode_token
from app.db.prisma_client import db


async def get_user_from_refresh_token(refresh_token: str):
    """Resout l'utilisateur a partir d'un jeton de rafraichissement. / Resolves the user from a refresh token."""
    payload = decode_token(refresh_token, expected_type="refresh")
    user_id: str = payload.get("sub", "")
    user = await db.user.find_unique(where={"id": user_id}, include={"role": True})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Compte introuvable / Account not found.")
    return user


async def get_user_from_reset_token(token: str):
    """Resout l'utilisateur a partir d'un code OTP de reinitialisation. / Resolves the user from a password-reset OTP code."""
    from app.utils.dates import is_expired
    otp = await db.otpcode.find_first(
        where={"canal": "email", "code": token, "estUtilise": False},
        include={"user": True},
    )
    if otp is None or is_expired(otp.dateExpiration):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code invalide ou expire / Invalid or expired code.",
        )
    return otp.user
