"""Tests du module kpi (indicateurs de performance globaux et partenaires)."""

from fastapi.testclient import TestClient


def test_get_global_kpi_requires_auth(client: TestClient) -> None:
    response = client.get("/kpi/global")
    assert response.status_code == 401


def test_get_partner_kpi_requires_auth(client: TestClient) -> None:
    response = client.get("/kpi/partner")
    assert response.status_code == 401
