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

logger = logging.getLogger("kwismo.backend")

DEFAULT_ALERT_TEMPLATE = (
    "ALERTE KWISMO — Mon compte WhatsApp ({phone}) a été piraté. "
    "N'acceptez PAS de demandes d'argent venant de ce numéro. "
    "Signalez toute tentative d'escroquerie."
)


# ---------------------------------------------------------------------------
# declare_whatsapp_incident
# ---------------------------------------------------------------------------

async def declare_whatsapp_incident(user_id: str, payload: WhatsAppIncidentIn) -> WhatsAppIncidentOut:
    # Verifier que le UserPhone appartient a l'utilisateur et est verifie.
    phone = await db.userphone.find_unique(where={"id": payload.user_phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Numero introuvable / Phone not found.",
        )
    if not phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seul un numero verifie peut faire l'objet d'une declaration / Only a verified number can be declared.",
        )

    # Verifier qu'il n'y a pas deja un incident ouvert pour ce numero.
    existing = await db.compromiseincident.find_first(
        where={"userPhoneId": payload.user_phone_id, "statut": "open"}
    )
    if existing:
        return WhatsAppIncidentOut(
            id=existing.id,
            compromise_incident_id=existing.id,
            statut=existing.statut,
        )

    # Marquer le numero compromis si ce n'est pas deja fait.
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

async def broadcast_whatsapp_alert(user_id: str, payload: WhatsAppBroadcastIn) -> WhatsAppAlertOut:
    # Verifier que l'incident appartient a l'utilisateur.
    incident = await db.compromiseincident.find_unique(where={"id": payload.compromise_incident_id})
    if incident is None or incident.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable / Incident not found.",
        )

    # Recuperer le numero compromis pour le message par defaut.
    phone = await db.userphone.find_unique(where={"id": incident.userPhoneId})
    phone_valeur = phone.valeur if phone else "inconnu"

    # Construire le message.
    contenu = payload.contenu if payload.contenu else DEFAULT_ALERT_TEMPLATE.format(phone=phone_valeur)

    # Verifier que les contacts appartiennent a l'utilisateur.
    contacts = await db.contact.find_many(
        where={"id": {"in": payload.contact_ids}, "userId": user_id}
    )
    if not contacts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun contact valide fourni / No valid contacts provided.",
        )

    # Creer l'alerte.
    alert = await db.whatsappalert.create(
        data={
            "userId": user_id,
            "compromiseIncidentId": payload.compromise_incident_id,
            "contenu": contenu,
        }
    )

    # Creer les destinataires.
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
        # Simuler l'envoi (log en dev — brancher WhatsApp Business API ici).
        logger.info(
            "[WHATSAPP ALERT] -> %s (%s) : %s",
            contact.nom,
            contact.numero,
            contenu,
        )

async def close_whatsapp_incident(user_id: str, incident_id: str) -> WhatsAppIncidentOut:
    """Clôture un incident WhatsApp ouvert."""
    incident = await db.compromiseincident.find_unique(where={"id": incident_id})
    if incident is None or incident.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident introuvable / Incident not found.",
        )
    if incident.statut == "closed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet incident est déjà clôturé / This incident is already closed.",
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
