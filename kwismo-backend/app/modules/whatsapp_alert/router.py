"""Routes /whatsapp-alerts/*. / WhatsApp alert routes."""

from fastapi import APIRouter, Depends, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
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
    raise not_implemented()


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
    raise not_implemented()
