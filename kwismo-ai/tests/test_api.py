"""Tests de l'API d'inference. / Inference API tests."""

from fastapi.testclient import TestClient

from src.api.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_number_not_implemented_yet() -> None:
    response = client.post("/predict/number", json={"numero": "+237690000000"})
    assert response.status_code == 501
