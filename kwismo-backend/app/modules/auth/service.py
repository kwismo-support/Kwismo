"""Logique metier du module auth. / Business logic for the auth module."""

import logging

from fastapi import HTTPException, status

from datetime import UTC, datetime

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
    """Recupere le role 'user', le cree s'il n'existe pas. / Gets the 'user' role, creating it if absent."""
    role = await db.role.find_unique(where={"nomRole": "user"})
    if role is None:
        role = await db.role.create(data={"nomRole": "user"})
    return role


async def _create_email_otp(user_id: str, email: str) -> str:
    """Invalide les OTP email precedents, cree un nouveau, renvoie le code. / Invalidates previous email OTPs, creates a new one, returns the code."""
    # Invalider les anciens OTP email non utilises pour cet utilisateur.
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

async def register(payload: RegisterIn):
    # 1. Verifier que l'email n'est pas deja pris.
    existing = await _users.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email deja utilise / Email already in use.",
        )

    # 2. Resoudre le role par defaut 'user'.
    role = await _get_default_user_role()

    # 3. Creer le compte.
    user = await db.user.create(
        data={
            "nom": payload.nom,
            "prenom": payload.prenom,
            "email": payload.email,
            "motDePasse": hash_password(payload.mot_de_passe),
            "roleId": role.id,
        }
    )

    # 4. Envoyer l'OTP d'activation par email.
    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)

    from app.core.schemas import Message
    return Message(
        message_fr="Compte créé. Un code de vérification a été envoyé par email.",
        message_en="Account created. A verification code was sent by email.",
    )


# ---------------------------------------------------------------------------
# verify_email
# ---------------------------------------------------------------------------

async def verify_email(payload: EmailVerifyIn) -> TokenOut:
    user = await _users.get_by_email(payload.email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compte introuvable / Account not found.")

    # Chercher un OTP email valide.
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
            detail="Code OTP invalide ou expire / Invalid or expired OTP code.",
        )

    # Marquer l'OTP utilise + le compte verifie.
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

async def resend_email_otp(payload: EmailResendIn):
    user = await _users.get_by_email(payload.email)
    if user is None:
        # Ne pas confirmer l'existence du compte (securite).
        from app.core.schemas import Message
        return Message(
            message_fr="Si cet email existe, un code a été envoyé.",
            message_en="If this email exists, a code was sent.",
        )

    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)

    from app.core.schemas import Message
    return Message(
        message_fr="Nouveau code envoyé par email.",
        message_en="New code sent by email.",
    )


# ---------------------------------------------------------------------------
# login
# ---------------------------------------------------------------------------

async def login(payload: LoginIn):
    user = await db.user.find_unique(
        where={"email": payload.email},
        include={"role": True, "devices": True},
    )
    if user is None or not verify_password(payload.mot_de_passe, user.motDePasse):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect / Incorrect email or password.",
        )
    if user.statut != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte suspendu / Account suspended.",
        )
    if not user.emailVerifie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non verifie. Verifiez votre boite mail / Email not verified. Check your inbox.",
        )

    # Verifier si l'appareil est connu.
    known_device = next(
        (d for d in (user.devices or []) if d.identifiant == payload.device_id), None
    )

    if known_device:
        # Appareil connu : mise a jour date derniere connexion + emission des jetons.
        await db.device.update(
            where={"id": known_device.id},
            data={"dateDerniereConnexion": utcnow()},
        )
        return _token_out(user)
    else:
        # Nouvel appareil : envoyer OTP email, pas de jeton pour l'instant.
        code = await _create_email_otp(user.id, user.email)
        await send_email_otp(user.email, code)
        return DeviceVerificationRequiredOut()


# ---------------------------------------------------------------------------
# verify_device
# ---------------------------------------------------------------------------

async def verify_device(payload: DeviceVerifyIn) -> TokenOut:
    user = await db.user.find_unique(
        where={"email": payload.email},
        include={"role": True},
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compte introuvable / Account not found.")

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
            detail="Code OTP invalide ou expire / Invalid or expired OTP code.",
        )

    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})

    # Enregistrer l'appareil pour les prochaines connexions.
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

async def refresh(payload: RefreshIn) -> TokenOut:
    token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    user_id: str = token_payload.get("sub", "")
    jti: str = token_payload.get("jti", "")

    if await is_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton de rafraichissement revolque / Revoked refresh token.",
        )

    user = await db.user.find_unique(where={"id": user_id}, include={"role": True})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Compte introuvable / Account not found.")
    if user.statut != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte suspendu / Account suspended.")

    settings = get_settings()
    exp = token_payload.get("exp", 0)
    remaining = max(0, int(exp - datetime.now(UTC).timestamp()))
    await revoke_token(jti, remaining)

    return _token_out(user)


# ---------------------------------------------------------------------------
# forgot_password
# ---------------------------------------------------------------------------

async def forgot_password(payload: PasswordForgotIn):
    user = await _users.get_by_email(payload.email)
    from app.core.schemas import Message
    if user is None:
        return Message(
            message_fr="Si cet email existe, un lien de réinitialisation a été envoyé.",
            message_en="If this email exists, a reset link was sent.",
        )

    # Reutilise le meme mecanisme OTP email pour le reset.
    code = await _create_email_otp(user.id, user.email)
    await send_email_otp(user.email, code)
    return Message(
        message_fr="Un code de réinitialisation a été envoyé par email.",
        message_en="A reset code was sent by email.",
    )


# ---------------------------------------------------------------------------
# reset_password
# ---------------------------------------------------------------------------

async def reset_password(payload: PasswordResetIn):
    # Le token est ici le code OTP numerique envoye par email.
    # On cherche un OTP email valide quel que soit l'utilisateur cible.
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
            detail="Code invalide ou expire / Invalid or expired code.",
        )

    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    await db.user.update(
        where={"id": otp.userId},
        data={"motDePasse": hash_password(payload.new_password)},
    )

    from app.core.schemas import Message
    return Message(
        message_fr="Mot de passe réinitialisé avec succès.",
        message_en="Password reset successfully.",
    )


# ---------------------------------------------------------------------------
# logout
# ---------------------------------------------------------------------------

async def logout(payload: LogoutIn):
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
        message_fr="Déconnexion réussie.",
        message_en="Logged out successfully.",
    )
