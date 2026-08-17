"""Appels HTTP vers le service IA et synchronisation avec la base de données.

Seul point du backend qui parle au service IA. Anonymisation stricte (aucune donnée utilisateur transmise).
"""

import httpx
from app.core.config import get_settings
from app.db.prisma import prisma
from app.modules.ai_gateway.schemas import (
    BatchReportIn,
    BatchReportOut,
    FeedbackAck,
    FeedbackIn,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
    ReportItemIn,
    TextIn,
)

settings = get_settings()


async def predict_number(payload: NumberFeaturesIn) -> PredictNumberOut:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/predict/number", json=payload.model_dump())
        response.raise_for_status()
        return PredictNumberOut.model_validate(response.json())


async def predict_text(payload: TextIn) -> PredictTextOut:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/predict/text", json=payload.model_dump())
        response.raise_for_status()
        return PredictTextOut.model_validate(response.json())


async def predict_batch_reports(payload: BatchReportIn) -> BatchReportOut:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/predict/batch_reports", json=payload.model_dump())
        response.raise_for_status()
        return BatchReportOut.model_validate(response.json())


async def send_feedback(payload: FeedbackIn) -> FeedbackAck:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/feedback", json=payload.model_dump())
        response.raise_for_status()
        return FeedbackAck.model_validate(response.json())


async def categorize_and_sync_reports(reports: list[dict[str, str]]) -> dict[str, str]:
    """Anonymise les signalements, appelle l'IA, crée les catégories manquantes en BD et lie les clés étrangères."""
    # 1. Anonymisation (uniquement id_signalement et description)
    anonymized_items = [
        ReportItemIn(id_signalement=r["id_signalement"], description=r["description"])
        for r in reports
    ]

    # 2. Appel du service IA avec batching et cache
    batch_in = BatchReportIn(reports=anonymized_items)
    batch_out = await predict_batch_reports(batch_in)
    categories_map = batch_out.categories

    # 3. Synchronisation avec la base de données (ScamCategory & ReportCategory)
    for report_id, cat_code in categories_map.items():
        if not cat_code or cat_code in ("unknown_scam_pattern", "uncategorized_empty"):
            continue

        # Créer la catégorie d'arnaque si elle n'existe pas en BD
        scam_cat = await prisma.scamcategory.find_unique(where={"nomCode": cat_code})
        if not scam_cat:
            scam_cat = await prisma.scamcategory.create(
                data={
                    "nomCode": cat_code,
                    "libelle": cat_code.replace("_", " ").title(),
                    "description": f"Catégorie détectée dynamiquement par le Modèle B: {cat_code}",
                }
            )

        # Lier le signalement à la catégorie en BD (si le reportId existe dans la BD)
        try:
            db_report = await prisma.report.find_unique(where={"id": report_id})
            if db_report:
                await prisma.reportcategory.upsert(
                    where={"reportId_scamCategoryId": {"reportId": report_id, "scamCategoryId": scam_cat.id}},
                    data={
                        "create": {"reportId": report_id, "scamCategoryId": scam_cat.id},
                        "update": {},
                    },
                )
        except Exception:
            pass  # Si l'ID est un ID virtuel/test

    return categories_map
