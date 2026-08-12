"""Logique metier du module auth. / Business logic for the auth module."""

import logging
from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.token_store import is_revoked, revoke_token
from app.db.prisma_client import db
from app.db.repositories.user_repository import UserRepository
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
from app.utils.dates import is_expired, minutes_from_now, utcnow
from app.utils.i18n import t
from app.utils.otp import generate_otp, send_email_otp

logger = logging.getLogger("kwismo.backend")
settings = get_settings()
_users = UserRepository()


# ---------------------------------------------------------------------------
# Helpers internes
# ---------------------------------------------------------------------------

def _token_out(user) -> TokenOut:
    access = create_access_token(user.id, user.role.nomRole)
    refresh = create_refresh_token(user.id, user.role.nomRole)
    return TokenOut(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user=AuthUserOut(
            id=user.id,
            nom=user.nom,
            prenom=user.prenom,
            email=user.email,
            role=user.role.nomRole,
        ),
    )


async def _get_default_user_role():
    role = await db.role.find_unique(where={"nomRole": "user"})
    if role is None:
        role = await db.role.create(data={"nomRole": "user"})
    return role


async def _create_email_otp(user_id: str, email: str) -> str:
    await db.otpcode.update_many(
        where={"userId": user_id, "canal": "email", "estUtilise": False},
        data={"estUtilise": True},
    )
    code = generate_otp()
    await db.otpcode.create(
        data={
            "userId": user_id,
            "canal": "email",
            "cible": email,
            "code": code,
            "dateExpiration": minutes_from_now(settings.otp_expire_min),
        }
    )
    return code


# ---------------------------------------------------------------------------
# register
# ---------------------------------------------------------------------------

async def register(payload: RegisterIn, lang: str = "fr"):
    existing = await _users.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("email_already_in_use", lang),
        )

    role = await _get_default_user_role()
    user = await db.user.create(
        data={
            "nom": payload.nom,
            "prenom": payload.prenom,
            "email": payload.email,
            "motDePasse": hash_password(payload.mot_de_passe),
            "roleId": role.id,
            "langue": lang,
        }
    )

    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)

    from app.core.schemas import Message
    return Message(
        message_fr=t("account_created", "fr"),
        message_en=t("account_created", "en"),
    )


# ---------------------------------------------------------------------------
# verify_email
# ---------------------------------------------------------------------------

async def verify_email(payload: EmailVerifyIn, lang: str = "fr") -> TokenOut:
    user = await _users.get_by_email(payload.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("account_not_found", lang),
        )

    otp = await db.otpcode.find_first(
        where={
            "userId": user.id,
            "canal": "email",
            "cible": payload.email,
            "code": payload.code,
            "estUtilise": False,
        }
    )
    if otp is None or is_expired(otp.dateExpiration):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("otp_invalid_or_expired", lang),
        )

    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    user = await db.user.update(
        where={"id": user.id},
        data={"emailVerifie": True},
        include={"role": True},
    )
    return _token_out(user)


# ---------------------------------------------------------------------------
# resend_email_otp
# ---------------------------------------------------------------------------

async def resend_email_otp(payload: EmailResendIn, lang: str = "fr"):
    user = await _users.get_by_email(payload.email)
    from app.core.schemas import Message
    if user is None:
        return Message(
            message_fr=t("otp_email_resent_ambiguous", "fr"),
            message_en=t("otp_email_resent_ambiguous", "en"),
        )

    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)

    return Message(
        message_fr=t("otp_email_resent", "fr"),
        message_en=t("otp_email_resent", "en"),
    )


# ---------------------------------------------------------------------------
# login
# ---------------------------------------------------------------------------

async def login(payload: LoginIn, lang: str = "fr"):
    user = await db.user.find_unique(
        where={"email": payload.email},
        include={"role": True, "devices": True},
    )
    if user is None or not verify_password(payload.mot_de_passe, user.motDePasse):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=t("login_invalid_credentials", lang),
        )
    if user.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=t("account_suspended", lang),
        )
    if not user.emailVerifie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=t("email_not_verified", lang),
        )

    known_device = next(
        (d for d in (user.devices or []) if d.identifiant == payload.device_id), None
    )

    if known_device:
        await db.device.update(
            where={"id": known_device.id},
            data={"dateDerniereConnexion": utcnow()},
        )
        return _token_out(user)
    else:
        code = await _create_email_otp(user.id, user.email)
        await send_email_otp(user.email, code)
        return DeviceVerificationRequiredOut()


# ---------------------------------------------------------------------------
# verify_device
# ---------------------------------------------------------------------------

async def verify_device(payload: DeviceVerifyIn, lang: str = "fr") -> TokenOut:
    user = await db.user.find_unique(
        where={"email": payload.email},
        include={"role": True},
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("account_not_found", lang),
        )

    otp = await db.otpcode.find_first(
        where={
            "userId": user.id,
            "canal": "email",
            "code": payload.code,
            "estUtilise": False,
        }
    )
    if otp is None or is_expired(otp.dateExpiration):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("otp_invalid_or_expired", lang),
        )

    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    await db.device.upsert(
        where={"userId_identifiant": {"userId": user.id, "identifiant": payload.device_id}},
        data={
            "create": {
                "userId": user.id,
                "identifiant": payload.device_id,
                "nom": f"Appareil {payload.device_id[:8]}",
            },
            "update": {"dateDerniereConnexion": utcnow()},
        },
    )
    return _token_out(user)


# ---------------------------------------------------------------------------
# refresh
# ---------------------------------------------------------------------------

async def refresh(payload: RefreshIn, lang: str = "fr") -> TokenOut:
    token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    user_id: str = token_payload.get("sub", "")
    jti: str = token_payload.get("jti", "")

    if await is_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=t("token_revoked", lang),
        )

    user = await db.user.find_unique(where={"id": user_id}, include={"role": True})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=t("account_not_found", lang),
        )
    if user.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=t("account_suspended", lang),
        )

    exp = token_payload.get("exp", 0)
    remaining = max(0, int(exp - datetime.now(UTC).timestamp()))
    await revoke_token(jti, remaining)

    return _token_out(user)


# ---------------------------------------------------------------------------
# forgot_password
# ---------------------------------------------------------------------------

async def forgot_password(payload: PasswordForgotIn, lang: str = "fr"):
    user = await _users.get_by_email(payload.email)
    from app.core.schemas import Message
    if user is None:
        return Message(
            message_fr=t("forgot_password_sent", "fr"),
            message_en=t("forgot_password_sent", "en"),
        )

    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)
    return Message(
        message_fr=t("forgot_password_code_sent", "fr"),
        message_en=t("forgot_password_code_sent", "en"),
    )


# ---------------------------------------------------------------------------
# reset_password
# ---------------------------------------------------------------------------

async def reset_password(payload: PasswordResetIn, lang: str = "fr"):
    otp = await db.otpcode.find_first(
        where={
            "canal": "email",
            "code": payload.token,
            "estUtilise": False,
        },
        include={"user": True},
    )
    if otp is None or is_expired(otp.dateExpiration):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("code_invalid_or_expired", lang),
        )

    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    await db.user.update(
        where={"id": otp.userId},
        data={"motDePasse": hash_password(payload.new_password)},
    )

    from app.core.schemas import Message
    return Message(
        message_fr=t("password_reset_success", "fr"),
        message_en=t("password_reset_success", "en"),
    )


# ---------------------------------------------------------------------------
# logout
# ---------------------------------------------------------------------------

async def logout(payload: LogoutIn, lang: str = "fr"):
    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
        jti: str = token_payload.get("jti", "")
        exp: int = token_payload.get("exp", 0)
        remaining = max(0, int(exp - datetime.now(UTC).timestamp()))
        await revoke_token(jti, remaining)
    except HTTPException:
        pass

    from app.core.schemas import Message
    return Message(
        message_fr=t("logout_success", "fr"),
        message_en=t("logout_success", "en"),
    )
