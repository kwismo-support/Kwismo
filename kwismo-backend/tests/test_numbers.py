"""Tests du module numbers — verifie le branchement avec kwismo-ai.

Couvre :
1. L'authentification requise (401).
2. Le chemin heureux avec l'IA qui répond (mock du predict_full_analysis).
3. Le repli sur les règles expertes si kwismo-ai est indisponible.
"""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient


def test_verify_number_requires_auth(client: TestClient) -> None:
    response = client.post("/numbers/verify", json={"valeur": "+237690000000"})
    assert response.status_code == 401


def test_verify_number_invalid_format_requires_auth(client: TestClient) -> None:
    """Un numéro invalide renvoie aussi 401 (l'auth est validée en premier)."""
    response = client.post("/numbers/verify", json={"valeur": "not-a-phone"})
    assert response.status_code == 401


def test_batch_verify_requires_auth(client: TestClient) -> None:
    response = client.post("/numbers/batch-verify", json={"numeros": ["+237690000000"]})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_score_and_upsert_uses_ai_gateway() -> None:
    """_score_and_upsert appelle predict_full_analysis quand l'IA est disponible."""
    from app.modules.ai_gateway.schemas import FullAnalysisOut

    mock_ai_result = FullAnalysisOut(
        numero="237690000000",
        score_risque=0.85,
        explications=["Test IA"],
        categories={},
        modele_utilise="full_pipeline_v1",
    )

    mock_db = AsyncMock()
    mock_db.country.find_many = AsyncMock(return_value=[])
    mock_db.country.find_first = AsyncMock(return_value=None)
    mock_db.numero.find_unique = AsyncMock(return_value=None)
    mock_db.report.count = AsyncMock(return_value=0)
    mock_db.report.find_many = AsyncMock(return_value=[])

    created_numero = AsyncMock()
    created_numero.id = "num_test_001"
    created_numero.valeur = "237690000000"
    created_numero.scoreRisque = 0.85
    created_numero.statut = "a_signaler"
    created_numero.dateDerniereVerification = None
    created_numero.countryId = None
    created_numero.operatorId = None
    created_numero.operator = None
    mock_db.numero.create = AsyncMock(return_value=created_numero)

    with (
        patch("app.modules.numbers.service.db", mock_db),
        patch("app.modules.numbers.service.predict_full_analysis", new_callable=AsyncMock, return_value=mock_ai_result),
        patch("app.modules.numbers.service._statut_from_score", new_callable=AsyncMock, return_value="a_signaler"),
        patch("app.modules.numbers.service.get_cached", new_callable=AsyncMock, return_value=[]),
    ):
        from app.modules.numbers.service import _score_and_upsert
        result = await _score_and_upsert("237690000000")
        assert result.score_risque == 0.85


@pytest.mark.asyncio
async def test_score_and_upsert_fallback_when_ai_unavailable() -> None:
    """Si kwismo-ai est indisponible, repli silencieux sur les règles expertes."""
    import httpx
    from app.modules.ai_gateway.schemas import PredictNumberOut

    mock_fallback_result = PredictNumberOut(
        score_risque=0.1,
        modele_utilise="regles_expertes",
        explications=["Repli règles"],
    )

    mock_db = AsyncMock()
    mock_db.country.find_many = AsyncMock(return_value=[])
    mock_db.country.find_first = AsyncMock(return_value=None)
    mock_db.numero.find_unique = AsyncMock(return_value=None)
    mock_db.report.count = AsyncMock(return_value=0)
    mock_db.report.find_many = AsyncMock(return_value=[])

    created_numero = AsyncMock()
    created_numero.id = "num_test_002"
    created_numero.valeur = "237690000001"
    created_numero.scoreRisque = 0.1
    created_numero.statut = "securise"
    created_numero.dateDerniereVerification = None
    created_numero.countryId = None
    created_numero.operatorId = None
    created_numero.operator = None
    mock_db.numero.create = AsyncMock(return_value=created_numero)

    with (
        patch("app.modules.numbers.service.db", mock_db),
        patch(
            "app.modules.numbers.service.predict_full_analysis",
            new_callable=AsyncMock,
            side_effect=httpx.ConnectError("kwismo-ai down"),
        ),
        patch("app.modules.numbers.service.score_number_fallback", return_value=mock_fallback_result),
        patch("app.modules.numbers.service._statut_from_score", new_callable=AsyncMock, return_value="securise"),
        patch("app.modules.numbers.service.get_cached", new_callable=AsyncMock, return_value=[]),
    ):
        from app.modules.numbers.service import _score_and_upsert
        result = await _score_and_upsert("237690000001")
        assert result.score_risque == 0.1
