"""Email sending via Resend. / Envoi d'emails via Resend.

FR — Seul point d'envoi d'emails du backend. Utilise le SDK Resend.
     Si RESEND_API_KEY est vide, les emails sont loggues en console (dev sans cle).
EN — Single email-sending point for the backend. Uses the Resend SDK.
     If RESEND_API_KEY is empty, emails are logged to console (dev without key).
"""

import logging

import resend

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")
settings = get_settings()


def _init_resend() -> bool:
    """Initialise le SDK Resend. Retourne False si la cle est absente."""
    if not settings.resend_api_key:
        return False
    resend.api_key = settings.resend_api_key
    return True


async def send_otp_email(to: str, code: str, lang: str = "fr") -> None:
    """Envoie un email OTP a l'adresse donnee. / Sends an OTP email to the given address."""
    if lang == "en":
        subject = "Your KWISMO verification code"
        body = (
            f"<p>Hello,</p>"
            f"<p>Your verification code is: <strong>{code}</strong></p>"
            f"<p>This code expires in {settings.otp_expire_min} minutes.</p>"
            f"<p>If you did not request this code, ignore this email.</p>"
            f"<p>— The KWISMO Team</p>"
        )
    else:
        subject = "Votre code de vérification KWISMO"
        body = (
            f"<p>Bonjour,</p>"
            f"<p>Votre code de vérification est : <strong>{code}</strong></p>"
            f"<p>Ce code expire dans {settings.otp_expire_min} minutes.</p>"
            f"<p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>"
            f"<p>— L'équipe KWISMO</p>"
        )

    if not _init_resend():
        logger.info("[EMAIL-DEV] To: %s | Subject: %s | OTP: %s", to, subject, code)
        return

    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [to],
            "subject": subject,
            "html": body,
        })
        logger.info("Email OTP envoye a %s", to)
    except Exception as exc:
        logger.error("Echec envoi email OTP a %s : %s", to, exc)
        # Ne pas bloquer l'utilisateur si l'email echoue — on logue et on continue.
        # Do not block the user if email fails — log and continue.


async def send_password_reset_email(to: str, reset_token: str, lang: str = "fr") -> None:
    """Envoie un email de reinitialisation de mot de passe. / Sends a password reset email."""
    reset_url = f"http://localhost:5173/reset-password?token={reset_token}"

    if lang == "en":
        subject = "Reset your KWISMO password"
        body = (
            f"<p>Hello,</p>"
            f"<p>Click the link below to reset your password (valid 30 minutes):</p>"
            f"<p><a href='{reset_url}'>{reset_url}</a></p>"
            f"<p>If you did not request a reset, ignore this email.</p>"
            f"<p>— The KWISMO Team</p>"
        )
    else:
        subject = "Réinitialisez votre mot de passe KWISMO"
        body = (
            f"<p>Bonjour,</p>"
            f"<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe (valable 30 minutes) :</p>"
            f"<p><a href='{reset_url}'>{reset_url}</a></p>"
            f"<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>"
            f"<p>— L'équipe KWISMO</p>"
        )

    if not _init_resend():
        logger.info("[EMAIL-DEV] To: %s | Subject: %s | Token: %s", to, subject, reset_token)
        return

    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [to],
            "subject": subject,
            "html": body,
        })
        logger.info("Email reset envoye a %s", to)
    except Exception as exc:
        logger.error("Echec envoi email reset a %s : %s", to, exc)
