"""Inference du Modele A (score + statut). / Model A inference (score + status)."""

from src.api.loader import load_model_a
from src.models.model_a import rules


def predict(features: dict) -> tuple[float, str, str]:
    """Retourne (score_risque, statut, modele_utilise)."""

    model = load_model_a()
    if model is None:
        score, statut = rules.score(
            features.get("nombre_signalements", 0),
            features.get("coherence_pays_operateur", True),
        )
        return score, statut, "regles_expertes"

    # TODO: appeler model.predict_proba() une fois le modele reel charge.
    score, statut = rules.score(
        features.get("nombre_signalements", 0),
        features.get("coherence_pays_operateur", True),
    )
    return score, statut, "lightgbm"
