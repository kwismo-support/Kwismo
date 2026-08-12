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

async def prepare_transaction(user_id: str, payload: TransactionPrepareIn) -> TransactionOut:
    valeur = normalize_phone(payload.numero)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de numero invalide (E.164 attendu) / Invalid phone format (E.164 expected).",
        )

    # Verifier que l'operateur existe.
    operator = await db.operator.find_unique(where={"id": payload.operator_id})
    if operator is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operateur introuvable / Operator not found.",
        )

    # Verifier que l'action USSD existe et appartient a l'operateur.
    ussd_action = await db.ussdaction.find_unique(where={"id": payload.ussd_action_id})
    if ussd_action is None or ussd_action.operatorId != payload.operator_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action USSD introuvable ou incompatible avec l'operateur / USSD action not found or mismatched operator.",
        )

    # Recuperer ou verifier le numero destinataire.
    numero = await db.numero.find_unique(where={"valeur": valeur})
    if numero is None:
        # Creer une entree minimale dans le registre.
        numero = await db.numero.create(data={"valeur": valeur})

    # Bloquer si le numero est marque frauduleux.
    if numero.statut == "frauduleux":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Transfert bloque : le numero destinataire est signale comme frauduleux. "
                "/ Transfer blocked: recipient number is flagged as fraudulent."
            ),
        )

    # Determiner le niveau de risque.
    niveau_risque = RISK_THRESHOLDS.get(numero.statut, "faible")

    # Generer le code USSD.
    code_ussd = _generate_ussd(ussd_action.format, payload.montant, valeur)

    # Persister la transaction.
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

    # Notifier si risque eleve ou moyen.
    from app.modules.notifications.service import create_notification
    if niveau_risque == "eleve":
        await create_notification(user_id, "transaction_risk_high")
    elif niveau_risque == "moyen":
        await create_notification(user_id, "transaction_risk_medium")

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

async def get_transaction(user_id: str, transaction_id: str) -> TransactionOut:
    transaction = await db.transaction.find_unique(where={"id": transaction_id})
    if transaction is None or transaction.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction introuvable / Transaction not found.",
        )
    return _to_out(transaction)
