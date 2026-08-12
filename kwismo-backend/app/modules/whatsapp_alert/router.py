"""Routes /whatsapp-alerts/*. / WhatsApp alert routes."""

from fastapi import APIRouter, Depends, status

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
from app.modules.whatsapp_alert import service
from app.modules.whatsapp_alert.schemas import (
    WhatsAppAlertOut,
    WhatsAppBroadcastIn,
    WhatsAppIncidentIn,
    WhatsAppIncidentOut,
)

router = APIRouter(prefix="/whatsapp-alerts", tags=["WhatsApp Alert"])


@router.post(
    "/incident",
    response_model=WhatsAppIncidentOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Declare a hijacked WhatsApp / Déclarer un compte WhatsApp piraté",
    description=(
        "**FR** — Déclare un compte WhatsApp piraté pour l'un de mes numéros "
        "vérifiés (crée un `CompromiseIncident`).\n\n"
        "**EN** — Declares a hijacked WhatsApp account for one of my verified "
        "numbers (creates a `CompromiseIncident`)."
    ),
)
async def declare_whatsapp_incident(
    payload: WhatsAppIncidentIn, user=Depends(require_roles("user"))
) -> WhatsAppIncidentOut:
    return await service.declare_whatsapp_incident(user.id, payload, user.langue)


@router.post(
    "/broadcast",
    response_model=WhatsAppAlertOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Broadcast the alert / Diffuser l'alerte",
    description=(
        "**FR** — Diffuse l'alerte de compte piraté aux contacts sélectionnés.\n\n"
        "**EN** — Broadcasts the hijacked-account alert to the selected contacts."
    ),
)
async def broadcast_whatsapp_alert(
    payload: WhatsAppBroadcastIn, user=Depends(require_roles("user"))
) -> WhatsAppAlertOut:
    return await service.broadcast_whatsapp_alert(user.id, payload, user.langue)


@router.patch(
    "/incident/{incident_id}/close",
    response_model=WhatsAppIncidentOut,
    responses=AUTH_RESPONSES,
    summary="Close WhatsApp incident / Clôturer un incident WhatsApp",
    description=(
        "**FR** — Clôture un incident WhatsApp ouvert.\n\n"
        "**EN** — Closes an open WhatsApp incident."
    ),
)
async def close_whatsapp_incident(
    incident_id: str, user=Depends(require_roles("user"))
) -> WhatsAppIncidentOut:
    return await service.close_whatsapp_incident(user.id, incident_id, user.langue)
