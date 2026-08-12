"""Routes /transactions/*. / Protected-transfer routes."""

from fastapi import APIRouter, Depends, Query

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.transactions import service
from app.modules.transactions.schemas import TransactionOut, TransactionPrepareIn

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "/prepare",
    response_model=TransactionOut,
    responses=AUTH_RESPONSES,
    summary="Prepare a transfer / Préparer un transfert",
    description=(
        "**FR** — Vérifie le numéro destinataire, évalue le risque et renvoie le code "
        "USSD à composer. Bloque les transferts vers des numéros frauduleux.\n\n"
        "**EN** — Verifies the recipient number, evaluates risk and returns the USSD "
        "code to dial. Blocks transfers to fraudulent numbers."
    ),
)
async def prepare_transaction(
    payload: TransactionPrepareIn, user=Depends(require_roles("user"))
) -> TransactionOut:
    return await service.prepare_transaction(user.id, payload)


@router.get(
    "",
    response_model=Page[TransactionOut],
    responses=AUTH_RESPONSES,
    summary="My transfer history / Historique de mes transferts",
    description="**FR** — Historique des transferts de l'utilisateur.\n\n**EN** — The user's transfer history.",
)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user=Depends(require_roles("user")),
) -> Page[TransactionOut]:
    return await service.list_transactions(user.id, page, page_size)


@router.get(
    "/{transaction_id}",
    response_model=TransactionOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get a transfer's detail / Détail d'un transfert",
    description="**FR** — Détail d'un transfert.\n\n**EN** — A transfer's detail.",
)
async def get_transaction(transaction_id: str, user=Depends(require_roles("user"))) -> TransactionOut:
    return await service.get_transaction(user.id, transaction_id)
