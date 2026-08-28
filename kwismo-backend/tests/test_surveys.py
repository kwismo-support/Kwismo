"""Tests du module surveys (sondages et réponses utilisateurs)."""

from fastapi.testclient import TestClient


def test_get_active_surveys_requires_auth(client: TestClient) -> None:
    response = client.get("/surveys/active")
    assert response.status_code == 401


def test_answer_survey_requires_auth(client: TestClient) -> None:
    response = client.post("/surveys/survey-123/answer", json={"option_id": "opt-1"})
    assert response.status_code == 401
