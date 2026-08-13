"""Tests du module partners. / partners module tests."""

from fastapi.testclient import TestClient


def test_list_partners_requires_auth(client: TestClient) -> None:
    response = client.get("/partners")
    assert response.status_code == 401
