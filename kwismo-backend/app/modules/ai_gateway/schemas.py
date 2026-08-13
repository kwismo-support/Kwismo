"""Contrat d'API partage avec kwismo-ai. / Shared API contract with kwismo-ai.

FR — Doit rester identique a kwismo-ai/src/api/schemas.py : ni le backend
ni le service IA ne doivent deviner le format de l'autre. Typent les appels
internes vers AI_SERVICE_URL (pas exposes tels quels au client final).
EN — Must stay identical to kwismo-ai/src/api/schemas.py: neither the
backend nor the AI service should ever guess the other's format. Types the
internal calls to AI_SERVICE_URL (not exposed as-is to the end client).
"""

from pydantic import BaseModel, Field


class NumberFeaturesIn(BaseModel):
    """Caracteristiques envoyees a POST /predict/number (Modele A). / Features sent to POST /predict/number (Model A)."""

    numero: str
    nombre_signalements: int = Field(0, ge=0)
    vitesse_signalements: float = Field(0, ge=0, description="Signalements récents / jour.")
    anciennete_jours: int = Field(0, ge=0)
    operateur: str | None = None
    prefixe: str | None = None
    pays: str | None = None
    diversite_signaleurs: int = Field(0, ge=0, description="Nombre d'utilisateurs distincts ayant signalé.")
    nombre_verifications: int = Field(0, ge=0)
    statut_communautaire: str | None = Field(None, description="Dernier verdict admin validé, le cas échéant.")


class PredictNumberOut(BaseModel):
    score_risque: float = Field(..., ge=0, le=1)
    statut: str = Field(..., examples=["a_signaler"], description="securise | a_signaler | frauduleux")
    modele_utilise: str = Field(..., examples=["lightgbm_v3"], description="Nom+version du modèle, ou 'regles_expertes' en repli.")
    explications: list[str] = Field(default_factory=list, description="Facteurs principaux (explicabilité).")


class TextIn(BaseModel):
    """Message envoyé à POST /predict/text (Modèle B). / Message sent to POST /predict/text (Model B)."""

    texte: str = Field(..., examples=["Felicitation ! Vous avez gagné 500000F, envoyez le code OTP pour recevoir."])
    langue: str | None = Field(None, examples=["fr"], description="Indice de langue, détection automatique sinon.")


class PredictTextOut(BaseModel):
    probabilite_arnaque: float = Field(..., ge=0, le=1)
    est_arnaque: bool
    modele_utilise: str = Field(..., examples=["afroxlmr_v2"], description="Ou 'tfidf_fallback' en repli.")


class FeedbackIn(BaseModel):
    """Nouvelle donnée étiquetée transmise pour l'apprentissage continu. / New labeled data sent for continuous learning."""

    type: str = Field(..., examples=["number"], description="'number' ou 'text'.")
    numero: str | None = None
    texte: str | None = None
    label: str = Field(..., examples=["frauduleux"], description="Verdict connu (vérité terrain).")
    source: str = Field(..., examples=["report"], description="Provenance: report, admin_validation, survey...")


class FeedbackAck(BaseModel):
    recu: bool = True


class AiHealthOut(BaseModel):
    status: str = Field(..., examples=["ok"])
    model_a_loaded: bool
    model_b_loaded: bool


class AiVersionOut(BaseModel):
    model_a_version: str = Field(..., examples=["v3"])
    model_b_version: str = Field(..., examples=["v2"])
