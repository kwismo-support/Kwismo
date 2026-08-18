"""Tests du module reports (signalements de numéros frauduleux)."""

from fastapi.testclient import TestClient


def test_create_report_requires_auth(client: TestClient) -> None:
    response = client.post("/reports", json={"numero": "+237690000000", "motif": "Tentative de phishing"})
    assert response.status_code == 401


def test_list_reports_requires_auth(client: TestClient) -> None:
    response = client.get("/reports")
    assert response.status_code == 401
