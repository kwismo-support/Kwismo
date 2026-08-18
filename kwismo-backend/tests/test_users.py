"""Tests du module users (gestion du profil utilisateur)."""

from fastapi.testclient import TestClient


def test_get_me_requires_auth(client: TestClient) -> None:
    response = client.get("/users/me")
    assert response.status_code == 401
