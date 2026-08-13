"""Routes /auth/*. / Authentication routes."""

from fastapi import APIRouter, Request, Response, status

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
)
@limiter.limit(AUTH_RATE_LIMIT)
async def register(request: Request, response: Response, payload: RegisterIn) -> Message:
    return await service.register(payload)


@router.post(
    "/email/verify",
    response_model=TokenOut,
    summary="Verify the registration OTP / Verifier l'OTP d'inscription",
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_email(request: Request, response: Response, payload: EmailVerifyIn) -> TokenOut:
    return await service.verify_email(payload)


@router.post(
    "/email/resend",
    response_model=Message,
    summary="Resend the email OTP / Renvoyer l'OTP email",
)
@limiter.limit(OTP_RATE_LIMIT)
async def resend_email_otp(request: Request, response: Response, payload: EmailResendIn) -> Message:
    return await service.resend_email_otp(payload)


@router.post(
    "/login",
    response_model=TokenOut | DeviceVerificationRequiredOut,
    summary="Login / Connexion",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def login(request: Request, response: Response, payload: LoginIn) -> TokenOut | DeviceVerificationRequiredOut:
    return await service.login(payload)


@router.post(
    "/device/verify",
    response_model=TokenOut,
    summary="Verify a new device / Verifier un nouvel appareil",
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_device(request: Request, response: Response, payload: DeviceVerifyIn) -> TokenOut:
    return await service.verify_device(payload)


@router.post(
    "/refresh",
    response_model=TokenOut,
    summary="Refresh the access token / Renouveler le jeton d'acces",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def refresh(request: Request, response: Response, payload: RefreshIn) -> TokenOut:
    return await service.refresh(payload)


@router.post(
    "/password/forgot",
    response_model=Message,
    summary="Request a password reset / Demander une reinitialisation",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def forgot_password(request: Request, response: Response, payload: PasswordForgotIn) -> Message:
    return await service.forgot_password(payload)


@router.post(
    "/password/reset",
    response_model=Message,
    summary="Reset the password / Reinitialiser le mot de passe",
)
@limiter.limit(AUTH_RATE_LIMIT)
async def reset_password(request: Request, response: Response, payload: PasswordResetIn) -> Message:
    return await service.reset_password(payload)


@router.post(
    "/logout",
    response_model=Message,
    summary="Logout / Deconnexion",
)
async def logout(payload: LogoutIn) -> Message:
    return await service.logout(payload)
