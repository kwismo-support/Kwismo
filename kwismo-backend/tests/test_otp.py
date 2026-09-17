"""Tests du module otp (génération, envoi et vérification d'OTP avec chaîne de secours Firebase -> Twilio -> Email -> Dev)."""

import pytest

from app.core.config import get_settings
from app.utils.otp import check_sms_otp, generate_otp, send_email_otp, send_sms_otp


def test_generate_otp_length() -> None:
    code = generate_otp()
    assert len(code) == 6
    assert code.isdigit()


@pytest.mark.asyncio
async def test_send_sms_otp_dev_mode() -> None:
    success = await send_sms_otp("+237690000000", code="123456")
    assert success is True


@pytest.mark.asyncio
async def test_check_sms_otp_dev_mode() -> None:
    valid = await check_sms_otp("+237690000000", "123456")
    assert valid is True


@pytest.mark.asyncio
async def test_send_sms_otp_with_email_fallback() -> None:
    success = await send_sms_otp("+237690000000", code="654321", email="test@example.com")
    assert success is True


@pytest.mark.asyncio
async def test_firebase_otp_fallback(monkeypatch) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "firebase_project_id", "kwismo-test-app")
    success = await send_sms_otp("+237690000000", code="112233")
    assert success is True
    valid = await check_sms_otp("+237690000000", "112233")
    assert valid is True


@pytest.mark.asyncio
async def test_send_email_otp_dev_mode() -> None:
    # Doit s'exécuter sans lever d'exception
    await send_email_otp("test@example.com", "654321")
