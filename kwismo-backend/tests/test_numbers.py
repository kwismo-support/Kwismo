from fastapi.testclient import TestClient
from app.core.security import CurrentUser, get_current_user
from app.main import app


def test_verify_number_requires_auth(client: TestClient) -> None:
    app.dependency_overrides.clear()
    response = client.post("/numbers/verify", json={"valeur": "+237690000000"})
    assert response.status_code == 401


def test_verify_number_and_onboarding_authenticated(client: TestClient) -> None:
    mock_user = CurrentUser(
        id="seed-user-id",
        role="user",
        langue="fr",
    )
    app.dependency_overrides[get_current_user] = lambda: mock_user
    try:
        # 1. Verify number reputation endpoint
        response = client.post("/numbers/verify", json={"valeur": "+237690000000"})
        assert response.status_code == 200
        data = response.json()
        assert "score_risque" in data
        assert "statut" in data
        assert data["valeur"] == "+237690000000"

        # 2. Add phone (number onboarding) endpoint
        phone_res = client.post("/users/me/phones", json={"valeur": "+237670112233"})
        assert phone_res.status_code in (201, 409)
    finally:
        app.dependency_overrides.clear()
