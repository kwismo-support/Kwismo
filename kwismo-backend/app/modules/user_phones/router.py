"""Routes /users/me/phones/*. / "My numbers" routes.

FR — Un compte, plusieurs numeros ; chaque numero est verifie par OTP SMS et
reste unique globalement (un seul compte a la fois).
EN — One account, several numbers; each number is verified via SMS OTP and
stays globally unique (one account at a time).
"""

from fastapi import APIRouter, Depends, Request, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.rate_limit import AUTH_RATE_LIMIT, OTP_RATE_LIMIT, limiter
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
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
    raise not_implemented()


@router.post(
    "",
    response_model=UserPhoneOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Add a number / Ajouter un numéro",
    description=(
        "**FR** — Ajoute un numéro (pays + valeur). Vérifie l'unicité globale puis "
        f"envoie un OTP par SMS sur la ligne. Limité en débit ({AUTH_RATE_LIMIT}).\n\n"
        "**EN** — Adds a number (country + value). Checks global uniqueness then "
        f"sends an SMS OTP to the line. Rate-limited ({AUTH_RATE_LIMIT})."
    ),
)
@limiter.limit(AUTH_RATE_LIMIT)
async def add_my_phone(
    request: Request, payload: UserPhoneAddIn, user=Depends(require_roles("user"))
) -> UserPhoneOut:
    raise not_implemented()


@router.post(
    "/{phone_id}/verify",
    response_model=UserPhoneOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Verify a number's SMS OTP / Vérifier l'OTP SMS d'un numéro",
    description=(
        f"**FR** — Vérifie l'OTP SMS reçu sur la ligne → numéro marqué vérifié. Limité "
        f"en débit ({OTP_RATE_LIMIT}).\n\n"
        f"**EN** — Verifies the SMS OTP received on the line → number marked verified. "
        f"Rate-limited ({OTP_RATE_LIMIT})."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def verify_my_phone(
    request: Request, phone_id: str, payload: UserPhoneVerifyIn, user=Depends(require_roles("user"))
) -> UserPhoneOut:
    raise not_implemented()


@router.post(
    "/{phone_id}/resend",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Resend the SMS OTP / Renvoyer l'OTP SMS",
    description=(
        f"**FR** — Renvoie l'OTP SMS. Limité en débit ({OTP_RATE_LIMIT}).\n\n"
        f"**EN** — Resends the SMS OTP. Rate-limited ({OTP_RATE_LIMIT})."
    ),
)
@limiter.limit(OTP_RATE_LIMIT)
async def resend_my_phone_otp(
    request: Request, phone_id: str, user=Depends(require_roles("user"))
) -> Message:
    raise not_implemented()


@router.delete(
    "/{phone_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Remove a number / Retirer un numéro",
    description=(
        "**FR** — Retire un numéro du compte ; sa valeur redevient rattachable après "
        "contrôle.\n\n"
        "**EN** — Removes a number from the account; its value becomes attachable "
        "again after review."
    ),
)
async def remove_my_phone(phone_id: str, user=Depends(require_roles("user"))) -> Message:
    raise not_implemented()


@router.post(
    "/{phone_id}/compromise",
    response_model=CompromiseIncidentOut,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Declare a number compromised / Déclarer ce numéro compromis",
    description=(
        "**FR** — Déclare ce numéro compromis (crée un incident) ; réservé aux "
        "numéros vérifiés.\n\n"
        "**EN** — Declares this number compromised (creates an incident); verified "
        "numbers only."
    ),
)
async def declare_my_phone_compromised(
    phone_id: str, user=Depends(require_roles("user"))
) -> CompromiseIncidentOut:
    raise not_implemented()
