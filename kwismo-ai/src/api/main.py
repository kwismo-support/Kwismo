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
    FullAnalysisIn,
    FullAnalysisOut,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
    TextIn,
)
from src.config import get_settings
from src.models.model_a.predict import predict as predict_model_a
from src.models.model_b.preprocess import categorize_description, extract_entities, process_report_batch

DESCRIPTION = """
**FR** — Service d'inférence KWISMO : Modèle A (scoring de réputation des numéros)
et Modèle B (détection d'arnaque texte, NER & auto-catégorisation dynamique).
Appelé uniquement par le backend via l'API Gateway.
"""

TAGS_METADATA = [
    {"name": "Prediction", "description": "Inférence Modèle A / Modèle B / Gateway Intégrée."},
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
    summary="Score a number / Scorer un numéro (Modèle A)",
)
async def predict_number(payload: NumberFeaturesIn) -> PredictNumberOut:
    score, explications, modele_utilise = predict_model_a(payload.model_dump())
    return PredictNumberOut(
        score_risque=score,
        modele_utilise=modele_utilise,
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
    est_arnaque = not cat.startswith("legitimate_") and cat != "unknown_scam_pattern"
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
    summary="Categorize batch of reports / Catégoriser un lot de signalements (Modèle B avec Skip-Cache)",
)
async def predict_batch_reports(payload: BatchReportIn) -> BatchReportOut:
    reports_dict = [{"id_signalement": r.id_signalement, "description": r.description} for r in payload.reports]
    updated_categories = process_report_batch(reports_dict, payload.cache_categories)
    return BatchReportOut(categories=updated_categories)


@app.post(
    "/predict/full_analysis",
    response_model=FullAnalysisOut,
    tags=["Prediction"],
    summary="Passerelle IA Intégrée / Séquence Modèle B -> Modèle A sans accès direct BD",
)
async def predict_full_analysis(payload: FullAnalysisIn) -> FullAnalysisOut:
    """Orchestration globale pour le backend :
    1. Traite les descriptions avec le Modèle B (skip-cache sur les déjà catégorisées).
    2. Transmet les catégories et la dynamique temporelle des vérifications/signalements au Modèle A.
    3. Renvoie au backend le score du numéro (0.0-1.0), les explications et les catégories attribuées aux IDs.
    """
    # 1. Traitement NLP Modèle B
    reports_dict = [{"id_signalement": r.id_signalement, "description": r.description} for r in payload.reports]
    assigned_categories = process_report_batch(reports_dict, payload.cache_categories)

    # 2. Scoring comportemental & temporel Modèle A
    model_a_input = {
        "numero": payload.numero,
        "nombre_verifications": payload.nombre_verifications,
        "horodatages_verifications": payload.horodatages_verifications,
        "nombre_signalements": payload.nombre_signalements or len(payload.reports),
        "horodatages_signalements": payload.horodatages_signalements,
        "categories": assigned_categories,
    }
    score, explications, _ = predict_model_a(model_a_input)

    return FullAnalysisOut(
        numero=payload.numero,
        score_risque=score,
        explications=explications,
        categories=assigned_categories,
        modele_utilise="kwismo_ai_gateway_v1",
    )


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
