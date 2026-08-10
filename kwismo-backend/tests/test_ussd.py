"""Tests du module ussd. / ussd module tests."""

from fastapi.testclient import TestClient


def test_list_countries_is_public(client: TestClient) -> None:
    response = client.get("/countries")
    # Route publique : pas de 401 ; 501 tant que non implementee.
    assert response.status_code == 501
