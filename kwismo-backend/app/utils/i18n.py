"""Internationalisation basique FR/EN."""

import logging

logger = logging.getLogger("kwismo.backend")

MESSAGES = {
    "report_validated": {
        "fr": "Votre signalement a été validé par nos équipes",
        "en": "Your report has been validated by our teams",
    },
    "report_rejected": {
        "fr": "Votre signalement a été rejeté après examen",
        "en": "Your report has been rejected after review",
    },
    "transaction_risk_high": {
        "fr": "Transaction à risque détectée - Vérifiez le destinataire",
        "en": "High-risk transaction detected - Please verify recipient",
    },
    "transaction_risk_medium": {
        "fr": "Transaction suspecte - Soyez prudent",
        "en": "Suspicious transaction - Please be careful",
    },
    "invalid_phone_format": {
        "fr": "Format de numéro invalide (E.164 attendu)",
        "en": "Invalid phone format (E.164 expected)",
    },
    "account_not_found": {
        "fr": "Compte introuvable",
        "en": "Account not found",
    },
    "phone_not_found": {
        "fr": "Numéro introuvable",
        "en": "Phone not found",
    },
    "user_not_found": {
        "fr": "Utilisateur introuvable",
        "en": "User not found",
    },
    "report_not_found": {
        "fr": "Signalement introuvable",
        "en": "Report not found",
    },
    "number_not_found": {
        "fr": "Numéro introuvable",
        "en": "Number not found",
    },
    "country_not_found": {
        "fr": "Pays introuvable",
        "en": "Country not found",
    },
    "operator_not_found": {
        "fr": "Opérateur introuvable",
        "en": "Operator not found",
    },
    "transaction_not_found": {
        "fr": "Transaction introuvable",
        "en": "Transaction not found",
    },
    "incident_not_found": {
        "fr": "Incident introuvable",
        "en": "Incident not found",
    },
    "device_not_found": {
        "fr": "Appareil introuvable",
        "en": "Device not found",
    },
}


def t(key: str, lang: str = "fr") -> str:
    """Traduit une clé selon la langue (fr par défaut)."""
    if key not in MESSAGES:
        logger.warning(f"Missing i18n key: {key}")
        return key
    
    return MESSAGES[key].get(lang, MESSAGES[key].get("fr", key))