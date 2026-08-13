"""SMS OTP via Twilio Verify API. / SMS OTP via Twilio Verify API.

FR — Utilise Twilio Verify (Option A) : Twilio gere la generation du code,
     l'expiration, le rate-limiting et la validation. Le backend fait
     uniquement deux appels : envoyer et verifier.
     Si les credentials Twilio sont absents, les actions sont loggees en
     console (dev sans compte Twilio).
EN — Uses Twilio Verify (Option A): Twilio handles code generation,
     expiry, rate-limiting and validation. The backend only makes two
     calls: send and check.
     If Twilio credentials are missing, actions are logged to console
     (dev without Twilio account).
"""

import logging

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")


def _client():
    from twilio.rest import Client
    s = get_settings()
    return Client(s.twilio_account_sid, s.twilio_auth_token)


def _has_twilio() -> bool:
    s = get_settings()
    return bool(s.twilio_account_sid and s.twilio_auth_token and s.twilio_verify_service_sid)


async def send_sms_otp(phone: str) -> bool:
    """Declenche l'envoi d'un OTP SMS via Twilio Verify.
    Retourne True si envoye, False si echec.
    / Triggers an SMS OTP via Twilio Verify.
    Returns True if sent, False on failure.
    """
    if not _has_twilio():
        logger.info("[SMS-DEV] OTP Twilio Verify declenche pour %s (pas de credentials)", phone)
        return True
    try:
        s = get_settings()
        verification = _client().verify.v2.services(
            s.twilio_verify_service_sid
        ).verifications.create(to=phone, channel="sms")
        logger.info("Twilio Verify OTP envoye a %s — status: %s", phone, verification.status)
        return verification.status in ("pending", "approved")
    except Exception as exc:
        logger.error("Twilio Verify send failed pour %s : %s", phone, exc)
        return False


async def check_sms_otp(phone: str, code: str) -> bool:
    """Verifie un code OTP SMS via Twilio Verify.
    Retourne True si valide, False sinon.
    / Checks an SMS OTP code via Twilio Verify.
    Returns True if valid, False otherwise.
    """
    if not _has_twilio():
        logger.info("[SMS-DEV] Verification OTP Twilio pour %s code=%s (pas de credentials — accepte tout)", phone, code)
        return True  # Dev mode: accept any code
    try:
        s = get_settings()
        result = _client().verify.v2.services(
            s.twilio_verify_service_sid
        ).verification_checks.create(to=phone, code=code)
        logger.info("Twilio Verify check pour %s — status: %s", phone, result.status)
        return result.status == "approved"
    except Exception as exc:
        logger.error("Twilio Verify check failed pour %s : %s", phone, exc)
        return False
