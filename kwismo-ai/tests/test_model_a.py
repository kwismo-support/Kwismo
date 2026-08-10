"""Tests du Modele A. / Model A tests."""

from src.models.model_a import rules


def test_rules_flags_heavily_reported_number() -> None:
    score, statut = rules.score(nombre_signalements=5, coherence_pays_operateur=True)
    assert statut == "a_signaler"
    assert score > 0.5


def test_rules_keeps_low_signal_number_secure() -> None:
    score, statut = rules.score(nombre_signalements=0, coherence_pays_operateur=True)
    assert statut == "securise"
