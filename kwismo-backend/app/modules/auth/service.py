"""Logique metier du module auth. / Business logic for the auth module."""

import logging
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.schemas import Message
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.token_store import is_revoked, revoke_token
from app.db.prisma_client import db
from app.modules.auth.schemas import (
    AuthUserOut,
    DeviceVerificationRequiredOut,
    DeviceVerifyIn,
    EmailResendIn,
    EmailVerifyIn,
    LoginIn,
    LogoutIn,
    PasswordForgotIn,
    PasswordResetIn,
    RefreshIn,
    RegisterIn,
    TokenOut,
)
from app.utils.email import send_otp_email, send_password_reset_email

logger = logging.getLogger("kwismo.backend")
settings = get_settings()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_otp() -> str:
    return str(secrets.randbelow(1000000)).zfill(6)


def _otp_expiry() -> datetime:
    return datetime.now(UTC) + timedelta(minutes=settings.otp_expire_min)


async def _get_or_create_role(nom: str):
    role = await db.role.find_first(where={"nomRole": nom})
    if role is None:
        role = await db.role.create(data={"nomRole": nom})
    return role


def _build_token_out(user, role_name: str) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id, role_name),
        refresh_token=create_refresh_token(user.id, role_name),
        user=AuthUserOut(
            id=user.id,
            nom=user.nom,
            prenom=user.prenom,
            email=user.email,
            role=role_name,
        ),
    )


async def _invalidate_otps(user_id: str, canal: str) -> None:
    """Invalide tous les OTP actifs d'un canal donne. / Invalidates all active OTPs for a given channel."""
    await db.otpcode.update_many(
        where={"userId": user_id, "canal": canal, "estUtilise": False},
        data={"estUtilise": True},
    )


async def _validate_otp(user_id: str, canal: str, code: str):
    """Valide et consomme un OTP. Leve 400 si invalide/expire. / Validates and consumes an OTP. Raises 400 if invalid/expired."""
    otp = await db.otpcode.find_first(
        where={"userId": user_id, "canal": canal, "code": code, "estUtilise": False}
    )
    if otp is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code OTP invalide / Invalid OTP code.",
        )
    if otp.dateExpiration < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code OTP expire / Expired OTP code.",
        )
    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    return otp


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

async def register(payload: RegisterIn) -> Message:
    existing = await db.user.find_unique(where={"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email deja utilise / Email already in use.",
        )
    role = await _get_or_create_role("user")
    user = await db.user.create(
        data={
            "nom": payload.nom,
            "prenom": payload.prenom,
            "email": payload.email,
            "motDePasse": hash_password(payload.mot_de_passe),
            "roleId": role.id,
        }
    )
    code = _generate_otp()
    await _invalidate_otps(user.id, "email")
    await db.otpcode.create(
        data={
            "userId": user.id,
            "code": code,
            "canal": "email",
            "cible": user.email,
            "dateExpiration": _otp_expiry(),
        }
    )
    await send_otp_email(user.email, code)
    return Message(
        message_fr="Compte cree. Verifiez votre email pour le code OTP.",
        message_en="Account created. Check your email for the OTP code.",
    )


async def verify_email(payload: EmailVerifyIn) -> TokenOut:
    user = await db.user.find_unique(
        where={"email": payload.email}, include={"role": True}
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")
    if user.emailVerifie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email deja verifie / Email already verified.")
    await _validate_otp(user.id, "email", payload.code)
    await db.user.update(where={"id": user.id}, data={"emailVerifie": True})
    return _build_token_out(user, user.role.nomRole)


async def resend_email_otp(payload: EmailResendIn) -> Message:
    user = await db.user.find_unique(where={"email": payload.email})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")
    await _invalidate_otps(user.id, "email")
    code = _generate_otp()
    await db.otpcode.create(
        data={
            "userId": user.id,
            "code": code,
            "canal": "email",
            "cible": user.email,
            "dateExpiration": _otp_expiry(),
        }
    )
    await send_otp_email(user.email, code)
    return Message(
        message_fr="Code OTP renvoye par email.",
        message_en="OTP code resent by email.",
    )


async def login(payload: LoginIn) -> TokenOut | DeviceVerificationRequiredOut:
    user = await db.user.find_unique(
        where={"email": payload.email}, include={"role": True}
    )
    if user is None or not verify_password(payload.mot_de_passe, user.motDePasse):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides / Invalid credentials.",
        )
    if not user.emailVerifie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non verifie / Email not verified.",
        )
    if user.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte suspendu / Suspended account.",
        )
    # Check known device
    device = await db.device.find_unique(
        where={"userId_identifiant": {"userId": user.id, "identifiant": payload.device_id}}
    )
    if device is not None:
        await db.device.update(
            where={"userId_identifiant": {"userId": user.id, "identifiant": payload.device_id}},
            data={"nom": payload.device_name},
        )
        return _build_token_out(user, user.role.nomRole)
    # Unknown device — send OTP
    await _invalidate_otps(user.id, "email")
    code = _generate_otp()
    await db.otpcode.create(
        data={
            "userId": user.id,
            "code": code,
            "canal": "email",
            "cible": user.email,
            "dateExpiration": _otp_expiry(),
        }
    )
    await send_otp_email(user.email, code)
    return DeviceVerificationRequiredOut()


async def verify_device(payload: DeviceVerifyIn) -> TokenOut:
    user = await db.user.find_unique(
        where={"email": payload.email}, include={"role": True}
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")
    await _validate_otp(user.id, "email", payload.code)
    await db.device.create(
        data={
            "userId": user.id,
            "identifiant": payload.device_id,
            "nom": "Appareil verifie",
        }
    )
    return _build_token_out(user, user.role.nomRole)


async def refresh(payload: RefreshIn) -> TokenOut:
    data = decode_token(payload.refresh_token, expected_type="refresh")
    jti = data.get("jti", "")
    if jti and await is_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revolque / Revoked refresh token.",
        )
    user = await db.user.find_unique(
        where={"id": data["sub"]}, include={"role": True}
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur introuvable / User not found.")
    # Revoke old refresh token
    if jti:
        exp = data.get("exp", 0)
        ttl = max(0, exp - int(datetime.now(UTC).timestamp()))
        await revoke_token(jti, ttl)
    return _build_token_out(user, user.role.nomRole)


async def forgot_password(payload: PasswordForgotIn) -> Message:
    user = await db.user.find_unique(where={"email": payload.email})
    # Always return same message to avoid user enumeration
    msg = Message(
        message_fr="Si l'email existe, un lien de reinitialisation a ete envoye.",
        message_en="If the email exists, a reset link was sent.",
    )
    if user is None:
        return msg
    from app.core.security import create_access_token
    from datetime import UTC, datetime, timedelta
    import uuid
    from jose import jwt as jose_jwt
    reset_token = jose_jwt.encode(
        {
            "sub": user.id,
            "type": "reset",
            "jti": str(uuid.uuid4()),
            "exp": datetime.now(UTC) + timedelta(minutes=30),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    await send_password_reset_email(user.email, reset_token)
    return msg


async def reset_password(payload: PasswordResetIn) -> Message:
    data = decode_token(payload.token, expected_type="reset")
    user = await db.user.find_unique(where={"id": data["sub"]})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")
    await db.user.update(
        where={"id": user.id},
        data={"motDePasse": hash_password(payload.new_password)},
    )
    return Message(
        message_fr="Mot de passe reinitialise avec succes.",
        message_en="Password reset successfully.",
    )


async def logout(payload: LogoutIn) -> Message:
    try:
        data = decode_token(payload.refresh_token, expected_type="refresh")
        jti = data.get("jti", "")
        if jti:
            exp = data.get("exp", 0)
            ttl = max(0, exp - int(datetime.now(UTC).timestamp()))
            await revoke_token(jti, ttl)
    except HTTPException:
        pass  # Token already invalid — logout succeeds regardless
    return Message(
        message_fr="Deconnexion reussie.",
        message_en="Logged out successfully.",
    )
