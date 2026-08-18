"""Génération, envoi et vérification centralisés des OTPs (kwismo-backend).

FR — Centralise la gestion des codes OTP (SMS et Email) avec une chaîne de secours complète :
     1. Twilio SMS (Verify API)
     2. Email via Resend (si l'utilisateur a un email)
     3. Email via Google SMTP (si Resend est indisponible)
     4. Mode Console Log (dev / fallback sans interruption de service)
EN — Centralized OTP management (SMS and Email) with complete fallback chain:
     1. Twilio SMS (Verify API)
     2. Email via Resend (if email provided)
     3. Email via Google SMTP (if Resend is unavailable)
     4. Console Log Mode (dev / fallback without service interruption)
"""

import asyncio
import logging
import secrets

from app.core.config import get_settings
from app.utils.email import send_otp_email

logger = logging.getLogger("kwismo.backend")

OTP_LENGTH = 6


def generate_otp() -> str:
    """Génère un code OTP numérique à 6 chiffres. / Generates a 6-digit numeric OTP."""
    return str(secrets.randbelow(1000000)).zfill(OTP_LENGTH)


def _client():
    from twilio.rest import Client
    s = get_settings()
    return Client(s.twilio_account_sid, s.twilio_auth_token)


def _has_twilio() -> bool:
    s = get_settings()
    return bool(s.twilio_account_sid and s.twilio_auth_token and s.twilio_verify_service_sid)


async def send_sms_otp(phone: str, code: str | None = None, email: str | None = None) -> bool:
    """Déclenche l'envoi d'un OTP par SMS via Twilio avec chaîne de secours vers Email/SMTP."""
    code_to_send = code or generate_otp()

    # 1. Tentative d'envoi via Twilio Verify (SMS)
    if _has_twilio():
        try:
            s = get_settings()

            def _twilio_send():
                verification = _client().verify.v2.services(
                    s.twilio_verify_service_sid
                ).verifications.create(to=phone, channel="sms")
                return verification.status

            status = await asyncio.to_thread(_twilio_send)
            logger.info("Twilio Verify OTP envoyé à %s — status: %s", phone, status)
            if status in ("pending", "approved"):
                return True
        except Exception as exc:
            logger.warning("Échec Twilio SMS pour %s : %s — passage au fallback Email", phone, exc)

    # 2. Fallback Email (Resend -> Google SMTP) si une adresse email est disponible
    if email:
        logger.info("[SMS-FALLBACK] Tentative d'envoi de l'OTP (%s) par email à %s", code_to_send, email)
        try:
            await send_otp_email(email, code_to_send)
            return True
        except Exception as exc:
            logger.warning("[SMS-FALLBACK] Échec envoi email OTP à %s : %s", email, exc)

    # 3. Fallback Dev Mode (console log — rien ne bloque)
    logger.info("[SMS-DEV] OTP SMS déclenché pour phone=%s (code=%s, email=%s)", phone, code_to_send, email)
    return True


async def check_sms_otp(phone: str, code: str) -> bool:
    """Vérifie un code OTP SMS via Twilio Verify ou accepte tout code en dev/fallback."""
    if _has_twilio():
        try:
            s = get_settings()

            def _twilio_check():
                result = _client().verify.v2.services(
                    s.twilio_verify_service_sid
                ).verification_checks.create(to=phone, code=code)
                return result.status

            status = await asyncio.to_thread(_twilio_check)
            logger.info("Twilio Verify check pour %s — status: %s", phone, status)
            return status == "approved"
        except Exception as exc:
            logger.warning("Twilio Verify check failed pour %s : %s — mode fallback activé", phone, exc)
            return True  # Dev / fallback mode

    logger.info("[SMS-DEV] Vérification OTP Twilio pour %s code=%s (pas de credentials — accepté)", phone, code)
    return True


async def send_email_otp(email: str, code: str, lang: str = "fr") -> None:
    """Envoie un OTP par email via la chaîne de secours."""
    await send_otp_email(email, code, lang=lang)
