"""Schemas Pydantic du module whatsapp_alert. / Pydantic schemas for the whatsapp_alert module.

Tables Prisma : WhatsAppAlert, WhatsAppAlertRecipient (+ CompromiseIncident).
Prisma tables: WhatsAppAlert, WhatsAppAlertRecipient (+ CompromiseIncident).
"""

from datetime import datetime

from pydantic import BaseModel, Field


class WhatsAppIncidentIn(BaseModel):
    user_phone_id: str = Field(..., description="Numéro dont le compte WhatsApp est piraté / Number whose WhatsApp was hijacked.")


class WhatsAppIncidentOut(BaseModel):
    id: str
    compromise_incident_id: str
    user_phone_id: str
    numero: str = Field(..., description="Numéro compromis / Compromised number.")
    statut: str = Field(..., examples=["open"])


class WhatsAppBroadcastIn(BaseModel):
    compromise_incident_id: str
    contact_ids: list[str] = Field(..., min_length=1, description="Contacts sélectionnés / Selected contacts.")
    contenu: str | None = Field(None, description="Message personnalisé (sinon modèle par défaut) / Custom message (otherwise default template).")


class WhatsAppAlertRecipientOut(BaseModel):
    """Table WhatsAppAlertRecipient. / WhatsAppAlertRecipient table."""

    contact_id: str
    statut_accuse: str | None = Field(None, examples=["envoye"])


class WhatsAppAlertOut(BaseModel):
    """Table WhatsAppAlert. / WhatsAppAlert table."""

    id: str
    contenu: str
    date_envoi: datetime
    statut: str = Field(..., examples=["sent"])
    recipients: list[WhatsAppAlertRecipientOut] = []
