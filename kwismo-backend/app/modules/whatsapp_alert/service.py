"""Logique metier du module whatsapp_alert. / Business logic for the whatsapp_alert module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.whatsapp_alert.schemas import (
    WhatsAppAlertOut,
    WhatsAppAlertRecipientOut,
    WhatsAppBroadcastIn,
    WhatsAppIncidentIn,
    WhatsAppIncidentOut,
)
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")

DEFAULT_ALERT_TEMPLATE = (
    "ALERTE KWISMO — Mon compte WhatsApp ({phone}) a été piraté. "
    "N'acceptez PAS de demandes d'argent venant de ce numéro. "
    "Signalez toute tentative d'escroquerie."
)


# ---------------------------------------------------------------------------
# declare_whatsapp_incident
# ---------------------------------------------------------------------------

async def declare_whatsapp_incident(user_id: str, payload: WhatsAppIncidentIn, lang: str = "fr") -> WhatsAppIncidentOut:
    phone = await db.userphone.find_unique(where={"id": payload.user_phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("phone_not_found", lang),
        )
    if not phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("phone_not_verified_for_incident", lang),
        )

    existing = await db.compromiseincident.find_first(
        where={"userPhoneId": payload.user_phone_id, "statut": "open"}
    )
    if existing:
        return WhatsAppIncidentOut(
            id=existing.id,
            compromise_incident_id=existing.id,
            statut=existing.statut,
        )

    if not phone.estCompromis:
        await db.userphone.update(where={"id": phone.id}, data={"estCompromis": True})

    incident = await db.compromiseincident.create(
        data={"userId": user_id, "userPhoneId": payload.user_phone_id}
    )
    return WhatsAppIncidentOut(
        id=incident.id,
        compromise_incident_id=incident.id,
        statut=incident.statut,
    )


# ---------------------------------------------------------------------------
# broadcast_whatsapp_alert
# ---------------------------------------------------------------------------

async def broadcast_whatsapp_alert(user_id: str, payload: WhatsAppBroadcastIn, lang: str = "fr") -> WhatsAppAlertOut:
    incident = await db.compromiseincident.find_unique(where={"id": payload.compromise_incident_id})
    if incident is None or incident.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("incident_not_found", lang),
        )

    phone = await db.userphone.find_unique(where={"id": incident.userPhoneId})
    phone_valeur = phone.valeur if phone else "inconnu"
    contenu = payload.contenu if payload.contenu else DEFAULT_ALERT_TEMPLATE.format(phone=phone_valeur)

    contacts = await db.contact.find_many(
        where={"id": {"in": payload.contact_ids}, "userId": user_id}
    )
    if not contacts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("no_valid_contacts", lang),
        )

    alert = await db.whatsappalert.create(
        data={
            "userId": user_id,
            "compromiseIncidentId": payload.compromise_incident_id,
            "contenu": contenu,
        }
    )

    recipients_out = []
    for contact in contacts:
        recipient = await db.whatsapalertrecipient.create(
            data={
                "whatsAppAlertId": alert.id,
                "contactId": contact.id,
                "statutAccuse": "envoye",
            }
        )
        recipients_out.append(
            WhatsAppAlertRecipientOut(
                contact_id=recipient.contactId,
                statut_accuse=recipient.statutAccuse,
            )
        )
        logger.info("[WHATSAPP ALERT] -> %s (%s) : %s", contact.nom, contact.numero, contenu)

    return WhatsAppAlertOut(
        id=alert.id,
        contenu=contenu,
        destinataires=recipients_out,
    )


async def close_whatsapp_incident(user_id: str, incident_id: str, lang: str = "fr") -> WhatsAppIncidentOut:
    incident = await db.compromiseincident.find_unique(where={"id": incident_id})
    if incident is None or incident.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("incident_not_found", lang),
        )
    if incident.statut == "closed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("incident_already_closed", lang),
        )

    updated = await db.compromiseincident.update(
        where={"id": incident_id},
        data={"statut": "closed"},
    )
    return WhatsAppIncidentOut(
        id=updated.id,
        compromise_incident_id=updated.id,
        statut=updated.statut,
    )
