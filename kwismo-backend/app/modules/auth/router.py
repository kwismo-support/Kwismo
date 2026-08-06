"""Routes /auth/*. / /auth/* routes.

Cf. cahier des charges Backend §5.1 et §8.1 (OTP a deux canaux, appareils connus,
anti brute-force). See Backend spec §5.1 and §8.1 (two-channel OTP, known
devices, anti brute-force).
"""

from fastapi import APIRouter, Request, status

from app.core.exceptions import not_implemented
from app.core.rate_limit import AUTH_RATE_LIMIT, OTP_RATE_LIMIT, limiter
from app.core.schemas import Message
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
        "d'un code OTP par email. Limité en débit pour éviter la création massive de "
        f"faux comptes ({AUTH_RATE_LIMIT}).\n\n"
        "**EN** — Creates an account (name, surname, email, password) and triggers an "
        f"email OTP. Rate-limited to prevent mass fake account creation ({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def register(request: Request, payload: RegisterIn) -> Message:
    raise not_implemented()


@router.post(
    "/email/verify",
    response_model=TokenOut,
    summary="Verify the registration OTP / Vérifier l'OTP d'inscription",
    description=(
        "**FR** — Valide le code OTP email reçu à l'inscription : le compte devient "
        f"vérifié et des jetons (accès + rafraîchissement) sont émis. Limité en débit "
        f"contre le brute-force du code ({OTP_RATE_LIMIT}).\n\n"
        "**EN** — Validates the registration email OTP: the account becomes verified "
        f"and access/refresh tokens are issued. Rate-limited against code brute-forcing "
        f"({OTP_RATE_LIMIT})."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_email(request: Request, payload: EmailVerifyIn) -> TokenOut:
    raise not_implemented()


@router.post(
    "/email/resend",
    response_model=Message,
    summary="Resend the email OTP / Renvoyer l'OTP email",
    description=(
        f"**FR** — Renvoie un nouveau code OTP par email (limité en débit, {OTP_RATE_LIMIT}, "
        "pour éviter les abus).\n\n"
        f"**EN** — Resends a new email OTP (rate-limited, {OTP_RATE_LIMIT}, to prevent abuse)."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def resend_email_otp(request: Request, payload: EmailResendIn) -> Message:
    raise not_implemented()


@router.post(
    "/login",
    response_model=TokenOut | DeviceVerificationRequiredOut,
    summary="Login / Connexion",
    description=(
        "**FR** — Connexion par email + mot de passe, avec l'identifiant de l'appareil. "
        "Si l'appareil est inconnu, un OTP email est envoyé et aucun jeton n'est émis "
        f"(voir `/auth/device/verify`). Limité en débit contre le brute-force du mot de "
        f"passe ({AUTH_RATE_LIMIT}).\n\n"
        "**EN** — Email + password login, with the device identifier. If the device is "
        "unknown, an email OTP is sent and no tokens are issued yet (see "
        f"`/auth/device/verify`). Rate-limited against password brute-forcing "
        f"({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def login(request: Request, payload: LoginIn) -> TokenOut | DeviceVerificationRequiredOut:
    raise not_implemented()


@router.post(
    "/device/verify",
    response_model=TokenOut,
    summary="Verify a new device / Vérifier un nouvel appareil",
    description=(
        "**FR** — Valide l'OTP email envoyé lors d'une connexion depuis un appareil "
        f"inconnu ; l'appareil est mémorisé et des jetons sont émis. Limité en débit "
        f"({OTP_RATE_LIMIT}).\n\n"
        "**EN** — Validates the email OTP sent when logging in from an unknown device; "
        f"the device is remembered and tokens are issued. Rate-limited ({OTP_RATE_LIMIT})."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_device(request: Request, payload: DeviceVerifyIn) -> TokenOut:
    raise not_implemented()


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
async def refresh(request: Request, payload: RefreshIn) -> TokenOut:
    raise not_implemented()


@router.post(
    "/password/forgot",
    response_model=Message,
    summary="Request a password reset / Demander une réinitialisation de mot de passe",
    description=(
        f"**FR** — Envoie un email contenant un jeton de réinitialisation. Limité en "
        f"débit ({AUTH_RATE_LIMIT}).\n\n"
        f"**EN** — Sends an email containing a password reset token. Rate-limited "
        f"({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def forgot_password(request: Request, payload: PasswordForgotIn) -> Message:
    raise not_implemented()


@router.post(
    "/password/reset",
    response_model=Message,
    summary="Reset the password / Réinitialiser le mot de passe",
    description=(
        f"**FR** — Définit un nouveau mot de passe à partir du jeton reçu par email. "
        f"Limité en débit ({AUTH_RATE_LIMIT}).\n\n"
        f"**EN** — Sets a new password using the token received by email. Rate-limited "
        f"({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def reset_password(request: Request, payload: PasswordResetIn) -> Message:
    raise not_implemented()


@router.post(
    "/logout",
    response_model=Message,
    summary="Logout / Déconnexion",
    description=(
        "**FR** — Révoque le jeton de rafraîchissement fourni.\n\n"
        "**EN** — Revokes the given refresh token."
    ),
)
async def logout(payload: LogoutIn) -> Message:
    raise not_implemented()
