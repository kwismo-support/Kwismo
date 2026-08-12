"""Routes /notifications. / Notification routes."""

from fastapi import APIRouter, Depends, Query

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Page
from app.modules.notifications import service
from app.modules.notifications.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=Page[NotificationOut],
    responses=AUTH_RESPONSES,
    summary="My notifications / Mes notifications",
    description=(
        "**FR** — Notifications de l'utilisateur, les plus récentes en premier.\n\n"
        "**EN** — The user's notifications, most recent first."
    ),
)
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user=Depends(require_roles("user")),
) -> Page[NotificationOut]:
    return await service.list_notifications(user.id, page, page_size)
