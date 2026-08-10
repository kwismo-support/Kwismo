"""Routes /numbers/*. / Number reputation routes."""

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.numbers.schemas import (
    NumberBatchVerifyIn,
    NumberDetailOut,
    NumberOut,
    NumberStatusIn,
    NumberVerifyIn,
)

router = APIRouter(prefix="/numbers", tags=["Numbers"])


@router.post(
    "/verify",
    response_model=NumberOut,
    responses=AUTH_RESPONSES,
    summary="Verify a number / Vérifier un numéro",
    description=(
        "**FR** — Vérifie un numéro (appelle le service IA via `ai_gateway`) et "
        "renvoie son score de risque et son statut.\n\n"
        "**EN** — Verifies a number (calls the AI service via `ai_gateway`) and "
        "returns its risk score and status."
    ),
)
async def verify_number(payload: NumberVerifyIn, user=Depends(require_roles("user"))) -> NumberOut:
    raise not_implemented()


@router.post(
    "/batch-verify",
    response_model=list[NumberOut],
    responses=AUTH_RESPONSES,
    summary="Batch-verify numbers / Vérifier une liste de numéros",
    description=(
        "**FR** — Vérifie une liste de numéros (ex. import de contacts) en un seul "
        "appel.\n\n"
        "**EN** — Verifies a list of numbers (e.g. contacts import) in a single call."
    ),
)
async def batch_verify_numbers(
    payload: NumberBatchVerifyIn, user=Depends(require_roles("user"))
) -> list[NumberOut]:
    raise not_implemented()


@router.get(
    "",
    response_model=Page[NumberOut],
    responses=AUTH_RESPONSES,
    summary="List numbers / Lister les numéros",
    description=(
        "**FR** — Liste paginée du registre de numéros, avec filtres statut/pays/"
        "opérateur.\n\n"
        "**EN** — Paginated listing of the number ledger, with status/country/"
        "operator filters."
    ),
)
async def list_numbers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    statut: str | None = Query(None),
    country_id: str | None = Query(None),
    operator_id: str | None = Query(None),
    user=Depends(require_roles("admin", "partner")),
) -> Page[NumberOut]:
    raise not_implemented()


@router.get(
    "/{number_id}",
    response_model=NumberDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get a number's detail / Détail d'un numéro",
    description=(
        "**FR** — Détail d'un numéro et son historique de vérification.\n\n"
        "**EN** — A number's detail and its verification history."
    ),
)
async def get_number(number_id: str, user=Depends(require_roles("admin", "partner"))) -> NumberDetailOut:
    raise not_implemented()


@router.patch(
    "/{number_id}/status",
    response_model=NumberDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Force a number's status / Forcer le statut d'un numéro",
    description=(
        "**FR** — Force un statut ou déclenche une réanalyse par l'IA.\n\n"
        "**EN** — Forces a status or triggers AI re-analysis."
    ),
)
async def set_number_status(
    number_id: str, payload: NumberStatusIn, user=Depends(require_roles("admin", "partner"))
) -> NumberDetailOut:
    raise not_implemented()
