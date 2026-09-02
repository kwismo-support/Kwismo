"""Tests du module whatsapp_alerts (signalements et alertes de diffusion)."""

from fastapi.testclient import TestClient


def test_create_whatsapp_incident_requires_auth(client: TestClient) -> None:
    response = client.post("/whatsapp-alerts/incident", json={"numero": "+237690000000", "description": "Numéro compromis"})
    assert response.status_code == 401


def test_create_whatsapp_broadcast_requires_auth(client: TestClient) -> None:
    response = client.post("/whatsapp-alerts/broadcast", json={"contenu": "Alerte fraude générale"})
    assert response.status_code == 401
