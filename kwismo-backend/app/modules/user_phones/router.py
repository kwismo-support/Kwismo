"""Routes /users/me/phones/*. / "My numbers" routes."""

from fastapi import APIRouter, Depends, Request, Response, status

from app.core.permissions import require_roles
from app.core.rate_limit import AUTH_RATE_LIMIT, OTP_RATE_LIMIT, limiter
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
from app.modules.user_phones import service
from app.modules.user_phones.schemas import (
    CompromiseIncidentOut,
    UserPhoneAddIn,
    UserPhoneOut,
    UserPhoneVerifyIn,
)

router = APIRouter(prefix="/users/me/phones", tags=["My Numbers"])


@router.get(
    "",
    response_model=list[UserPhoneOut],
    responses=AUTH_RESPONSES,
    summary="List my numbers / Lister mes numéros",
    description=(
        "**FR** — Liste des numéros du compte avec leur statut.\n\n"
        "**EN** — The account's numbers with their status."
    ),
)
async def list_my_phones(user=Depends(require_roles("user"))) -> list[UserPhoneOut]:
    return await service.list_my_phones(user.id)


@router.post(
    "",
    response_model=UserPhoneOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Add a number / Ajouter un numéro",
    description=(
        f"**FR** — Ajoute un numéro et envoie un OTP SMS. Limité ({AUTH_RATE_LIMIT}).\n\n"
        f"**EN** — Adds a number and sends an SMS OTP. Rate-limited ({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def add_my_phone(
    request: Request, response: Response, payload: UserPhoneAddIn, user=Depends(require_roles("user"))
) -> UserPhoneOut:
    return await service.add_my_phone(user.id, payload, user.langue)


@router.post(
    "/{phone_id}/verify",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Verify a number's SMS OTP / Vérifier l'OTP SMS",
    description=f"**FR** — Vérifie l'OTP SMS. Limité ({OTP_RATE_LIMIT}).\n\n**EN** — Verifies the SMS OTP. Rate-limited ({OTP_RATE_LIMIT}).",
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_my_phone(
    request: Request, response: Response, phone_id: str, payload: UserPhoneVerifyIn, user=Depends(require_roles("user"))
) -> Message:
    return await service.verify_my_phone(user.id, phone_id, payload, user.langue)


@router.post(
    "/{phone_id}/resend",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Resend the SMS OTP / Renvoyer l'OTP SMS",
    description=f"**FR** — Renvoie l'OTP SMS. Limité ({OTP_RATE_LIMIT}).\n\n**EN** — Resends the SMS OTP. Rate-limited ({OTP_RATE_LIMIT}).",
)
@limiter.limit(OTP_RATE_LIMIT)
async def resend_my_phone_otp(
    request: Request, response: Response, phone_id: str, user=Depends(require_roles("user"))
) -> Message:
    return await service.resend_my_phone_otp(user.id, phone_id, user.langue)


@router.delete(
    "/{phone_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Remove a number / Retirer un numéro",
    description=(
        "**FR** — Retire un numéro du compte.\n\n"
        "**EN** — Removes a number from the account."
    ),
)
async def remove_my_phone(phone_id: str, user=Depends(require_roles("user"))) -> Message:
    return await service.remove_my_phone(user.id, phone_id, user.langue)


@router.post(
    "/{phone_id}/compromise",
    response_model=CompromiseIncidentOut,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Declare a number compromised / Déclarer ce numéro compromis",
    description=(
        "**FR** — Déclare ce numéro compromis. Numéros vérifiés uniquement.\n\n"
        "**EN** — Declares this number compromised. Verified numbers only."
    ),
)
async def declare_my_phone_compromised(
    phone_id: str, user=Depends(require_roles("user"))
) -> CompromiseIncidentOut:
    return await service.declare_my_phone_compromised(user.id, phone_id, user.langue)
