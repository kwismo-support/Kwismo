"""Schemas Pydantic du module partners. / Pydantic schemas for the partners module.

Tables Prisma : Partner, AffiliationRule, AffiliationRulePrefix.
Prisma tables: Partner, AffiliationRule, AffiliationRulePrefix.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class PartnerCreateIn(BaseModel):
    nom_entreprise: str = Field(..., examples=["MTN Cameroun"])
    type_partenariat: str = Field(..., examples=["operateur"])


class PartnerOut(BaseModel):
    """Table Partner. / Partner table."""

    id: str
    nom_entreprise: str
    type_partenariat: str
    date_adhesion: datetime


class PartnerKpiSummaryOut(BaseModel):
    numeros_affilies: int
    signalements_perimetre: int
    taux_fraude_perimetre: float = Field(..., ge=0, le=1)


class PartnerDetailOut(PartnerOut):
    kpi: PartnerKpiSummaryOut


class AffiliationRulePrefixOut(BaseModel):
    """Table AffiliationRulePrefix. / AffiliationRulePrefix table."""

    id: str
    prefixe: str = Field(..., examples=["651-654"])


class AffiliationRuleOut(BaseModel):
    """Table AffiliationRule. / AffiliationRule table."""

    id: str
    partner_id: str
    country_id: str
    prefixes: list[AffiliationRulePrefixOut] = []


class AffiliationRuleCreateIn(BaseModel):
    country_id: str
    prefixes: list[str] = Field(..., min_length=1, examples=[["69", "651-654", "68"]])


class PartnerScopeNumberOut(BaseModel):
    """Vue restreinte au périmètre partenaire. / Partner-scoped view."""

    id: str
    valeur: str
    statut: str
    score_risque: float


class PartnerScopeUserOut(BaseModel):
    id: str
    nom: str
    prenom: str
    nombre_numeros: int


class PartnerScopeKpiOut(BaseModel):
    """Table Kpi filtree sur le perimetre. / Kpi table filtered to the scope."""

    nom_indicateur: str
    valeur: float
    periode: str
