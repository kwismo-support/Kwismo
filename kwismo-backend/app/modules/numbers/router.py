"""Routes /numbers/*. / Number reputation routes."""

from fastapi import APIRouter, Depends, Query

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.numbers import service
from app.modules.numbers.schemas import (
    NumberBatchVerifyIn,
    NumberDetailOut,
    NumberOut,
    NumberStatusIn,
    NumberSyncOut,
    NumberVerifyIn,
)

router = APIRouter(prefix="/numbers", tags=["Numbers"])


@router.post(
    "/verify",
    response_model=NumberOut,
    responses=AUTH_RESPONSES,
    summary="Verify a number / Vérifier un numéro",
    description=(
        "**FR** — Vérifie un numéro renvoie son score de risque et son statut.\n\n"
        "**EN** — Verifies a number and returns its risk score and status."
    ),
)
async def verify_number(payload: NumberVerifyIn, user=Depends(require_roles("user"))) -> NumberOut:
    return await service.verify_number(payload, user.langue)


@router.post(
    "/batch-verify",
    response_model=list[NumberOut],
    responses=AUTH_RESPONSES,
    summary="Batch-verify numbers / Vérifier une liste de numéros",
    description=(
        "**FR** — Vérifie une liste de numéros en un seul appel.\n\n"
        "**EN** — Verifies a list of numbers in a single call."
    ),
)
async def batch_verify_numbers(
    payload: NumberBatchVerifyIn, user=Depends(require_roles("user"))
) -> list[NumberOut]:
    return await service.batch_verify_numbers(payload)


@router.get(
    "/sync",
    response_model=NumberSyncOut,
    responses=AUTH_RESPONSES,
    summary="Delta sync numbers / Synchronisation hors-ligne des numéros et seuils",
    description=(
        "**FR** — Synchronisation delta des numéros mis à jour et des seuils pour SQLite local.\n\n"
        "**EN** — Delta sync updated numbers and active risk threshold configuration."
    ),
)
async def sync_numbers(
    since: str | None = Query(None, description="ISO timestamp de la dernière synchro"),
    user=Depends(require_roles("user", "admin", "partner")),
) -> NumberSyncOut:
    return await service.sync_numbers(since)



@router.get(
    "",
    response_model=Page[NumberOut],
    responses=AUTH_RESPONSES,
    summary="List numbers / Lister les numéros",
    description=(
        "**FR** — Liste paginée du registre avec filtres statut/pays/opérateur.\n\n"
        "**EN** — Paginated listing of the number ledger with status/country/operator filters."
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
    return await service.list_numbers(page, page_size, statut, country_id, operator_id)


@router.get(
    "/{number_id}",
    response_model=NumberDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get a number's detail / Détail d'un numéro",
    description=(
        "**FR** — Détail d'un numéro et son historique.\n\n"
        "**EN** — A number's detail and its history."
    ),
)
async def get_number(number_id: str, user=Depends(require_roles("admin", "partner"))) -> NumberDetailOut:
    return await service.get_number(number_id, user.langue)


@router.patch(
    "/{number_id}/status",
    response_model=NumberDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Force a number's status / Forcer le statut d'un numéro",
    description=(
        "**FR** — Force un statut ou déclenche une réanalyse.\n\n"
        "**EN** — Forces a status or triggers re-analysis."
    ),
)
async def set_number_status(
    number_id: str, payload: NumberStatusIn, user=Depends(require_roles("admin", "partner"))
) -> NumberDetailOut:
    return await service.set_number_status(number_id, payload, user.langue)
