"""Tests de l'API d'inférence (FastAPI)."""

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_number() -> None:
    response = client.post("/predict/number", json={"numero": "+237690000000", "nombre_signalements": 4})
    assert response.status_code == 200
    data = response.json()
    assert "score_risque" in data
    assert 0.0 <= data["score_risque"] <= 1.0
    assert "explications" in data
    assert "modele_utilise" in data


def test_predict_text() -> None:
    response = client.post("/predict/text", json={"texte": "Vous avez gagné 50000 FCFA, tapez le code OTP"})
    assert response.status_code == 200
    data = response.json()
    assert data["est_arnaque"] is True
    assert data["categorie_detectee"] in ("lotto_winner_scam", "fake_agent_otp")


def test_predict_batch_reports() -> None:
    payload = {
        "reports": [
            {"id_signalement": "sig_1", "description": "Faux SMS de transfert reçu"},
            {"id_signalement": "sig_2", "description": "Appel d'un prétendu agent"}
        ],
        "cache_categories": {"sig_0": "existing_cat"}
    }
    response = client.post("/predict/batch_reports", json=payload)
    assert response.status_code == 200
    cats = response.json()["categories"]
    assert "sig_1" in cats
    assert "sig_2" in cats
    assert cats["sig_0"] == "existing_cat"


def test_predict_full_analysis() -> None:
    payload = {
        "numero": "237690000099",
        "nombre_verifications": 12,
        "horodatages_verifications": ["2026-08-18T00:00:00Z"],
        "nombre_signalements": 1,
        "reports": [{"id_signalement": "sig_100", "description": "Le malabar me joss que mon compte va être bloqué"}],
        "cache_categories": {}
    }
    response = client.post("/predict/full_analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["numero"] == "237690000099"
    # Single report safety cap rule check: score MUST NOT exceed 0.69!
    assert data["score_risque"] <= 0.69
    assert "sig_100" in data["categories"]
