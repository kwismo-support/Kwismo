"""Routes /auth/*. / Authentication routes.

FR — Inscription, connexion, OTP a deux canaux (email et SMS), appareils
connus, anti brute-force.
EN — Registration, login, two-channel OTP (email and SMS), known devices,
brute-force protection.
"""
from fastapi import APIRouter, Depends, Request, status

from app.core.lang import get_lang
from app.core.rate_limit import AUTH_RATE_LIMIT, OTP_RATE_LIMIT, limiter
from app.core.schemas import Message
from app.modules.auth import service
from app.modules.auth.schemas import (
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

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=Message,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user / Inscrire un nouvel utilisateur",
    description=(
        "**FR** — Crée un compte (nom, prénom, email, mot de passe) et déclenche l'envoi "
        f"d'un code OTP par email. Limité en débit ({AUTH_RATE_LIMIT}).\n\n"
        "**EN** — Creates an account (name, surname, email, password) and triggers an "
        f"email OTP. Rate-limited to prevent mass fake account creation ({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def register(request: Request, payload: RegisterIn, lang: str = Depends(get_lang)) -> Message:
    return await service.register(payload, lang)


@router.post(
    "/email/verify",
    response_model=TokenOut,
    summary="Verify the registration OTP / Vérifier l'OTP d'inscription",
    description=(
        "**FR** — Valide le code OTP email → compte vérifié + jetons émis. "
        f"Limité en débit ({OTP_RATE_LIMIT}).\n\n"
        "**EN** — Validates the registration email OTP → account verified + tokens issued. "
        f"Rate-limited against code brute-forcing ({OTP_RATE_LIMIT})."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_email(request: Request, payload: EmailVerifyIn, lang: str = Depends(get_lang)) -> TokenOut:
    return await service.verify_email(payload, lang)


@router.post(
    "/email/resend",
    response_model=Message,
    summary="Resend the email OTP / Renvoyer l'OTP email",
    description=f"**FR** — Renvoie un nouveau code OTP par email ({OTP_RATE_LIMIT}).\n\n"
    f"**EN** — Resends a new email OTP ({OTP_RATE_LIMIT}).",
)
@limiter.limit(OTP_RATE_LIMIT)
async def resend_email_otp(request: Request, payload: EmailResendIn, lang: str = Depends(get_lang)) -> Message:
    return await service.resend_email_otp(payload, lang)


@router.post(
    "/login",
    response_model=TokenOut | DeviceVerificationRequiredOut,
    summary="Login / Connexion",
    description=(
        "**FR** — Email + mot de passe + identifiant appareil. "
        f"Si appareil inconnu, OTP envoyé par email. Limité en débit ({AUTH_RATE_LIMIT}).\n\n"
        "**EN** — Email + password + device id. "
        f"If device unknown, OTP sent by email. Rate-limited ({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def login(request: Request, payload: LoginIn, lang: str = Depends(get_lang)) -> TokenOut | DeviceVerificationRequiredOut:
    return await service.login(payload, lang)


@router.post(
    "/device/verify",
    response_model=TokenOut,
    summary="Verify a new device / Vérifier un nouvel appareil",
    description=f"**FR** — Valide l'OTP email appareil inconnu → jetons émis ({OTP_RATE_LIMIT}).\n\n**EN** — Validates the device OTP → tokens issued.",
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_device(request: Request, payload: DeviceVerifyIn, lang: str = Depends(get_lang)) -> TokenOut:
    return await service.verify_device(payload, lang)


@router.post(
    "/refresh",
    response_model=TokenOut,
    summary="Refresh the access token / Renouveler le jeton d'accès",
    description=(
        "**FR** — Échange un jeton de rafraîchissement valide contre un nouveau jeton "
        "d'accès (et un nouveau jeton de rafraîchissement, rotatif).\n\n"
        "**EN** — Exchanges a valid refresh token for a new access token (and a new, "
        "rotated refresh token). Auth is the refresh token itself, not the Bearer header."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def refresh(request: Request, payload: RefreshIn, lang: str = Depends(get_lang)) -> TokenOut:
    return await service.refresh(payload, lang)


@router.post(
    "/password/forgot",
    response_model=Message,
    summary="Request a password reset / Demander une réinitialisation",
    description=f"**FR** — Envoie un code de réinitialisation par email.\n\n**EN** — Sends a reset code by email.",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def forgot_password(request: Request, payload: PasswordForgotIn, lang: str = Depends(get_lang)) -> Message:
    return await service.forgot_password(payload, lang)


@router.post(
    "/password/reset",
    response_model=Message,
    summary="Reset the password / Réinitialiser le mot de passe",
    description=f"**FR** — Nouveau mot de passe via le code reçu par email.\n\n**EN** — Sets a new password using the code received by email.",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def reset_password(request: Request, payload: PasswordResetIn, lang: str = Depends(get_lang)) -> Message:
    return await service.reset_password(payload, lang)


@router.post(
    "/logout",
    response_model=Message,
    summary="Logout / Déconnexion",
    description="**FR** — Révoque le jeton de rafraîchissement.\n\n**EN** — Revokes the refresh token.",
)
async def logout(payload: LogoutIn, lang: str = Depends(get_lang)) -> Message:
    return await service.logout(payload, lang)
