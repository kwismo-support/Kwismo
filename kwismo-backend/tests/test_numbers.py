"""Tests du module numbers. / numbers module tests."""

from fastapi.testclient import TestClient


def test_verify_number_requires_auth(client: TestClient) -> None:
    response = client.post("/numbers/verify", json={"valeur": "+237690000000"})
    assert response.status_code == 401
