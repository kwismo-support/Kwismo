"""Prétraitement, normalisation, NER et auto-catégorisation dynamique du texte (Modèle B).

Gère le franglais camerounais, le pidgin, les raccourcis SMS, l'extraction d'entités (NER) et classe les signalements
dans des catégories stables d'escroqueries sans recalculer les descriptions déjà mises en cache.
"""

import re
import json
from pathlib import Path
from typing import Any

# Nettoyage des répétitions ex: "gagnéééé" -> "gagné"
_REPEATED_CHARS_RE = re.compile(r"(.)\1{2,}")

# Regex pour la détection NER (montants, codes USSD, numéros cibles)
_AMOUNT_RE = re.compile(r"\b\d+[\d\s\.]*\s*(?:fcfa|f cfa|cfa|f)\b", re.IGNORECASE)
_USSD_RE = re.compile(r"\*(?:\d+\*)*\d+#")
_PHONE_RE = re.compile(r"\b(?:237)?6[5-9]\d{7}\b")

# Chargement dynamique de la ressource externe de normalisation (slang_dictionary.json)
_SLANG_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "slang_dictionary.json"

def _load_slang_dictionary() -> dict[str, str]:
    if _SLANG_FILE.exists():
        try:
            data = json.loads(_SLANG_FILE.read_text(encoding="utf-8"))
            return data.get("terms", {})
        except Exception:
            pass
    return {}

SLANG_NORMALIZATION = _load_slang_dictionary()

# Définition des catégories stables d'escroqueries et de messages légitimes
CATEGORIES = {
    "fake_transfer_sms": [
        "vous avez reçu", "vous avez recu", "transfert effectué", "transfert effectue",
        "reçu par erreur", "recu par erreur", "renvoyer l'argent", "notification de transfert", "faux sms",
        "crédités", "credites", "ajoutés à votre solde", "ajoutes a votre solde",
        "m'a envoyé l'argent", "m'a envoye l'argent", "envoyé l'argent", "envoye l'argent", "fait l'erreur", "versé l'argent", "m'envoie l'argent"
    ],
    "fake_agent_otp": [
        "agent orange", "agent mtn", "compte bloqué", "compte bloque", "anomalie sur votre compte",
        "donnez votre code", "tape le code", "composition du code", "mot de passe secret", "réclamer le code",
        "service orange", "service mtn", "bloquer ma sim", "bloquer ma puce", "donne mon code", "donner mon code", "réclamer mon code"
    ],
    "lotto_winner_scam": [
        "félicitations", "felicitations", "loterie", "tirage au sort", "gagné", "gagne", "prime promo", "séjour à kribi",
        "retirer votre lot", "frais de traitement", "grand gagnant", "gagné un prix", "gagne un prix", "acquisition du prix"
    ],
    "sim_swap_scam": [
        "sim swap", "reconduction de sim", "swap", "puce bloquée", "piratage de puce", "dupliquée"
    ],
    "recruitment_fee_scam": [
        "recrutement", "recruteur", "offre d'emploi", "entretien à douala", "faux travail", "faux recrutement",
        "bourse d'étude", "bourse d'etude", "frais d'inscription", "concours administratif", "agence d'embauche"
    ],
    "identity_theft_social": [
        "usurpation d'identité", "usurpation d'identite", "faux profil", "arnaque amoureuse", "ami en détresse",
        "militaire basé", "colis bloqué", "colis bloque", "en danger", "send les do", "send l'argent", "envoyer l'argent", "accident", "usurpe"
    ],
    "legitimate_transaction": [
        "paiement de", "effectué avec succès", "effectue avec succes", "solde restant", "dépôt de", "depot de",
        "solde disponible", "réglée avec succès", "reglee avec succes", "réussi", "reussi", "forfait internet",
        "souscrit au forfait", "frais:", "frais :"
    ],
    "legitimate_chat": [
        "tu es où", "tu es ou", "on se voit", "envoie moi", "merci pour le transfert", "réunion", "reunion",
        "embouteillages", "waka fine", "bonjour maman", "rendez-vous", "rendez vous", "billet de bus", "vérifier si ce numéro", "verifier si ce numero"
    ],
    "legitimate_info": [
        "sensibilisation", "règle d'or", "regle d'or", "conseils de sécurité", "conseils de securite",
        "numéro officiel", "numero officiel", "cirt-cm", "antic", "communiqué", "communique", "conseils pratiques", "protéger", "proteger"
    ]
}


def normalize_text(text: str) -> str:
    """Normalise le texte en traitant les répétitions, minuscules et raccourcis SMS."""
    if not text:
        return ""
    text = text.lower().strip()
    text = _REPEATED_CHARS_RE.sub(r"\1", text)
    
    for slang, replacement in SLANG_NORMALIZATION.items():
        text = re.sub(rf"\b{re.escape(slang)}\b", replacement, text)

    return re.sub(r"\s+", " ", text).strip()


def extract_entities(text: str) -> dict[str, list[str]]:
    """Extrait les montants d'argent, codes USSD et numéros de téléphone cibles d'un texte (NER)."""
    if not text:
        return {"montants": [], "codes_ussd": [], "numeros_cibles": []}
    
    montants = [m.strip() for m in _AMOUNT_RE.findall(text)]
    codes_ussd = [u.strip() for u in _USSD_RE.findall(text)]
    numeros_cibles = [p.strip() for p in _PHONE_RE.findall(text)]

    return {
        "montants": list(dict.fromkeys(montants)),
        "codes_ussd": list(dict.fromkeys(codes_ussd)),
        "numeros_cibles": list(dict.fromkeys(numeros_cibles)),
    }


def translate_to_model_context(text: str) -> str:
    """Alignement contextuel du texte pour la représentation vectorielle et les modèles NLP."""
    norm = normalize_text(text)
    contextual_text = (
        norm.replace("mobile money", "MobileMoney_FinancialService")
            .replace("orange money", "OrangeMoney_FinancialService")
            .replace("code secret", "Secret_PIN_OTP_Credentials")
    )
    return contextual_text


def categorize_description(description: str) -> str:
    """Détecte et assigne une catégorie stable à une description de signalement."""
    norm = normalize_text(description)
    
    scores = {cat: 0 for cat in CATEGORIES}
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw in norm:
                scores[cat] += 1

    best_category = max(scores, key=scores.get)
    if scores[best_category] > 0:
        return best_category

    return "unknown_scam_pattern"


def process_report_batch(reports: list[dict[str, Any]], category_cache: dict[str, str]) -> dict[str, str]:
    """Traite un lot de signalements (id_signalement, description).
    
    Skips les descriptions déjà présentes dans category_cache pour optimiser la mémoire et les performances.
    """
    updated_cache = dict(category_cache)
    
    for report in reports:
        sig_id = report.get("id_signalement")
        description = report.get("description", "")
        
        if not sig_id:
            continue
            
        if sig_id in updated_cache:
            continue

        if not description:
            updated_cache[sig_id] = "uncategorized_empty"
        else:
            cat = categorize_description(description)
            updated_cache[sig_id] = cat

    return updated_cache
