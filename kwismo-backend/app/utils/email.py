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
            await asyncio.to_thread(resend.Emails.send, {
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


def _build_email_html(
    title: str,
    subtitle: str,
    content_html: str,
    footer_text: str = "© 2026 KWISMO — Protection & Sécurité des données.",
) -> str:
    """Génère un modèle HTML d'email haut de gamme responsive aux couleurs de KWISMO."""
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F6F8; padding: 40px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          <!-- HEADER DE MARQUE KWISMO -->
          <tr>
            <td style="background-color: #161E33; padding: 32px 24px; text-align: center; border-bottom: 4px solid #25B46E;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF; font-family: Arial, sans-serif;">
                KWISMO<span style="color: #25B46E;">.</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #A0AEC0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                {subtitle}
              </p>
            </td>
          </tr>
          <!-- CONTENU DU MESSAGE -->
          <tr>
            <td style="padding: 36px 28px; color: #2D3748; font-size: 15px; line-height: 1.6;">
              {content_html}
            </td>
          </tr>
          <!-- PIED DE PAGE -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #EDF2F7; padding: 20px 24px; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748B;">{footer_text}</p>
              <p style="margin: 0;">Cet email a été envoyé automatiquement par la plateforme KWISMO.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def send_otp_email(to: str, code: str, lang: str = "fr") -> None:
    """Envoie un email OTP avec design HTML haut de gamme en FR ou EN."""
    settings = get_settings()
    is_en = (lang or "").lower().startswith("en")

    if is_en:
        subject = f"Your KWISMO verification code: {code}"
        subtitle = "Mobile Identity & Data Security"
        content_html = f"""
        <p style="margin-top: 0;">Hello,</p>
        <p>Use the verification code below to validate your action on <strong>KWISMO</strong>:</p>
        
        <div style="background-color: #F0FDF4; border: 1.5px dashed #25B46E; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; display: block; margin-bottom: 8px;">
            VERIFICATION CODE
          </span>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #15803D; font-family: 'Courier New', monospace; margin: 6px 0;">
            {code}
          </div>
          <span style="font-size: 12px; color: #166534; opacity: 0.95; display: block; margin-top: 6px;">
            ⏱ Code expires in {settings.otp_expire_min} minutes
          </span>
        </div>

        <p style="font-size: 13px; color: #718096; margin-bottom: 24px;">
          If you did not request this verification code, please ignore this message. Your account remains secure.
        </p>
        <p style="margin-bottom: 0;">Best regards,<br><strong style="color: #161E33;">The KWISMO Security Team</strong></p>
        """
        footer_text = "© 2026 KWISMO — Security & Privacy Systems."
    else:
        subject = f"Votre code de vérification KWISMO : {code}"
        subtitle = "Sécurisation de l'identité mobile"
        content_html = f"""
        <p style="margin-top: 0;">Bonjour,</p>
        <p>Veuillez utiliser le code de vérification ci-dessous pour valider votre opération sur <strong>KWISMO</strong> :</p>
        
        <div style="background-color: #F0FDF4; border: 1.5px dashed #25B46E; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; display: block; margin-bottom: 8px;">
            CODE DE VÉRIFICATION
          </span>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #15803D; font-family: 'Courier New', monospace; margin: 6px 0;">
            {code}
          </div>
          <span style="font-size: 12px; color: #166534; opacity: 0.95; display: block; margin-top: 6px;">
            ⏱ Ce code expire dans {settings.otp_expire_min} minutes
          </span>
        </div>

        <p style="font-size: 13px; color: #718096; margin-bottom: 24px;">
          Si vous n'avez pas demandé ce code, ignorez cet email en toute sécurité. Votre compte est protégé.
        </p>
        <p style="margin-bottom: 0;">Cordialement,<br><strong style="color: #161E33;">L'équipe de sécurité KWISMO</strong></p>
        """
        footer_text = "© 2026 KWISMO — Protection & Sécurité des données."

    body_html = _build_email_html(
        title=subject,
        subtitle=subtitle,
        content_html=content_html,
        footer_text=footer_text,
    )

    await send_email(to, subject, body_html, dev_tag="EMAIL-OTP-DEV")


async def send_password_reset_email(to: str, reset_token: str, lang: str = "fr") -> None:
    """Envoie un email de réinitialisation de mot de passe HTML responsive."""
    settings = get_settings()
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
    is_en = (lang or "").lower().startswith("en")

    if is_en:
        subject = "Reset your KWISMO password"
        subtitle = "Password Reset Request"
        content_html = f"""
        <p style="margin-top: 0;">Hello,</p>
        <p>We received a request to reset your password for your <strong>KWISMO</strong> account.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}" target="_blank" style="background-color: #25B46E; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 180, 110, 0.35);">
            Reset Password
          </a>
        </div>

        <p style="font-size: 13px; color: #718096; margin-bottom: 16px;">
          This link is valid for 30 minutes. If the button above does not work, copy and paste this URL into your browser:
        </p>
        <p style="font-size: 12px; word-break: break-all; color: #25B46E; margin-bottom: 24px;">
          <a href="{reset_url}" style="color: #25B46E;">{reset_url}</a>
        </p>
        <p style="margin-bottom: 0;">Best regards,<br><strong style="color: #161E33;">The KWISMO Security Team</strong></p>
        """
        footer_text = "© 2026 KWISMO — Security & Privacy Systems."
    else:
        subject = "Réinitialisez votre mot de passe KWISMO"
        subtitle = "Réinitialisation de mot de passe"
        content_html = f"""
        <p style="margin-top: 0;">Bonjour,</p>
        <p>Nous avons reçu une demande de réinitialisation du mot de passe de votre compte <strong>KWISMO</strong>.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}" target="_blank" style="background-color: #25B46E; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 180, 110, 0.35);">
            Réinitialiser mon mot de passe
          </a>
        </div>

        <p style="font-size: 13px; color: #718096; margin-bottom: 16px;">
          Ce lien est valable 30 minutes. Si le bouton ci-dessus ne fonctionne pas, copiez ce lien dans votre navigateur :
        </p>
        <p style="font-size: 12px; word-break: break-all; color: #25B46E; margin-bottom: 24px;">
          <a href="{reset_url}" style="color: #25B46E;">{reset_url}</a>
        </p>
        <p style="margin-bottom: 0;">Cordialement,<br><strong style="color: #161E33;">L'équipe de sécurité KWISMO</strong></p>
        """
        footer_text = "© 2026 KWISMO — Protection & Sécurité des données."

    body_html = _build_email_html(
        title=subject,
        subtitle=subtitle,
        content_html=content_html,
        footer_text=footer_text,
    )

    await send_email(to, subject, body_html, dev_tag="EMAIL-RESET-DEV")

