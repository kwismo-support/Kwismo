"""Routes /countries, /operators, /ussd-actions. Cf. cahier des charges Backend §5.7."""

from fastapi import APIRouter, Depends, Query, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
from app.modules.ussd.schemas import (
    CountryIn,
    CountryOut,
    OperatorIn,
    OperatorOut,
    UssdActionIn,
    UssdActionOut,
)

router = APIRouter(tags=["USSD"])


# --- Countries / Pays --------------------------------------------------

@router.get(
    "/countries",
    response_model=list[CountryOut],
    summary="List countries / Lister les pays",
    description=(
        "**FR** — Liste des pays (drapeaux/indicatifs) — Cameroun par défaut.\n\n"
        "**EN** — List of countries (flags/dial codes) — Cameroon by default."
    ),
)
async def list_countries() -> list[CountryOut]:
    raise not_implemented()


@router.post(
    "/countries",
    response_model=CountryOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create a country / Créer un pays",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_country(payload: CountryIn, user=Depends(require_roles("admin"))) -> CountryOut:
    raise not_implemented()


@router.patch(
    "/countries/{country_id}",
    response_model=CountryOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Update a country / Modifier un pays",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def update_country(
    country_id: str, payload: CountryIn, user=Depends(require_roles("admin"))
) -> CountryOut:
    raise not_implemented()


@router.delete(
    "/countries/{country_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Delete a country / Supprimer un pays",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def delete_country(country_id: str, user=Depends(require_roles("admin"))) -> Message:
    raise not_implemented()


# --- Operators / Operateurs ---------------------------------------------

@router.get(
    "/operators",
    response_model=list[OperatorOut],
    summary="List a country's operators / Opérateurs d'un pays",
    description="**FR** — Opérateurs d'un pays.\n\n**EN** — A country's operators.",
)
async def list_operators(country: str = Query(..., description="ID du pays / Country id")) -> list[OperatorOut]:
    raise not_implemented()


@router.post(
    "/operators",
    response_model=OperatorOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create an operator / Créer un opérateur",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_operator(payload: OperatorIn, user=Depends(require_roles("admin"))) -> OperatorOut:
    raise not_implemented()


@router.patch(
    "/operators/{operator_id}",
    response_model=OperatorOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Update an operator / Modifier un opérateur",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def update_operator(
    operator_id: str, payload: OperatorIn, user=Depends(require_roles("admin"))
) -> OperatorOut:
    raise not_implemented()


@router.delete(
    "/operators/{operator_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Delete an operator / Supprimer un opérateur",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def delete_operator(operator_id: str, user=Depends(require_roles("admin"))) -> Message:
    raise not_implemented()


# --- USSD actions ---------------------------------------------------------

@router.get(
    "/ussd-actions",
    response_model=list[UssdActionOut],
    summary="List an operator's USSD actions / Actions USSD d'un opérateur",
    description=(
        "**FR** — Actions et formats USSD d'un opérateur.\n\n"
        "**EN** — An operator's USSD actions and formats."
    ),
)
async def list_ussd_actions(
    operator: str = Query(..., description="ID de l'opérateur / Operator id"),
) -> list[UssdActionOut]:
    raise not_implemented()


@router.post(
    "/ussd-actions",
    response_model=UssdActionOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create a USSD action / Créer une action USSD",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_ussd_action(payload: UssdActionIn, user=Depends(require_roles("admin"))) -> UssdActionOut:
    raise not_implemented()


@router.patch(
    "/ussd-actions/{action_id}",
    response_model=UssdActionOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Update a USSD action / Modifier une action USSD",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def update_ussd_action(
    action_id: str, payload: UssdActionIn, user=Depends(require_roles("admin"))
) -> UssdActionOut:
    raise not_implemented()


@router.delete(
    "/ussd-actions/{action_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Delete a USSD action / Supprimer une action USSD",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def delete_ussd_action(action_id: str, user=Depends(require_roles("admin"))) -> Message:
    raise not_implemented()
