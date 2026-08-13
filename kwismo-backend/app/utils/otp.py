"""Generation et envoi d'OTP. / OTP generation and delivery.

FR — Genere un code numerique a usage unique et simule l'envoi via email
ou SMS (log console en dev). Brancher un vrai provider (Mailgun, Twilio…)
en remplacant les fonctions `_send_email` et `_send_sms`.
EN — Generates a one-time numeric code and simulates delivery via email
or SMS (console log in dev). Wire a real provider (Mailgun, Twilio…) by
replacing `_send_email` and `_send_sms`.
"""

import logging
import secrets

logger = logging.getLogger("kwismo.backend")

OTP_LENGTH = 6


def generate_otp() -> str:
    """Genere un code OTP numerique a 6 chiffres. / Generates a 6-digit numeric OTP."""
    return "".join([str(secrets.randbelow(10)) for _ in range(OTP_LENGTH)])


async def send_email_otp(email: str, code: str) -> None:
    """Envoie le code OTP par email. / Sends the OTP code by email.

    TODO: remplacer par un vrai provider (Mailgun, SendGrid, SES…).
    TODO: replace with a real provider (Mailgun, SendGrid, SES…).
    """
    logger.info("[EMAIL OTP] Destinataire=%s  Code=%s", email, code)


async def send_sms_otp(phone: str, code: str) -> None:
    """Envoie le code OTP par SMS. / Sends the OTP code by SMS.

    TODO: remplacer par un vrai provider (Twilio, Orange SMS, AfricasTalking…).
    TODO: replace with a real provider (Twilio, Orange SMS, AfricasTalking…).
    """
    logger.info("[SMS OTP] Destinataire=%s  Code=%s", phone, code)
