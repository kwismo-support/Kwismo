"""Tests du module auth. / auth module tests."""

from fastapi.testclient import TestClient


def test_register_rejects_invalid_email(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"nom": "Test", "prenom": "User", "email": "pas-un-email", "mot_de_passe": "Password123!"},
    )
    assert response.status_code == 422


def test_health_check(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in ("ok", "degraded")
