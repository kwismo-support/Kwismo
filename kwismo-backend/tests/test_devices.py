"""Tests du module devices (gestion des appareils connectés)."""

from fastapi.testclient import TestClient


def test_list_devices_requires_auth(client: TestClient) -> None:
    response = client.get("/devices")
    assert response.status_code == 401
