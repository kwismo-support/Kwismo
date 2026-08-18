"""Tests du Modèle A (scoring temporel & règles de sécurité)."""

from src.data.features import compute_temporal_features
from src.models.model_a import rules, predict


def test_rules_single_report_safety_cap() -> None:
    """Vérifie qu'un numéro avec 1 seul signalement ne peut JAMAIS dépasser un score de 0.69."""
    features = {
        "nombre_signalements": 1,
        "nombre_verifications": 100,  # 100 vérifications !
        "vitesse_verifications": 10.0,
        "gravite_categories": 1.0,
        "diversite_signaleurs": 1,
    }
    score, explications = rules.calculate_expert_score(features)
    assert score <= 0.69
    assert any("Plafonnement de sécurité" in exp for exp in explications)


def test_compute_temporal_features() -> None:
    """Vérifie le calcul des métriques temporelles et de gravité."""
    data = {
        "nombre_signalements": 3,
        "nombre_verifications": 10,
        "anciennete_jours": 5,
        "categories": {"r1": "fake_agent_otp", "r2": "legitimate_chat"},
    }
    feats = compute_temporal_features(data)
    assert feats["nombre_signalements"] == 3
    assert feats["nombre_verifications"] == 10
    assert feats["gravite_categories"] == 1.0
    assert feats["ratio_verif_signalement"] == 3.3333333333333335


def test_predict_model_a_returns_score_and_explications() -> None:
    """Vérifie que predict() renvoie un score entre 0.0 et 1.0 et des explications."""
    data = {
        "nombre_signalements": 4,
        "nombre_verifications": 15,
        "horodatages_verifications": ["2026-08-18T00:00:00Z"],
        "horodatages_signalements": ["2026-08-18T01:00:00Z"],
        "categories": {"r1": "fake_agent_otp"},
    }
    score, explications, modele_used = predict.predict(data)
    assert 0.0 <= score <= 1.0
    assert isinstance(explications, list)
    assert len(explications) > 0
    assert isinstance(modele_used, str)
