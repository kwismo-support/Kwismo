"""Pipeline de nettoyage des données brutes pour le Modèle B (NLP).

Filtre le bruit web (footers, mentions légales, journalistes), extrait les témoignages/exemples
de fraudes pertinents et génère un jeu de données propre dans data/processed/model_b_clean.jsonl.
"""

import json
import re
from pathlib import Path

RAW_KWISMO_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "kwismo_data" / "messages.jsonl"
RAW_SCRAPED_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"
CLEAN_OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_b_clean.jsonl"

# Mots-clés indiquant qu'un paragraphe/extrait parle directement d'escroquerie/fraude
FRAUD_INDICATORS = [
    "arnaque", "scam", "escroc", "escroquerie", "fraude", "pirat", "usurp",
    "vol", "vidé", "vide", "otp", "code secret", "momo", "mobile money",
    "orange money", "phishing", "hameçonnage", "hameconnage", "transfert",
    "sim swap", "tontine", "recrutement", "dépôt", "depot", "frais", "gagné", "gagne",
    "pin", "loterie", "promo", "prime", "faux sms", "faux transfert", "694", "691", "677"
]

# Patterns de boilerplate / bruit web à supprimer
BOILERPLATE_PATTERNS = [
    r"journaliste (économique|pour).*?237online\.com.*",
    r"votre adresse e-mail ne sera pas publiée.*",
    r"prévenez-moi de tous les nouveaux (commentaires|articles).*",
    r"237online\.com is not responsible.*",
    r"© \d{4} (bbc|kamerandroid|mtn|orange).*",
    r"la bbc n'est pas responsable du contenu.*",
    r"enregistrer mon nom,? e-mail et site.*",
    r"keep me signed in until i sign out.*",
    r"subscribe my newsletter.*",
    r"do not have an account \? register here.*",
    r"a new password will be emailed to you.*",
    r"ce site utilise akismet pour réduire les indésirables.*",
    r"accord sur la politique de confidentialité.*",
    r"tous droits réservés.*",
    r"rejoignez nos plus de \d+ abonnés.*",
    r"gratuit - mises a jour en temps reel.*",
]


def clean_text_content(raw_text: str) -> str:
    """Nettoie le texte en supprimant le bruit web et les phrases parasites."""
    if not raw_text:
        return ""

    lines = raw_text.splitlines()
    cleaned_lines = []

    for line in lines:
        line_str = line.strip()
        if not line_str or len(line_str) < 15:
            continue

        # Vérifier s'il s'agit de boilerplate
        lower_line = line_str.lower()
        is_boilerplate = any(re.search(pattern, lower_line) for pattern in BOILERPLATE_PATTERNS)
        if is_boilerplate:
            continue

        cleaned_lines.append(line_str)

    text_block = "\n".join(cleaned_lines)
    return text_block.strip()


def extract_fraud_snippets(cleaned_text: str) -> list[str]:
    """Découpe un texte propre en blocs/paragraphes et ne conserve que ceux parlant de fraude."""
    paragraphs = [p.strip() for p in cleaned_text.split("\n") if len(p.strip()) >= 20]
    relevant_snippets = []

    for p in paragraphs:
        p_lower = p.lower()
        if any(kw in p_lower for kw in FRAUD_INDICATORS):
            relevant_snippets.append(p)

    return relevant_snippets


def run_cleaning() -> int:
    """Exécute le pipeline de nettoyage complet."""
    input_path = RAW_KWISMO_PATH if RAW_KWISMO_PATH.exists() else RAW_SCRAPED_PATH

    if not input_path.exists():
        print(f"Fichier d'entrée introuvable : {input_path}")
        return 0

    print(f"Lecture du jeu de données brut depuis : {input_path}")
    raw_lines = [json.loads(line) for line in input_path.read_text(encoding="utf-8").splitlines() if line.strip()]

    clean_records = []
    sig_counter = 1

    for item in raw_lines:
        raw_text = item.get("texte")
        if not raw_text:
            continue

        cleaned = clean_text_content(raw_text)
        if not cleaned:
            continue

        snippets = extract_fraud_snippets(cleaned)
        for snippet in snippets:
            clean_records.append({
                "id_signalement": f"sig_{sig_counter:04d}",
                "texte": snippet,
                "type_origine": item.get("type", "texte"),
                "source_origine": item.get("source", "inconnue"),
            })
            sig_counter += 1

    # Dédoublonnage sur le texte exact nettoyé
    seen_texts = set()
    unique_records = []
    for rec in clean_records:
        norm = rec["texte"].strip().lower()
        if norm not in seen_texts:
            seen_texts.add(norm)
            unique_records.append(rec)

    # Ré-indexer les IDs proprement
    for idx, rec in enumerate(unique_records, start=1):
        rec["id_signalement"] = f"sig_{idx:04d}"

    CLEAN_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CLEAN_OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for rec in unique_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"Nettoyage terminé : {len(unique_records)} extraits de fraude nettoyés sauvegardés dans {CLEAN_OUTPUT_PATH}")
    return len(unique_records)


if __name__ == "__main__":
    run_cleaning()
