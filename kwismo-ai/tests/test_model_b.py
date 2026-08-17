"""Tests du Modèle B (NLP & Auto-Catégorisation)."""

from src.models.model_b.predict import predict
from src.models.model_b.preprocess import normalize_text, categorize_description


def test_normalize_text_collapses_repeated_chars() -> None:
    assert normalize_text("gagnéééé") == "gagné"


def test_categorize_description() -> None:
    cat = categorize_description("vous avez reçu un faux sms de transfert")
    assert cat == "fake_transfer_sms"


def test_predict_uses_fallback_when_no_model_loaded() -> None:
    _, _, modele_utilise = predict("Felicitation, envoyez le code OTP")
    assert modele_utilise is not None
