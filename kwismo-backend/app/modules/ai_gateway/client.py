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
    FullAnalysisIn,
    FullAnalysisOut,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
    ReportItemIn,
    TextIn,
)
from app.modules.ai_gateway.service import sync_discovered_categories

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


async def predict_full_analysis(payload: FullAnalysisIn) -> FullAnalysisOut:
    """Appelle la passerelle d'inférence intégrée (Modèle B -> Modèle A) et synchronise dynamiquement les catégories découvertes."""
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/predict/full_analysis", json=payload.model_dump())
        response.raise_for_status()
        out = FullAnalysisOut.model_validate(response.json())
        
        # Synchronisation automatique des nouvelles catégories découvertes avec la BD
        if out.categories:
            try:
                await sync_discovered_categories(out.categories)
            except Exception as err:
                print(f"⚠️ Avertissement : Impossible de synchroniser les catégories en BD : {err}")
                
        return out


async def send_feedback(payload: FeedbackIn) -> FeedbackAck:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/feedback", json=payload.model_dump())
        response.raise_for_status()
        return FeedbackAck.model_validate(response.json())


async def categorize_and_sync_reports(reports: list[dict[str, str]]) -> dict[str, str]:
    """Anonymise les signalements, appelle l'IA, crée les catégories manquantes en BD et lie les clés étrangères."""
    anonymized_items = [
        ReportItemIn(id_signalement=r["id_signalement"], description=r["description"])
        for r in reports
    ]

    batch_in = BatchReportIn(reports=anonymized_items)
    batch_out = await predict_batch_reports(batch_in)
    categories_map = batch_out.categories

    # Synchronisation avec la base de données (ScamCategory & ReportCategory)
    await sync_discovered_categories(categories_map)
    return categories_map
