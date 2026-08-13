"""Schemas Pydantic du module user_phones ("Mes numéros"). / Pydantic schemas for the user_phones module ("My numbers").

Table Prisma : UserPhone (+ CompromiseIncident). / Prisma table: UserPhone (+ CompromiseIncident).
"""

from datetime import datetime

from pydantic import BaseModel, Field


class UserPhoneAddIn(BaseModel):
    valeur: str = Field(..., examples=["+237690000000"])


class UserPhoneVerifyIn(BaseModel):
    code: str = Field(..., min_length=4, max_length=8)


class UserPhoneOut(BaseModel):
    """Table UserPhone. / UserPhone table."""

    id: str
    valeur: str
    country_id: str
    operator_id: str | None = None
    est_verifie: bool
    date_verification: datetime | None = None
    est_compromis: bool
    created_at: datetime


class CompromiseIncidentOut(BaseModel):
    """Table CompromiseIncident, renvoyee apres declaration. / CompromiseIncident table, returned after declaration."""

    id: str
    user_phone_id: str
    date_declaration: datetime
    statut: str = Field(..., examples=["open"])
