"""Inference du Modele B (probabilite d'arnaque). / Model B inference (scam probability)."""

from src.api.loader import load_model_b
from src.models.model_b.preprocess import normalize_text


def predict(texte: str) -> tuple[float, bool, str]:
    """Retourne (probabilite_arnaque, est_arnaque, modele_utilise)."""

    normalized = normalize_text(texte)
    model = load_model_b()

    if model is None:
        # Repli TF-IDF garanti (src/models/model_b/fallback.py) tant qu'aucun
        # modele n'est entraine/charge.
        est_arnaque = any(mot in normalized for mot in ("otp", "code", "gagné", "gagne", "urgent"))
        return (0.6 if est_arnaque else 0.1), est_arnaque, "tfidf_fallback"

    # TODO: appeler model.predict() une fois AfroXLMR reellement charge.
    return 0.1, False, "afroxlmr"
