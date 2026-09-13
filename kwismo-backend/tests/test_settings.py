"""Tests du module settings (Seuils de risque SuperAdmin)."""

from fastapi.testclient import TestClient
from app.modules.settings.schemas import RiskThresholdRule
from app.modules.settings.service import validate_coverage, evaluate_risk_status_with_rules
import pytest
from fastapi import HTTPException


def test_get_thresholds_requires_auth(client: TestClient) -> None:
    response = client.get("/settings/thresholds")
    assert response.status_code == 401


def test_validate_coverage_valid() -> None:
    rules = [
        RiskThresholdRule(zone="securise", min_value=0.0, min_operator=">=", max_value=0.3, max_operator="<", label_fr="Sûre", label_en="Safe"),
        RiskThresholdRule(zone="suspect", min_value=0.3, min_operator=">=", max_value=0.7, max_operator="<", label_fr="A risque", label_en="Warning"),
        RiskThresholdRule(zone="frauduleux", min_value=0.7, min_operator=">=", max_value=1.0, max_operator="<=", label_fr="Arnaque", label_en="Scam"),
    ]
    # Doit passer sans lever d'exception
    validate_coverage(rules)


def test_validate_coverage_gap_raises_error() -> None:
    # Plage de 0.3 à 0.5 manquante
    rules = [
        RiskThresholdRule(zone="securise", min_value=0.0, min_operator=">=", max_value=0.3, max_operator="<", label_fr="Sûre", label_en="Safe"),
        RiskThresholdRule(zone="frauduleux", min_value=0.5, min_operator=">=", max_value=1.0, max_operator="<=", label_fr="Arnaque", label_en="Scam"),
    ]
    with pytest.raises(HTTPException) as exc_info:
        validate_coverage(rules)
    assert exc_info.value.status_code == 400
    assert "Zone creuse détectée" in exc_info.value.detail


def test_evaluate_risk_status_with_custom_rules() -> None:
    rules = [
        RiskThresholdRule(zone="securise", min_value=0.0, min_operator=">=", max_value=0.4, max_operator="<", label_fr="Sûre", label_en="Safe"),
        RiskThresholdRule(zone="suspect", min_value=0.4, min_operator=">=", max_value=0.8, max_operator="<", label_fr="A risque", label_en="Warning"),
        RiskThresholdRule(zone="frauduleux", min_value=0.8, min_operator=">=", max_value=1.0, max_operator="<=", label_fr="Arnaque", label_en="Scam"),
    ]
    assert evaluate_risk_status_with_rules(0.2, rules) == "securise"
    assert evaluate_risk_status_with_rules(0.5, rules) == "suspect"
    assert evaluate_risk_status_with_rules(0.85, rules) == "frauduleux"
