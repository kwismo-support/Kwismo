"""Tests du module partners. / partners module tests."""

from fastapi.testclient import TestClient


def test_list_partners_requires_auth(client: TestClient) -> None:
    response = client.get("/partners")
    assert response.status_code == 401


def test_submit_partner_request(client: TestClient) -> None:
    response = client.post(
        "/partners/request",
        json={
            "nomContact": "Jean Dupont",
            "email": "jean.dupont@partner.example",
            "nomEntreprise": "Partner Enterprise SA",
            "typePartenariat": "mno",
            "telephone": "+237699112233",
            "message": "Demande de partenariat technique.",
        },
    )
    assert response.status_code == 201
    assert "reçue avec succès" in response.json()["message"]

