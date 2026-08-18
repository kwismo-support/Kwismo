"""Tests du module user_phones (gestion des numéros de téléphone rattachés)."""

from fastapi.testclient import TestClient


def test_list_my_phones_requires_auth(client: TestClient) -> None:
    response = client.get("/users/me/phones")
    assert response.status_code == 401


def test_add_phone_requires_auth(client: TestClient) -> None:
    response = client.post("/users/me/phones", json={"valeur": "+237690000000"})
    assert response.status_code == 401
