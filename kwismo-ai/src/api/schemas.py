"""Contrat d'API partage avec kwismo-backend (module ai_gateway). / Shared API contract with kwismo-backend (ai_gateway module).

FR — Ces schemas DOIVENT rester identiques a
kwismo-backend/app/modules/ai_gateway/schemas.py (cahier IA §9.3 / cahier
Backend §9.3) : aucun des deux services ne doit "deviner" le format de
l'autre.
EN — These schemas MUST stay identical to
kwismo-backend/app/modules/ai_gateway/schemas.py (AI spec §9.3 / Backend
spec §9.3): neither service should ever "guess" the other's format.
"""

from pydantic import BaseModel, Field


class NumberFeaturesIn(BaseModel):
    """Caracteristiques recues par POST /predict/number (Modele A, §4.1)."""

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
    """Message reçu par POST /predict/text (Modèle B, §6)."""

    texte: str = Field(..., examples=["Felicitation ! Vous avez gagné 500000F, envoyez le code OTP pour recevoir."])
    langue: str | None = Field(None, examples=["fr"], description="Indice de langue, détection automatique sinon.")


class PredictTextOut(BaseModel):
    probabilite_arnaque: float = Field(..., ge=0, le=1)
    est_arnaque: bool
    modele_utilise: str = Field(..., examples=["afroxlmr_v2"], description="Ou 'tfidf_fallback' en repli.")


class FeedbackIn(BaseModel):
    """Nouvelle donnée étiquetée reçue pour l'apprentissage continu (§9.2)."""

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
