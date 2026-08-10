"""Tests du module auth. / auth module tests.

FR — Exemples illustrant le format attendu ; a completer au fur et a mesure
que la logique metier est implementee (actuellement 501 partout).
EN — Examples illustrating the expected format; to be completed as business
logic gets implemented (currently 501 everywhere).
"""

from fastapi.testclient import TestClient


def test_register_not_implemented_yet(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"nom": "Test", "prenom": "User", "email": "test@example.com", "mot_de_passe": "Password123!"},
    )
    assert response.status_code == 501


def test_register_rejects_invalid_email(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"nom": "Test", "prenom": "User", "email": "pas-un-email", "mot_de_passe": "Password123!"},
    )
    assert response.status_code == 422
