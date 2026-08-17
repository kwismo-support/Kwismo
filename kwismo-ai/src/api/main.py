"""Point d'entrée FastAPI du service d'inférence KWISMO.

Ce service ne se connecte jamais à la base de données : il reçoit ses données
du backend et lui renvoie ses prédictions.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.middleware import SlowAPIMiddleware

from src.api.errors import limiter, register_error_handlers
from src.api.middleware import MaxBodySizeMiddleware
from src.api.schemas import (
    AiHealthOut,
    AiVersionOut,
    BatchReportIn,
    BatchReportOut,
    FeedbackAck,
    FeedbackIn,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
    TextIn,
)
from src.config import get_settings
from src.models.model_b.preprocess import categorize_description, extract_entities, process_report_batch

DESCRIPTION = """
**FR** — Service d'inférence KWISMO : Modèle A (scoring de réputation des numéros)
et Modèle B (détection d'arnaque texte, NER & auto-catégorisation dynamique).
Appelé uniquement par le backend via l'API Gateway.
"""

TAGS_METADATA = [
    {"name": "Prediction", "description": "Inférence Modèle A / Modèle B."},
    {"name": "Feedback", "description": "Apprentissage continu."},
    {"name": "System", "description": "Santé & version du modèle chargé."},
]

settings = get_settings()

app = FastAPI(
    title="KWISMO AI Inference API",
    description=DESCRIPTION,
    version="0.1.0",
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Robustesse & Middlewares
app.state.limiter = limiter
register_error_handlers(app)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(MaxBodySizeMiddleware)


@app.post(
    "/predict/number",
    response_model=PredictNumberOut,
    tags=["Prediction"],
    summary="Score a number / Scorer un numéro",
)
async def predict_number(payload: NumberFeaturesIn) -> PredictNumberOut:
    score = 0.0
    statut = "securise"
    explications = []

    if payload.nombre_signalements >= 3:
        score = 0.85
        statut = "frauduleux"
        explications.append("Nombre élevé de signalements d'utilisateurs distincts.")
    elif payload.nombre_signalements >= 1 or payload.nombre_verifications >= 5:
        score = 0.55
        statut = "a_signaler"
        explications.append("Pics de vérifications récents ou signalement suspect.")

    return PredictNumberOut(
        score_risque=score,
        statut=statut,
        modele_utilise="regles_expertes_v1",
        explications=explications,
    )


@app.post(
    "/predict/text",
    response_model=PredictTextOut,
    tags=["Prediction"],
    summary="Analyze a message / Analyser un message (Modèle B + NER)",
)
async def predict_text(payload: TextIn) -> PredictTextOut:
    cat = categorize_description(payload.texte)
    entities = extract_entities(payload.texte)
    est_arnaque = cat != "legitimate_info" and cat != "unknown_scam_pattern"
    prob = 0.95 if est_arnaque else 0.05

    return PredictTextOut(
        probabilite_arnaque=prob,
        est_arnaque=est_arnaque,
        categorie_detectee=cat,
        entites_extraites=entities,
        modele_utilise="model_b_v1",
    )


@app.post(
    "/predict/batch_reports",
    response_model=BatchReportOut,
    tags=["Prediction"],
    summary="Categorize batch of reports / Catégoriser un lot de signalements (Modèle B)",
)
async def predict_batch_reports(payload: BatchReportIn) -> BatchReportOut:
    reports_dict = [{"id_signalement": r.id_signalement, "description": r.description} for r in payload.reports]
    updated_categories = process_report_batch(reports_dict, payload.cache_categories)
    return BatchReportOut(categories=updated_categories)


@app.post(
    "/feedback",
    response_model=FeedbackAck,
    tags=["Feedback"],
    summary="Send labeled feedback / Transmettre une donnée étiquetée",
)
async def feedback(payload: FeedbackIn) -> FeedbackAck:
    return FeedbackAck(recu=True)


@app.get(
    "/health",
    response_model=AiHealthOut,
    tags=["System"],
    summary="Health check / Vérification de santé",
)
async def health() -> AiHealthOut:
    return AiHealthOut(status="ok", model_a_loaded=True, model_b_loaded=True)


@app.get(
    "/version",
    response_model=AiVersionOut,
    tags=["System"],
    summary="Loaded model versions / Versions des modèles chargés",
)
async def version() -> AiVersionOut:
    return AiVersionOut(
        model_a_version=settings.model_a_version,
        model_b_version=settings.model_b_version,
    )
