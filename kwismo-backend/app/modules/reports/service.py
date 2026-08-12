"""Logique metier du module reports. / Business logic for the reports module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.db.repositories.report_repository import ReportRepository
from app.modules.reports.schemas import ReportCreateIn, ReportOut, ReportValidateIn
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")
_reports = ReportRepository()

VALID_VALIDATE_STATUTS = {"validated", "rejected"}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _to_out(r) -> ReportOut:
    return ReportOut(
        id=r.id,
        user_id=r.userId,
        numero_id=r.numeroId,
        motif=r.motif,
        date_signalement=r.dateSignalement,
        statut=r.statut,
    )


# ---------------------------------------------------------------------------
# create_report
# ---------------------------------------------------------------------------

async def create_report(user_id: str, payload: ReportCreateIn) -> ReportOut:
    valeur = normalize_phone(payload.numero)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de numero invalide (E.164 attendu) / Invalid phone format (E.164 expected).",
        )

    # Upsert du numero dans le registre si absent.
    numero = await db.numero.find_unique(where={"valeur": valeur})
    if numero is None:
        numero = await db.numero.create(data={"valeur": valeur})

    # Eviter les doublons de signalement (meme user, meme numero, statut pending).
    existing = await db.report.find_first(
        where={"userId": user_id, "numeroId": numero.id, "statut": "pending"}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un signalement en attente existe deja pour ce numero / A pending report already exists for this number.",
        )

    report = await db.report.create(
        data={
            "userId": user_id,
            "numeroId": numero.id,
            "motif": payload.motif,
        }
    )

    # Recalculer le score du numero maintenant qu'un nouveau signalement existe.
    # Import local pour eviter la circularite.
    from app.modules.numbers.service import _score_and_upsert
    try:
        await _score_and_upsert(valeur)
    except Exception as exc:
        logger.warning("Recalcul score apres signalement echoue pour %s : %s", valeur, exc)

    return _to_out(report)


# ---------------------------------------------------------------------------
# list_reports
# ---------------------------------------------------------------------------

async def list_reports(page: int, page_size: int):
    from app.core.schemas import Page
    skip = (page - 1) * page_size
    total = await db.report.count()
    items = await db.report.find_many(
        skip=skip,
        take=page_size,
        order={"dateSignalement": "desc"},
    )
    return Page(items=[_to_out(r) for r in items], total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# validate_report
# ---------------------------------------------------------------------------

async def validate_report(report_id: str, payload: ReportValidateIn, admin_user_id: str | None = None) -> ReportOut:
    if payload.statut not in VALID_VALIDATE_STATUTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Statut invalide. Valeurs acceptees : {', '.join(VALID_VALIDATE_STATUTS)}",
        )
    report = await db.report.find_unique(where={"id": report_id})
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signalement introuvable / Report not found.")
    if report.statut != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce signalement a deja ete traite / This report has already been processed.",
        )

    updated = await db.report.update(where={"id": report_id}, data={"statut": payload.statut})

    # Si valide, forcer le statut du numero a "frauduleux" et recalculer.
    if payload.statut == "validated":
        numero = await db.numero.find_unique(where={"id": report.numeroId})
        if numero:
            await db.numero.update(
                where={"id": numero.id},
                data={"statut": "frauduleux"},
            )

    from app.core.audit_log import log_audit
    await log_audit(admin_user_id, f"validate_report:{payload.statut}", cible=report_id)

    # Notifier l'auteur du signalement.
    from app.modules.notifications.service import create_notification
    if payload.statut == "validated":
        await create_notification(report.userId, "report_validated")
    elif payload.statut == "rejected":
        await create_notification(report.userId, "report_rejected")

    # Enqueue feedback pour validation report (amélioration continue).
    from app.utils.feedback import enqueue_feedback
    feedback_msg = f"Report validé: {report.motif}" if payload.statut == "validated" else f"Report rejeté: {report.motif}"
    await enqueue_feedback(report.userId, "report", feedback_msg, report_id=report_id)

    return _to_out(updated)
