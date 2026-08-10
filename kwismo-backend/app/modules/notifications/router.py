"""Routes /notifications. / Notification routes."""

from fastapi import APIRouter, Depends

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Page
from app.modules.notifications.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=Page[NotificationOut],
    responses=AUTH_RESPONSES,
    summary="My notifications / Mes notifications",
    description=(
        "**FR** — Notifications de l'utilisateur, texte servi dans sa langue "
        "(en-tête `Accept-Language`, défaut FR).\n\n"
        "**EN** — The user's notifications, text served in their language "
        "(`Accept-Language` header, default FR)."
    ),
)
async def list_notifications(user=Depends(require_roles("user"))) -> Page[NotificationOut]:
    raise not_implemented()
