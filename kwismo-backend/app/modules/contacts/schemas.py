"""Schemas Pydantic du module contacts. / Pydantic schemas for the contacts module.

Table Prisma : Contact. / Prisma table: Contact.

FR — Le statut vient du Modele A cote IA (insigne : securise / suspect /
frauduleux / inconnu).
EN — The status comes from the AI's Model A (badge: secure / suspicious /
fraudulent / unknown).
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ContactAddIn(BaseModel):
    nom: str = Field(..., examples=["Maman"])
    numero: str = Field(..., examples=["+237690000001"])


class ContactOut(BaseModel):
    """Table Contact. / Contact table."""

    id: str
    nom: str
    numero: str
    statut: str | None = Field(None, examples=["securise"], description="Insigne / Badge: securise, suspect, frauduleux, inconnu.")
    created_at: datetime
