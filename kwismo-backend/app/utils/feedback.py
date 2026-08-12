"""Utilitaires pour les feedbacks utilisateur."""

import logging

from app.db.prisma_client import db

logger = logging.getLogger("kwismo.backend")


async def enqueue_feedback(
    user_id: str,
    type_retour: str,
    contenu: str,
    report_id: str | None = None,
) -> None:
    """Ajoute un feedback à la queue (pour analyse/amélioration).
    
    Args:
        user_id: ID de l'utilisateur qui envoie le feedback
        type_retour: Type de feedback ("report", "transaction", "other")
        contenu: Contenu du feedback
        report_id: ID du report associé (si type_retour="report")
    """
    try:
        await db.feedback.create(
            data={
                "userId": user_id,
                "typeRetour": type_retour,
                "contenu": contenu,
                "reportId": report_id,
            }
        )
    except Exception as exc:
        logger.warning(f"Impossible d'ajouter le feedback pour {user_id} : {exc}")