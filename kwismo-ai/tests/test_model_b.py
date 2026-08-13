"""Tests du Modele B. / Model B tests."""

from src.models.model_b.predict import predict
from src.models.model_b.preprocess import normalize_text


def test_normalize_text_collapses_repeated_chars() -> None:
    assert normalize_text("gagnéééé") == "gagnéé"


def test_predict_uses_fallback_when_no_model_loaded() -> None:
    _, _, modele_utilise = predict("Felicitation, envoyez le code OTP")
    assert modele_utilise == "tfidf_fallback"
