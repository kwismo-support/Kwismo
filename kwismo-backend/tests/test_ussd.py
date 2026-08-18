"""Tests du module ussd. / ussd module tests."""

from fastapi.testclient import TestClient


def test_list_countries_is_public(client: TestClient) -> None:
    response = client.get("/countries")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
