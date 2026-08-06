"""Schemas Pydantic du module kpi. / Pydantic schemas for the kpi module.

Table Prisma : Kpi. / Prisma table: Kpi.
"""

from pydantic import BaseModel, Field


class KpiOut(BaseModel):
    """Table Kpi. / Kpi table."""

    id: str
    nom_indicateur: str = Field(..., examples=["taux_fraude_detectee"])
    valeur: float
    periode: str = Field(..., examples=["2026-08"])
    portee: str = Field(..., examples=["global"], description="global | partner")
