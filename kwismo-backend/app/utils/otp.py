import asyncio
import logging
import secrets

import httpx

from app.core.config import get_settings
from app.utils.email import send_otp_email

logger = logging.getLogger("kwismo.backend")

OTP_LENGTH = 6


def generate_otp() -> str:
    return str(secrets.randbelow(1000000)).zfill(OTP_LENGTH)


def _client():
    from twilio.rest import Client
    s = get_settings()
    return Client(s.twilio_account_sid, s.twilio_auth_token)


def _has_firebase() -> bool:
    s = get_settings()
    return bool(
        s.firebase_api_key
        or s.firebase_credentials_json
        or s.firebase_credentials_path
        or s.firebase_project_id
    )


def _has_twilio() -> bool:
    s = get_settings()
    return bool(s.twilio_account_sid and s.twilio_auth_token and s.twilio_verify_service_sid)


def _has_brevo() -> bool:
    s = get_settings()
    return bool(s.brevo_api_key)


async def _send_brevo_sms_otp(phone: str, code: str) -> bool:
    s = get_settings()
    if not s.brevo_api_key:
        return False
    url = "https://api.brevo.com/v3/transactionalSMS/send"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": s.brevo_api_key,
    }
    payload = {
        "sender": "KWISMO",
        "recipient": phone,
        "content": f"Votre code de verification KWISMO est: {code}",
        "type": "transactional",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code in (200, 201):
                logger.info("Brevo OTP SMS envoye avec succes a %s", phone)
                return True
            else:
                logger.warning("Echec envoi SMS Brevo (%s): %s", resp.status_code, resp.text)
    except Exception as exc:
        logger.warning("Erreur envoi SMS Brevo a %s: %s", phone, exc)
    return False


async def _send_firebase_otp(phone: str, code: str) -> bool:
    s = get_settings()
    if s.firebase_api_key:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key={s.firebase_api_key}"
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json={"phoneNumber": phone, "recaptchaToken": "dummy-dev-token"})
            if resp.status_code in (200, 201):
                logger.info("Code OTP envoye par SMS a %s via Firebase Identity Toolkit", phone)
                return True
            else:
                err_body = resp.text
                if "BILLING_NOT_ENABLED" in err_body or "QUOTA_EXCEEDED" in err_body:
                    logger.warning("Erreur quota ou facturation Firebase pour %s", phone)
                elif "OPERATION_NOT_ALLOWED" in err_body:
                    logger.warning("Methode non autorisee pour %s", phone)
                else:
                    logger.warning("Reponse API Firebase (%s): %s", resp.status_code, err_body)
                return False
    return False


async def _check_firebase_otp(phone: str, code: str, session_info: str | None = None) -> bool:
    s = get_settings()
    if s.firebase_api_key and session_info:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key={s.firebase_api_key}"
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json={"sessionInfo": session_info, "code": code})
            if resp.status_code in (200, 201):
                return True
            else:
                return False
    return True


async def send_sms_otp(phone: str, code: str | None = None, email: str | None = None) -> bool:
    code_to_send = code or generate_otp()

    if _has_firebase():
        try:
            success = await _send_firebase_otp(phone, code_to_send)
            if success:
                logger.info("Firebase OTP envoye avec succes a %s", phone)
                return True
        except Exception as exc:
            logger.warning("Erreur Firebase SMS pour %s : %s", phone, exc)

    if _has_brevo():
        try:
            success = await _send_brevo_sms_otp(phone, code_to_send)
            if success:
                logger.info("Brevo SMS OTP envoye avec succes a %s", phone)
                return True
        except Exception as exc:
            logger.warning("Erreur Brevo SMS pour %s : %s", phone, exc)

    if _has_twilio():
        try:
            s = get_settings()

            def _twilio_send():
                verification = _client().verify.v2.services(
                    s.twilio_verify_service_sid
                ).verifications.create(to=phone, channel="sms")
                return verification.status

            status = await asyncio.to_thread(_twilio_send)
            if status in ("pending", "approved"):
                return True
        except Exception as exc:
            logger.warning("Echec Twilio SMS pour %s : %s", phone, exc)

    if email:
        try:
            await send_otp_email(email, code_to_send, phone=phone)
            return True
        except Exception as exc:
            logger.warning("Echec envoi email OTP a %s : %s", email, exc)

    logger.info("OTP SMS declenche pour phone=%s (code=%s)", phone, code_to_send)
    return True


async def check_sms_otp(phone: str, code: str, session_info: str | None = None) -> bool:
    if _has_firebase():
        try:
            valid = await _check_firebase_otp(phone, code, session_info)
            if valid:
                return True
        except Exception as exc:
            logger.warning("Firebase check echoue pour %s : %s", phone, exc)

    if _has_twilio():
        try:
            s = get_settings()

            def _twilio_check():
                result = _client().verify.v2.services(
                    s.twilio_verify_service_sid
                ).verification_checks.create(to=phone, code=code)
                return result.status

            status = await asyncio.to_thread(_twilio_check)
            return status == "approved"
        except Exception as exc:
            logger.warning("Twilio Verify check failed pour %s : %s", phone, exc)
            return True

    return True


async def send_email_otp(email: str, code: str, lang: str = "fr") -> None:
    await send_otp_email(email, code, lang=lang)
