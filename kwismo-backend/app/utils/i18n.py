"""Internationalisation basique FR/EN."""

import logging

logger = logging.getLogger("kwismo.backend")

MESSAGES: dict[str, dict[str, str]] = {
    # --- Auth ---
    "email_already_in_use": {
        "fr": "Email déjà utilisé.",
        "en": "Email already in use.",
    },
    "account_not_found": {
        "fr": "Compte introuvable.",
        "en": "Account not found.",
    },
    "otp_invalid_or_expired": {
        "fr": "Code OTP invalide ou expiré.",
        "en": "Invalid or expired OTP code.",
    },
    "account_created": {
        "fr": "Compte créé. Un code de vérification a été envoyé par email.",
        "en": "Account created. A verification code was sent by email.",
    },
    "otp_email_resent": {
        "fr": "Nouveau code envoyé par email.",
        "en": "New code sent by email.",
    },
    "otp_email_resent_ambiguous": {
        "fr": "Si cet email existe, un code a été envoyé.",
        "en": "If this email exists, a code was sent.",
    },
    "login_invalid_credentials": {
        "fr": "Email ou mot de passe incorrect.",
        "en": "Incorrect email or password.",
    },
    "account_suspended": {
        "fr": "Compte suspendu.",
        "en": "Account suspended.",
    },
    "email_not_verified": {
        "fr": "Email non vérifié. Vérifiez votre boîte mail.",
        "en": "Email not verified. Check your inbox.",
    },
    "token_revoked": {
        "fr": "Jeton de rafraîchissement révoqué.",
        "en": "Revoked refresh token.",
    },
    "token_invalid": {
        "fr": "Jeton invalide ou expiré.",
        "en": "Invalid or expired token.",
    },
    "token_type_wrong": {
        "fr": "Type de jeton incorrect.",
        "en": "Incorrect token type.",
    },
    "auth_required": {
        "fr": "Authentification requise.",
        "en": "Authentication required.",
    },
    "access_denied": {
        "fr": "Accès refusé.",
        "en": "Access denied.",
    },
    "forgot_password_sent": {
        "fr": "Si cet email existe, un lien de réinitialisation a été envoyé.",
        "en": "If this email exists, a reset link was sent.",
    },
    "forgot_password_code_sent": {
        "fr": "Un code de réinitialisation a été envoyé par email.",
        "en": "A reset code was sent by email.",
    },
    "code_invalid_or_expired": {
        "fr": "Code invalide ou expiré.",
        "en": "Invalid or expired code.",
    },
    "password_reset_success": {
        "fr": "Mot de passe réinitialisé avec succès.",
        "en": "Password reset successfully.",
    },
    "logout_success": {
        "fr": "Déconnexion réussie.",
        "en": "Logged out successfully.",
    },
    # --- Users ---
    "user_not_found": {
        "fr": "Utilisateur introuvable.",
        "en": "User not found.",
    },
    "no_data_to_update": {
        "fr": "Aucune donnée à mettre à jour.",
        "en": "No data to update.",
    },
    "status_invalid_user": {
        "fr": "Statut invalide. Valeurs acceptées : active, suspended.",
        "en": "Invalid status. Accepted: active, suspended.",
    },
    # --- Phones ---
    "invalid_phone_format": {
        "fr": "Format de numéro invalide (E.164 attendu).",
        "en": "Invalid phone format (E.164 expected).",
    },
    "phone_already_attached": {
        "fr": "Ce numéro est déjà rattaché à un compte.",
        "en": "This number is already attached to an account.",
    },
    "phone_not_found": {
        "fr": "Numéro introuvable.",
        "en": "Phone not found.",
    },
    "phone_already_verified": {
        "fr": "Ce numéro est déjà vérifié.",
        "en": "This number is already verified.",
    },
    "phone_removed": {
        "fr": "Numéro retiré du compte.",
        "en": "Number removed from account.",
    },
    "otp_sms_resent": {
        "fr": "Nouveau code OTP SMS envoyé.",
        "en": "New SMS OTP sent.",
    },
    "phone_not_verified_for_compromise": {
        "fr": "Seul un numéro vérifié peut être déclaré compromis.",
        "en": "Only a verified number can be declared compromised.",
    },
    "phone_already_compromised": {
        "fr": "Ce numéro est déjà marqué comme compromis.",
        "en": "This number is already marked as compromised.",
    },
    # --- Contacts ---
    "contact_not_found": {
        "fr": "Contact introuvable.",
        "en": "Contact not found.",
    },
    "contact_already_exists": {
        "fr": "Ce contact existe déjà.",
        "en": "This contact already exists.",
    },
    "contact_removed": {
        "fr": "Contact supprimé.",
        "en": "Contact deleted.",
    },
    # --- Numbers ---
    "number_not_found": {
        "fr": "Numéro introuvable.",
        "en": "Number not found.",
    },
    "number_status_invalid": {
        "fr": "Statut invalide. Valeurs acceptées : securise, a_signaler, frauduleux, unknown.",
        "en": "Invalid status. Accepted: securise, a_signaler, frauduleux, unknown.",
    },
    # --- Reports ---
    "report_not_found": {
        "fr": "Signalement introuvable.",
        "en": "Report not found.",
    },
    "report_already_pending": {
        "fr": "Un signalement en attente existe déjà pour ce numéro.",
        "en": "A pending report already exists for this number.",
    },
    "report_already_submitted_device": {
        "fr": "Cet appareil a déjà effectué un signalement pour ce numéro.",
        "en": "This device has already submitted a report for this number.",
    },
    "report_already_processed": {
        "fr": "Ce signalement a déjà été traité.",
        "en": "This report has already been processed.",
    },
    "report_status_invalid": {
        "fr": "Statut invalide. Valeurs acceptées : validated, rejected.",
        "en": "Invalid status. Accepted: validated, rejected.",
    },
    # --- Notifications (push vers l'utilisateur) ---
    "report_validated": {
        "fr": "Votre signalement a été validé par nos équipes.",
        "en": "Your report has been validated by our teams.",
    },
    "report_rejected": {
        "fr": "Votre signalement a été rejeté après examen.",
        "en": "Your report has been rejected after review.",
    },
    # --- Transactions ---
    "transaction_not_found": {
        "fr": "Transaction introuvable.",
        "en": "Transaction not found.",
    },
    "operator_not_found": {
        "fr": "Opérateur introuvable.",
        "en": "Operator not found.",
    },
    "ussd_action_not_found": {
        "fr": "Action USSD introuvable ou incompatible avec l'opérateur.",
        "en": "USSD action not found or mismatched operator.",
    },
    "transfer_blocked_fraud": {
        "fr": "Transfert bloqué : le numéro destinataire est signalé comme frauduleux.",
        "en": "Transfer blocked: recipient number is flagged as fraudulent.",
    },
    "transaction_risk_high": {
        "fr": "Transaction à risque détectée — vérifiez le destinataire.",
        "en": "High-risk transaction detected — please verify recipient.",
    },
    "transaction_risk_medium": {
        "fr": "Transaction suspecte — soyez prudent.",
        "en": "Suspicious transaction — please be careful.",
    },
    # --- USSD ---
    "country_not_found": {
        "fr": "Pays introuvable.",
        "en": "Country not found.",
    },
    "country_dial_code_exists": {
        "fr": "Un pays avec cet indicatif existe déjà.",
        "en": "A country with this dial code already exists.",
    },
    "country_deleted": {
        "fr": "Pays supprimé.",
        "en": "Country deleted.",
    },
    "operator_deleted": {
        "fr": "Opérateur supprimé.",
        "en": "Operator deleted.",
    },
    "ussd_action_not_found_404": {
        "fr": "Action USSD introuvable.",
        "en": "USSD action not found.",
    },
    "ussd_action_deleted": {
        "fr": "Action USSD supprimée.",
        "en": "USSD action deleted.",
    },
    # --- Partners ---
    "partner_not_found": {
        "fr": "Partenaire introuvable.",
        "en": "Partner not found.",
    },
    # --- WhatsApp ---
    "incident_not_found": {
        "fr": "Incident introuvable.",
        "en": "Incident not found.",
    },
    "incident_already_closed": {
        "fr": "Cet incident est déjà clôturé.",
        "en": "This incident is already closed.",
    },
    "phone_not_verified_for_incident": {
        "fr": "Seul un numéro vérifié peut faire l'objet d'une déclaration.",
        "en": "Only a verified number can be declared.",
    },
    "no_valid_contacts": {
        "fr": "Aucun contact valide fourni.",
        "en": "No valid contacts provided.",
    },
    # --- Devices ---
    "device_not_found": {
        "fr": "Appareil introuvable.",
        "en": "Device not found.",
    },
    "device_removed": {
        "fr": "Appareil supprimé de votre compte.",
        "en": "Device removed from your account.",
    },
    # --- Access control ---
    "role_has_users": {
        "fr": "Impossible de supprimer ce rôle : des utilisateurs y sont encore rattachés.",
        "en": "Cannot delete this role: some users are still attached to it.",
    },
    "role_not_found": {
        "fr": "Rôle introuvable.",
        "en": "Role not found.",
    },
    "role_already_exists": {
        "fr": "Ce rôle existe déjà.",
        "en": "This role already exists.",
    },
    "access_right_not_found": {
        "fr": "Droit d'accès introuvable.",
        "en": "Access right not found.",
    },
    "access_right_already_exists": {
        "fr": "Ce droit d'accès existe déjà pour ce rôle.",
        "en": "This access right already exists for this role.",
    },
    "role_deleted": {
        "fr": "Rôle supprimé.",
        "en": "Role deleted.",
    },
    "access_right_deleted": {
        "fr": "Droit d'accès supprimé.",
        "en": "Access right deleted.",
    },
    "survey_not_found": {
        "fr": "Enquête introuvable ou inactive.",
        "en": "Survey not found or inactive.",
    },
    "survey_already_answered": {
        "fr": "Vous avez déjà répondu à cette enquête.",
        "en": "You have already answered this survey.",
    },
    "role_has_users": {
        "fr": "Impossible de supprimer ce rôle : des utilisateurs y sont encore rattachés.",
        "en": "Cannot delete this role: some users are still attached to it.",
    },
}


def t(key: str, lang: str = "fr") -> str:
    """Retourne le message traduit pour la clé et la langue données."""
    if key not in MESSAGES:
        logger.warning("i18n: clé manquante '%s'", key)
        return key
    return MESSAGES[key].get(lang) or MESSAGES[key].get("fr", key)
