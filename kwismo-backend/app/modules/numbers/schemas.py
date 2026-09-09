"""Schemas Pydantic du module numbers. / Pydantic schemas for the numbers module.

Table Prisma : Numero (registre de reputation de TOUT numero analyse — pas
seulement ceux possedes par un compte KWISMO, cf. UserPhone).
Prisma table: Numero (reputation ledger for ANY analyzed number — not only
those owned by a KWISMO account, see UserPhone).
"""

from datetime import datetime

from pydantic import BaseModel, Field


class NumberVerifyIn(BaseModel):
    valeur: str = Field(..., examples=["+237690000002"])
    country_id: str | None = None


class NumberBatchVerifyIn(BaseModel):
    numeros: list[str] = Field(..., min_length=1, examples=[["+237690000002", "+237651111111"]])


class NumberOut(BaseModel):
    """Table Numero. / Numero table."""

    id: str
    valeur: str
    score_risque: float = Field(..., ge=0, le=1)
    statut: str = Field(..., examples=["securise"], description="securise | a_signaler | frauduleux")
    date_derniere_verification: datetime | None = None
    country_id: str | None = None
    operator_id: str | None = None


class NumberDetailOut(NumberOut):
    """Detail + historique de verification. / Detail + verification history."""

    created_at: datetime
    updated_at: datetime
    nombre_signalements: int = 0


class NumberStatusIn(BaseModel):
    statut: str = Field(..., examples=["frauduleux"])
    reanalyser: bool = Field(False, description="Forcer un nouvel appel a l'IA / Force a new AI call.")


class NumberSyncOut(BaseModel):
    items: list[NumberOut]
    threshold_rules: list[dict]
    synced_at: datetime

