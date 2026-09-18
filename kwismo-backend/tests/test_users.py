"""Tests du module users (gestion du profil utilisateur)."""

from fastapi.testclient import TestClient


def test_get_me_requires_auth(client: TestClient) -> None:
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_list_users_requires_auth(client: TestClient) -> None:
    response = client.get("/api/v1/users")
    assert response.status_code == 401

