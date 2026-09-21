"""Routes /notifications. / Notification routes."""

from fastapi import APIRouter, Depends, Query, status

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Message, Page, NOT_FOUND_RESPONSE
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
    user=Depends(require_roles("user", "admin", "partner", "superadmin")),
) -> Page[NotificationOut]:
    return await service.list_notifications(user.id, page, page_size)


@router.get(
    "/{notif_id}",
    response_model=NotificationOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get notification detail / Obtenir le détail d'une notification",
)
async def get_notification_detail(
    notif_id: str,
    user=Depends(require_roles("user", "admin", "partner", "superadmin")),
) -> NotificationOut:
    return await service.get_notification_detail(notif_id, user.id)


@router.delete(
    "/{notif_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Delete a notification / Supprimer une notification",
)
async def delete_notification(
    notif_id: str,
    user=Depends(require_roles("user", "admin", "partner", "superadmin")),
) -> Message:
    await service.delete_notification(notif_id, user.id)
    return Message(message="Notification supprimée.")


@router.patch(
    "/read-all",
    response_model=Message,
    responses=AUTH_RESPONSES,
    summary="Mark all notifications as read / Tout marquer comme lu",
)
async def mark_all_read(
    user=Depends(require_roles("user", "admin", "partner", "superadmin")),
) -> Message:
    await service.mark_all_read(user.id)
    return Message(message="Toutes les notifications ont été marquées comme lues.")


@router.patch(
    "/{notif_id}/read",
    response_model=Message,
    responses=AUTH_RESPONSES,
    summary="Mark a notification as read / Marquer comme lue",
)
async def mark_as_read(
    notif_id: str,
    user=Depends(require_roles("user", "admin", "partner", "superadmin")),
) -> Message:
    await service.mark_as_read(notif_id, user.id)
    return Message(message="Notification marquée comme lue.")
