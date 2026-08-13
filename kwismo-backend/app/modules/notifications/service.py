"""Logique metier du module notifications. / Business logic for the notifications module."""

import logging

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
