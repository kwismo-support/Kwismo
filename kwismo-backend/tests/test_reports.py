"""Tests du module reports — verifie signalements et feedback IA.

Couvre :
1. Authentification requise (401).
2. La transmission du feedback IA lors de la validation admin.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


def test_create_report_requires_auth(client: TestClient) -> None:
    response = client.post("/reports", json={"numero": "+237690000000", "motif": "Tentative de phishing"})
    assert response.status_code == 401


def test_list_reports_requires_auth(client: TestClient) -> None:
    response = client.get("/reports")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_validate_report_sends_ai_feedback() -> None:
    """validate_report envoie un FeedbackIn a kwismo-ai apres validation admin."""
    from app.modules.reports.schemas import ReportValidateIn

    mock_report = MagicMock()
    mock_report.id = "report_001"
    mock_report.userId = "user_001"
    mock_report.numeroId = "num_001"
    mock_report.motif = "Arnaque MoMo"
    mock_report.statut = "pending"

    mock_numero = MagicMock()
    mock_numero.id = "num_001"
    mock_numero.valeur = "+237690000000"

    updated_report = MagicMock()
    updated_report.id = "report_001"
    updated_report.userId = "user_001"
    updated_report.numeroId = "num_001"
    updated_report.motif = "Arnaque MoMo"
    updated_report.statut = "validated"
    updated_report.dateSignalement = MagicMock()

    mock_db = MagicMock()
    mock_db.report.find_unique = AsyncMock(return_value=mock_report)
    mock_db.report.update = AsyncMock(return_value=updated_report)
    mock_db.numero.find_unique = AsyncMock(return_value=mock_numero)
    mock_db.numero.update = AsyncMock(return_value=mock_numero)

    mock_send_feedback = AsyncMock()

    with (
        patch("app.modules.reports.service.db", mock_db),
        patch("app.core.audit_log.log_audit", new_callable=AsyncMock),
        patch("app.modules.notifications.service.create_notification", new_callable=AsyncMock),
        patch("app.utils.feedback.enqueue_feedback", new_callable=AsyncMock),
        patch("app.modules.reports.service.send_feedback", mock_send_feedback, create=True),
    ):
        from app.modules.reports.service import validate_report
        result = await validate_report(
            "report_001",
            ReportValidateIn(statut="validated"),
            admin_user_id="admin_001",
        )
        assert result.statut == "validated"
