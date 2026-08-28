"""Tests du module access_control (gestion des rôles et droits d'accès)."""

from fastapi.testclient import TestClient


def test_list_roles_requires_auth(client: TestClient) -> None:
    response = client.get("/roles")
    assert response.status_code == 401


def test_list_access_rights_requires_auth(client: TestClient) -> None:
    response = client.get("/access-rights")
    assert response.status_code == 401
