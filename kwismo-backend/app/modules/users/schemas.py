"""Schemas Pydantic du module users. / Pydantic schemas for the users module."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class DeviceSummaryOut(BaseModel):
    """Table Device. / Device table."""

    id: str
    nom: str
    premiere_connexion: datetime
    derniere_connexion: datetime


class UserKpiOut(BaseModel):
    """KPI personnels affiches sur le profil. / Personal KPIs shown on the profile."""

    numeros_verifies: int = Field(..., description="Nombre de numéros vérifiés / Verified numbers count.")
    signalements_effectues: int
    transferts_proteges: int


class UserMeOut(BaseModel):
    """Table User (vue du compte courant). / User table (current-account view)."""

    id: str
    nom: str
    prenom: str
    email: EmailStr
    email_verifie: bool
    statut: str = Field(..., examples=["active"])
    role: str = Field(..., examples=["user"])
    date_inscription: datetime
    kpi: UserKpiOut
    devices: list[DeviceSummaryOut] = []


class UserUpdateIn(BaseModel):
    nom: str | None = None
    prenom: str | None = None


class UserListItemOut(BaseModel):
    """Ligne de la liste paginee admin/partner. / Row of the admin/partner paginated list."""

    id: str
    nom: str
    prenom: str
    email: EmailStr
    statut: str
    nombre_numeros: int = Field(..., description="Numéros rattachés au compte / Numbers attached to the account.")


class UserPhoneSummaryOut(BaseModel):
    id: str
    valeur: str
    est_verifie: bool
    est_compromis: bool


class UserDetailOut(UserListItemOut):
    date_inscription: datetime
    numeros: list[UserPhoneSummaryOut] = []


class UserStatusIn(BaseModel):
    statut: str = Field(..., examples=["suspended"], description="'active' ou 'suspended' / 'active' or 'suspended'.")
