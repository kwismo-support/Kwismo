"""Tests du module ai_gateway (kwismo-backend).

Vérifie :
1. La validation Pydantic des contrats partagés entre le backend et l'IA (kwismo-ai).
2. L'appel HTTP simulé (Predict, Full Analysis, Feedback).
3. La synchronisation automatique des catégories découvertes par l'IA en BD (sync_discovered_categories).
4. La liste et la modération administrative des catégories d'arnaques (ScamCategory).
"""

from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.modules.ai_gateway.client import (
    predict_full_analysis,
    predict_number,
    send_feedback,
)
from app.modules.ai_gateway.schemas import (
    BatchReportIn,
    BatchReportOut,
    FeedbackIn,
    FullAnalysisIn,
    FullAnalysisOut,
    NumberFeaturesIn,
    PredictNumberOut,
    ReportItemIn,
)
from app.modules.ai_gateway.service import (
    list_scam_categories,
    sync_discovered_categories,
    update_scam_category,
)


def test_number_features_defaults() -> None:
    features = NumberFeaturesIn(numero="+237690000000")
    assert features.nombre_signalements == 0
    assert features.nombre_verifications == 0
    assert features.horodatages_verifications == []
    assert features.horodatages_signalements == []


def test_predict_number_out_requires_score_and_model() -> None:
    out = PredictNumberOut(score_risque=0.5, modele_utilise="lightgbm_v1", explications=["Alerte moyenne"])
    assert 0 <= out.score_risque <= 1
    assert out.modele_utilise == "lightgbm_v1"


def test_full_analysis_in_out_schemas() -> None:
    payload_in = FullAnalysisIn(
        numero="237699112233",
        nombre_verifications=5,
        horodatages_verifications=["2026-08-18T08:00:00Z"],
        reports=[ReportItemIn(id_signalement="r1", description="Faux transfert MoMo avec code OTP")],
    )
    assert payload_in.numero == "237699112233"
    assert len(payload_in.reports) == 1

    payload_out = FullAnalysisOut(
        numero="237699112233",
        score_risque=0.85,
        explications=["Plafond de sécurité respecté", "Vol d'OTP détecté"],
        categories={"r1": "fake_agent_otp"},
        modele_utilise="full_pipeline_v1",
    )
    assert payload_out.score_risque == 0.85
    assert payload_out.categories["r1"] == "fake_agent_otp"


@pytest.mark.asyncio
async def test_predict_number_http_client_call() -> None:
    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json = MagicMock(
        return_value={
            "score_risque": 0.45,
            "modele_utilise": "lightgbm_v1",
            "explications": ["Aucun risque détecté"],
        }
    )

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
        res = await predict_number(NumberFeaturesIn(numero="237690000000"))
        assert res.score_risque == 0.45
        assert res.modele_utilise == "lightgbm_v1"


@pytest.mark.asyncio
async def test_predict_full_analysis_http_client_call_and_auto_sync() -> None:
    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json = MagicMock(
        return_value={
            "numero": "237699887766",
            "score_risque": 0.92,
            "explications": ["Arnaque SIM Swap détectée par l'IA"],
            "categories": {"r10": "sim_swap_scam"},
            "modele_utilise": "full_pipeline_v1",
        }
    )

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response), patch(
        "app.modules.ai_gateway.client.sync_discovered_categories", new_callable=AsyncMock
    ) as mock_sync:
        res = await predict_full_analysis(
            FullAnalysisIn(
                numero="237699887766",
                reports=[ReportItemIn(id_signalement="r10", description="Swapping de SIM MTN")],
            )
        )
        assert res.score_risque == 0.92
        mock_sync.assert_called_once_with({"r10": "sim_swap_scam"})


@pytest.mark.asyncio
async def test_sync_discovered_categories_db_operations() -> None:
    mock_scam_category = MagicMock()
    mock_scam_category.id = "cat_123"

    mock_db = MagicMock()
    mock_db.scamcategory.find_unique = AsyncMock(return_value=None)
    mock_db.scamcategory.create = AsyncMock(return_value=mock_scam_category)
    mock_db.reportcategory.upsert = AsyncMock()

    with patch("app.modules.ai_gateway.service.db", mock_db):
        await sync_discovered_categories({"rep_1": "fake_crypto_investment"})
        mock_db.scamcategory.create.assert_called_once()
        create_kwargs = mock_db.scamcategory.create.call_args[1]["data"]
        assert create_kwargs["nomCode"] == "fake_crypto_investment"


@pytest.mark.asyncio
async def test_list_and_update_scam_categories() -> None:
    mock_cat = MagicMock()
    mock_cat.id = "cat_001"
    mock_cat.nomCode = "sim_swap_scam"
    mock_cat.libelle = "SIM Swap Scam"
    mock_cat.description = "Usurpation de carte SIM"
    mock_cat.reportCategories = [MagicMock(), MagicMock()]
    mock_cat.createdAt.isoformat = MagicMock(return_value="2026-08-18T10:00:00Z")

    mock_db = MagicMock()
    mock_db.scamcategory.find_many = AsyncMock(return_value=[mock_cat])
    mock_db.scamcategory.update = AsyncMock(return_value=mock_cat)

    with patch("app.modules.ai_gateway.service.db", mock_db):
        categories = await list_scam_categories()
        assert len(categories) == 1
        assert categories[0]["nombreSignalements"] == 2

        updated = await update_scam_category("cat_001", libelle="Nouveau Libellé")
        assert updated["nomCode"] == "sim_swap_scam"
