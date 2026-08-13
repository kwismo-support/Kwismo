"""Schemas Pydantic du module transactions. / Pydantic schemas for the transactions module.

Table Prisma : Transaction. Le backend ne deplace pas d'argent : il ne
stocke que des metadonnees (montant, statut, niveau de risque) et genere le
code USSD ; la transaction financiere reelle se deroule dans l'app native de
l'operateur.
Prisma table: Transaction. The backend never moves money: it only stores
metadata (amount, status, risk level) and generates the USSD code; the real
financial transaction happens in the operator's native app.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class TransactionPrepareIn(BaseModel):
    numero: str = Field(..., examples=["+237690000004"])
    montant: float = Field(..., gt=0, examples=[5000])
    operator_id: str
    ussd_action_id: str


class TransactionOut(BaseModel):
    """Table Transaction. / Transaction table."""

    id: str
    numero_id: str
    montant: float
    date_transaction: datetime
    statut: str = Field(..., examples=["prepared"], description="prepared | confirmed | cancelled")
    niveau_risque: str | None = None
    code_ussd_genere: str | None = None
