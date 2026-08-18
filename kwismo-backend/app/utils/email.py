"""Email sending with automatic fallback (Resend -> Google SMTP -> Console Dev). / Envoi d'emails avec chaîne de secours.

FR — Permet d'envoyer des emails via Resend. Si Resend échoue ou n'est pas configuré,
     bascule automatiquement sur Google SMTP. Si aucun n'est configuré, logge en console.
EN — Sends emails via Resend. If Resend fails or is unconfigured, automatically
     falls back to Google SMTP. Logs to console if neither is configured.
"""

import asyncio
import logging

from app.core.config import get_settings

logger = logging.getLogger("kwismo.backend")


async def send_email(to: str, subject: str, body_html: str, dev_tag: str = "EMAIL-DEV") -> bool:
    """Envoie un email via la chaîne de secours : Resend -> Google SMTP -> Console log."""
    settings = get_settings()

    # 1. Tentative via Resend API
    if settings.resend_api_key:
        try:
            import resend
            resend.api_key = settings.resend_api_key
            resend.Emails.send({
                "from": settings.email_from,
                "to": [to],
                "subject": subject,
                "html": body_html,
            })
            logger.info("Email envoyé via Resend à %s (sujet: %s)", to, subject)
            return True
        except Exception as exc:
            logger.warning("Échec envoi email via Resend à %s : %s — tentative fallback SMTP", to, exc)

    # 2. Tentative via Google SMTP (ou serveur SMTP configuré)
    if settings.smtp_user and settings.smtp_password:
        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText

            def _send_smtp():
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.smtp_from or settings.smtp_user
                msg["To"] = to
                msg.attach(MIMEText(body_html, "html"))

                if settings.smtp_use_tls:
                    server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
                    server.starttls()
                else:
                    server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10)

                server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(msg["From"], [to], msg.as_string())
                server.quit()

            await asyncio.to_thread(_send_smtp)
            logger.info("Email envoyé via SMTP à %s (sujet: %s)", to, subject)
            return True
        except Exception as exc:
            logger.warning("Échec envoi email via SMTP à %s : %s", to, exc)

    # 3. Fallback Dev Mode (console log)
    logger.info("[%s] To: %s | Subject: %s | Body: %s", dev_tag, to, subject, body_html)
    return True


async def send_otp_email(to: str, code: str, lang: str = "fr") -> None:
    """Envoie un email OTP à l'adresse donnée."""
    settings = get_settings()
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

    await send_email(to, subject, body, dev_tag="EMAIL-OTP-DEV")


async def send_password_reset_email(to: str, reset_token: str, lang: str = "fr") -> None:
    """Envoie un email de réinitialisation de mot de passe."""
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

    await send_email(to, subject, body, dev_tag="EMAIL-RESET-DEV")
