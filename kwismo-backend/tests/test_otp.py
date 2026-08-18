"""Tests du module otp (génération, envoi et vérification d'OTP)."""

import pytest
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
async def test_send_email_otp_dev_mode() -> None:
    # Doit s'exécuter sans lever d'exception
    await send_email_otp("test@example.com", "654321")
