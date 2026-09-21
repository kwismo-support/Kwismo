"""Logique metier du module notifications. / Business logic for the notifications module."""

import logging
from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.notifications.schemas import NotificationOut
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# list_notifications
# ---------------------------------------------------------------------------

async def list_notifications(user_id: str, page: int, page_size: int):
    from app.core.schemas import Page

    skip = (page - 1) * page_size
    total = await db.notification.count(where={"userId": user_id})
    items = await db.notification.find_many(
        where={"userId": user_id},
        skip=skip,
        take=page_size,
        order={"date": "desc"},
    )
    out = [
        NotificationOut(id=n.id, texte=n.texte, lu=n.lu, date=n.date)
        for n in items
    ]
    return Page(items=out, total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_notification_detail & delete_notification
# ---------------------------------------------------------------------------

async def get_notification_detail(notif_id: str, user_id: str) -> NotificationOut:
    notif = await db.notification.find_first(where={"id": notif_id, "userId": user_id})
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification introuvable.",
        )
    if not notif.lu:
        await db.notification.update(where={"id": notif_id}, data={"lu": True})
        notif.lu = True

    return NotificationOut(id=notif.id, texte=notif.texte, lu=notif.lu, date=notif.date)


async def delete_notification(notif_id: str, user_id: str) -> None:
    notif = await db.notification.find_first(where={"id": notif_id, "userId": user_id})
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification introuvable.",
        )
    await db.notification.delete(where={"id": notif_id})


# ---------------------------------------------------------------------------
# mark_as_read & mark_all_read
# ---------------------------------------------------------------------------

async def mark_as_read(notif_id: str, user_id: str) -> None:
    await db.notification.update_many(
        where={"id": notif_id, "userId": user_id},
        data={"lu": True},
    )


async def mark_all_read(user_id: str) -> None:
    await db.notification.update_many(
        where={"userId": user_id, "lu": False},
        data={"lu": True},
    )


# ---------------------------------------------------------------------------
# Utilitaire interne : creer une notification
# ---------------------------------------------------------------------------

async def create_notification(user_id: str, message_key: str, lang: str = "fr") -> None:
    """Cree une notification pour un utilisateur avec i18n.
    Appele par d'autres modules (ex. apres un signalement valide, un transfert risque).
    """
    try:
        texte = t(message_key, lang)
        await db.notification.create(data={"userId": user_id, "texte": texte})
    except Exception as exc:
        logger.warning("Impossible de creer la notification pour %s : %s", user_id, exc)
