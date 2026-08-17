"""Contrat d'API partagé avec kwismo-ai. / Shared API contract with kwismo-ai.

FR — Doit rester identique à kwismo-ai/src/api/schemas.py : aucun des deux services
ne doit deviner le format de l'autre. Typent les appels internes vers AI_SERVICE_URL.
"""

from pydantic import BaseModel, Field


class NumberFeaturesIn(BaseModel):
    """Caractéristiques envoyées à POST /predict/number (Modèle A)."""

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
    """Message envoyé à POST /predict/text (Modèle B)."""

    texte: str = Field(..., examples=["Felicitation ! Vous avez gagné 50000F, envoyez le code OTP pour recevoir."])
    langue: str | None = Field(None, examples=["fr"], description="Indice de langue, détection automatique sinon.")


class PredictTextOut(BaseModel):
    probabilite_arnaque: float = Field(..., ge=0, le=1)
    est_arnaque: bool
    categorie_detectee: str = Field("unknown_scam_pattern", examples=["fake_agent_otp"])
    entites_extraites: dict[str, list[str]] = Field(default_factory=dict, description="Montants, codes USSD et numéros cibles (NER).")
    modele_utilise: str = Field("model_b_v1", examples=["model_b_v1"])


class ReportItemIn(BaseModel):
    id_signalement: str
    description: str


class BatchReportIn(BaseModel):
    reports: list[ReportItemIn]
    cache_categories: dict[str, str] = Field(default_factory=dict)


class BatchReportOut(BaseModel):
    categories: dict[str, str]


class FeedbackIn(BaseModel):
    """Nouvelle donnée étiquetée transmise pour l'apprentissage continu."""

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
