"""Schemas Pydantic du module contacts. / Pydantic schemas for the contacts module.

Table Prisma : Contact. / Prisma table: Contact.

FR — Module ajoute au-dela de la liste normative du cahier §5 : la table
`Contact` (§4) et la fonctionnalite "liste de contacts a insignes" (cahier
IA §4, alimentee par le Modele A) n'ont pas de section de routes dediee dans
le cahier Backend, alors que `POST /whatsapp-alerts/broadcast` a besoin de
contacts selectionnables. Ce module comble ce trou pour que la table Contact
soit atteignable via l'API.
EN — Module added beyond the cahier's normative §5 list: the `Contact` table
(§4) and the "badge contact list" feature (AI spec §4, fed by Model A) have
no dedicated route section in the Backend spec, while
`POST /whatsapp-alerts/broadcast` needs selectable contacts. This module
closes that gap so the Contact table is reachable via the API.
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
