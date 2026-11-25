"""Schemas Pydantic pour la gestion des formules d'abonnement / Plans."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class SubscriptionPlanBase(BaseModel):
    code: str = Field(..., description="Identifiant unique du plan (ex: solo_monthly, family_yearly)")
    nom_fr: str = Field(..., description="Nom de la formule en français")
    nom_en: str = Field(..., description="Plan name in English")
    prix_fcfa: int = Field(..., ge=0, description="Prix en FCFA")
    duree_jours: int = Field(..., ge=1, description="Durée de validité en jours (ex: 7, 30, 365)")
    max_numeros: int = Field(default=1, ge=1, description="Nombre max de numéros protégés inclus")
    max_membres: int = Field(default=1, ge=1, description="Nombre max de personnes/comptes inclus")
    description_fr: Optional[str] = Field(default=None, description="Courte description en français")
    description_en: Optional[str] = Field(default=None, description="Short description in English")
    options_fr: Optional[list[str]] = Field(default=None, description="Liste des avantages/options en français")
    options_en: Optional[list[str]] = Field(default=None, description="List of benefits/features in English")
    badge_fr: Optional[str] = Field(default=None, description="Badge marketing en français (ex: Populaire)")
    badge_en: Optional[str] = Field(default=None, description="Marketing badge in English (ex: Popular)")
    est_actif: bool = Field(default=True, description="Statut actif / inactif")
    ordre: int = Field(default=0, description="Ordre d'affichage dans la liste")


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanUpdate(BaseModel):
    code: Optional[str] = None
    nom_fr: Optional[str] = None
    nom_en: Optional[str] = None
    prix_fcfa: Optional[int] = Field(default=None, ge=0)
    duree_jours: Optional[int] = Field(default=None, ge=1)
    max_numeros: Optional[int] = Field(default=None, ge=1)
    max_membres: Optional[int] = Field(default=None, ge=1)
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    options_fr: Optional[list[str]] = None
    options_en: Optional[list[str]] = None
    badge_fr: Optional[str] = None
    badge_en: Optional[str] = None
    est_actif: Optional[bool] = None
    ordre: Optional[int] = None


class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
