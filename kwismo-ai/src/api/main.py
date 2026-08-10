"""Point d'entree FastAPI du service d'inference. / FastAPI entry point for the inference service.

FR — Ce service ne se connecte jamais a une base de donnees : il recoit ses
donnees du backend et lui renvoie ses predictions. La logique d'inference
n'est pas encore branchee : chaque route repond 501 tant qu'elle n'est pas
implementee.
EN — This service never connects to a database: it only receives data from
the backend and returns predictions. Inference logic isn't wired yet: each
route returns 501 until implemented.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.middleware import SlowAPIMiddleware

from src.api.errors import limiter, register_error_handlers
from src.api.middleware import MaxBodySizeMiddleware
from src.api.schemas import (
    AiHealthOut,
    AiVersionOut,
    FeedbackAck,
    FeedbackIn,
    NumberFeaturesIn,
    PredictNumberOut,
    PredictTextOut,
    TextIn,
)
from src.config import get_settings

DESCRIPTION = """
**FR** — Service d'inférence KWISMO : Modèle A (scoring de réputation des
numéros, LightGBM) et Modèle B (détection d'arnaque dans un texte,
AfroXLMR + repli TF-IDF). Appelé uniquement par le backend. La plupart des
routes ci-dessous répondent **501** tant que le modèle correspondant n'est
pas encore entraîné/chargé — c'est un squelette d'API délibéré, pas un bug.

**EN** — KWISMO's inference service: Model A (number reputation scoring,
LightGBM) and Model B (scam-text detection, AfroXLMR + TF-IDF fallback).
Called only by the backend. Most routes below return **501** until the
matching model is trained/loaded — this is a deliberate API skeleton, not a
bug.
"""

TAGS_METADATA = [
    {"name": "Prediction", "description": "FR — Inférence Modèle A / Modèle B. / EN — Model A / Model B inference."},
    {"name": "Feedback", "description": "FR — Apprentissage continu. / EN — Continuous learning."},
    {"name": "System", "description": "FR — Santé & version du modèle chargé. / EN — Health & loaded model version."},
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

# --- Robustesse -----------------------------------------------------
# Une exception d'inference ou une charge excessive ne doit jamais rendre ce
# service (dont le backend depend a chaque verification) indisponible.
app.state.limiter = limiter
register_error_handlers(app)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(MaxBodySizeMiddleware)


def _not_implemented() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Modele pas encore entraine/charge / Model not trained/loaded yet.",
    )


@app.post(
    "/predict/number",
    response_model=PredictNumberOut,
    tags=["Prediction"],
    summary="Score a number / Scorer un numéro",
    description=(
        "**FR** — Reçoit les caractéristiques d'un numéro et renvoie un score de "
        "risque + statut (Modèle A). Repli sur les règles expertes si le modèle "
        "est indisponible.\n\n"
        "**EN** — Receives a number's features and returns a risk score + status "
        "(Model A). Falls back to expert rules if the model is unavailable."
    ),
)
async def predict_number(payload: NumberFeaturesIn) -> PredictNumberOut:
    raise _not_implemented()


@app.post(
    "/predict/text",
    response_model=PredictTextOut,
    tags=["Prediction"],
    summary="Analyze a message / Analyser un message",
    description=(
        "**FR** — Reçoit un message (SMS/WhatsApp) et renvoie la probabilité "
        "qu'il s'agisse d'une arnaque (Modèle B). Repli TF-IDF garanti.\n\n"
        "**EN** — Receives a message (SMS/WhatsApp) and returns the probability "
        "it is a scam (Model B). Guaranteed TF-IDF fallback."
    ),
)
async def predict_text(payload: TextIn) -> PredictTextOut:
    raise _not_implemented()


@app.post(
    "/feedback",
    response_model=FeedbackAck,
    tags=["Feedback"],
    summary="Send labeled feedback / Transmettre une donnée étiquetée",
    description=(
        "**FR** — Reçoit une nouvelle donnée étiquetée (signalement, validation "
        "admin...) pour l'apprentissage continu, incrémental et planifié.\n\n"
        "**EN** — Receives a new labeled data point (report, admin validation...) "
        "for incremental, scheduled continuous learning."
    ),
)
async def feedback(payload: FeedbackIn) -> FeedbackAck:
    raise _not_implemented()


@app.get(
    "/health",
    response_model=AiHealthOut,
    tags=["System"],
    summary="Health check / Vérification de santé",
    description="**FR** — État du service et des modèles chargés.\n\n**EN** — Service and loaded-models status.",
)
async def health() -> AiHealthOut:
    return AiHealthOut(status="ok", model_a_loaded=False, model_b_loaded=False)


@app.get(
    "/version",
    response_model=AiVersionOut,
    tags=["System"],
    summary="Loaded model versions / Versions des modèles chargés",
    description="**FR** — Versions actuellement chargées (registre).\n\n**EN** — Currently loaded versions (registry).",
)
async def version() -> AiVersionOut:
    return AiVersionOut(
        model_a_version=settings.model_a_version,
        model_b_version=settings.model_b_version,
    )
