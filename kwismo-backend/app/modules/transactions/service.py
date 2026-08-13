"""Logique metier du module transactions. / Business logic for the transactions module.

FR — Le backend ne deplace jamais d'argent : il verifie le numero
destinataire, genere le code USSD a composer dans l'app operateur, et
conserve les metadonnees de la transaction.
EN — The backend never moves money: it verifies the recipient number,
generates the USSD code to dial in the operator's app, and stores the
transaction metadata.
"""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.db.repositories.transaction_repository import TransactionRepository
from app.modules.transactions.schemas import TransactionOut, TransactionPrepareIn
from app.utils.i18n import t
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")
_transactions = TransactionRepository()

RISK_THRESHOLDS = {
    "frauduleux": "eleve",
    "a_signaler": "moyen",
    "securise": "faible",
    "unknown": "faible",
}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _to_out(t) -> TransactionOut:
    return TransactionOut(
        id=t.id,
        numero_id=t.numeroId,
        montant=t.montant,
        date_transaction=t.dateTransaction,
        statut=t.statut,
        niveau_risque=t.niveauRisque,
        code_ussd_genere=t.codeUSSDGenere,
    )


def _generate_ussd(template: str, montant: float, numero: str) -> str:
    """Remplace {montant} et {numero} dans le gabarit USSD.
    Ex. '*126*{montant}*{numero}#' -> '*126*5000*+237690000004#'
    """
    return template.replace("{montant}", str(int(montant))).replace("{numero}", numero)


# ---------------------------------------------------------------------------
# prepare_transaction
# ---------------------------------------------------------------------------

async def prepare_transaction(user_id: str, payload: TransactionPrepareIn, lang: str = "fr") -> TransactionOut:
    valeur = normalize_phone(payload.numero)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("invalid_phone_format", lang),
        )

    operator = await db.operator.find_unique(where={"id": payload.operator_id})
    if operator is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("operator_not_found", lang),
        )

    ussd_action = await db.ussdaction.find_unique(where={"id": payload.ussd_action_id})
    if ussd_action is None or ussd_action.operatorId != payload.operator_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("ussd_action_not_found", lang),
        )

    numero = await db.numero.find_unique(where={"valeur": valeur})
    if numero is None:
        numero = await db.numero.create(data={"valeur": valeur})

    if numero.statut == "frauduleux":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=t("transfer_blocked_fraud", lang),
        )

    niveau_risque = RISK_THRESHOLDS.get(numero.statut, "faible")
    code_ussd = _generate_ussd(ussd_action.format, payload.montant, valeur)

    transaction = await db.transaction.create(
        data={
            "userId": user_id,
            "numeroId": numero.id,
            "countryId": operator.countryId,
            "operatorId": payload.operator_id,
            "ussdActionId": payload.ussd_action_id,
            "montant": payload.montant,
            "niveauRisque": niveau_risque,
            "codeUSSDGenere": code_ussd,
        }
    )

    from app.modules.notifications.service import create_notification
    if niveau_risque == "eleve":
        await create_notification(user_id, "transaction_risk_high", lang)
    elif niveau_risque == "moyen":
        await create_notification(user_id, "transaction_risk_medium", lang)

    return _to_out(transaction)


# ---------------------------------------------------------------------------
# list_transactions
# ---------------------------------------------------------------------------

async def list_transactions(user_id: str, page: int, page_size: int):
    from app.core.schemas import Page
    skip = (page - 1) * page_size
    total = await db.transaction.count(where={"userId": user_id})
    items = await db.transaction.find_many(
        where={"userId": user_id},
        skip=skip,
        take=page_size,
        order={"dateTransaction": "desc"},
    )
    return Page(items=[_to_out(t) for t in items], total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_transaction
# ---------------------------------------------------------------------------

async def get_transaction(user_id: str, transaction_id: str, lang: str = "fr") -> TransactionOut:
    transaction = await db.transaction.find_unique(where={"id": transaction_id})
    if transaction is None or transaction.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("transaction_not_found", lang),
        )
    return _to_out(transaction)
