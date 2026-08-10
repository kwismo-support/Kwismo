"""Tests du module ai_gateway. / ai_gateway module tests.

FR — Verifie que le contrat partage reste utilisable ; le vrai test de
coherence avec kwismo-ai est manuel (comparer les deux schemas.py).
EN — Checks that the shared contract stays usable; the real consistency
check against kwismo-ai is manual (compare both schemas.py files).
"""

from app.modules.ai_gateway.schemas import NumberFeaturesIn, PredictNumberOut


def test_number_features_defaults() -> None:
    features = NumberFeaturesIn(numero="+237690000000")
    assert features.nombre_signalements == 0


def test_predict_number_out_requires_score_and_statut() -> None:
    out = PredictNumberOut(score_risque=0.5, statut="a_signaler", modele_utilise="test")
    assert 0 <= out.score_risque <= 1
