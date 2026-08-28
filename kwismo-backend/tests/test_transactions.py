"""Tests du module transactions (historique et vérification)."""

from fastapi.testclient import TestClient


def test_prepare_transaction_requires_auth(client: TestClient) -> None:
    response = client.post("/transactions/prepare", json={"numero_destinataire": "+237690000000", "montant": 5000})
    assert response.status_code == 401


def test_list_transactions_requires_auth(client: TestClient) -> None:
    response = client.get("/transactions")
    assert response.status_code == 401
