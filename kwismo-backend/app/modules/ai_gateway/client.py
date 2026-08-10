"""Appels HTTP vers le service IA. / HTTP calls to the AI service.

FR — Seul point du backend qui parle au service IA. Timeout court +
`fallback_rules` en cas d'echec : l'utilisateur n'est jamais bloque.
EN — The backend's only point of contact with the AI service. Short
timeout + `fallback_rules` on failure: the user is never blocked.
"""

import httpx

from app.core.config import get_settings
from app.modules.ai_gateway.schemas import (
    FeedbackAck,
    FeedbackIn,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
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


async def send_feedback(payload: FeedbackIn) -> FeedbackAck:
    async with httpx.AsyncClient(base_url=settings.ai_service_url, timeout=settings.ai_service_timeout_seconds) as client:
        response = await client.post("/feedback", json=payload.model_dump())
        response.raise_for_status()
        return FeedbackAck.model_validate(response.json())
