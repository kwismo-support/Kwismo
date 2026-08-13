#!/usr/bin/env python3
"""Transforme des JSONL bruts en dataset de citations de messages d'arnaque.

Le script lit les fichiers .jsonl de ~/Downloads (ou d'un dossier donné),
extrait les phrases utiles, filtre les textes qui ressemblent à des messages
frauduleux, et exporte un dataset prêt pour Model B dans un format proche de :

{"id": "...", "source": "...", "url": "...", "quote": "...", "score": 7,
 "matched_keywords": [...], "suspected_category": "fake_lottery", "needs_review": true}

Usage:
    python scripts/build_scam_quote_dataset.py
    python scripts/build_scam_quote_dataset.py --downloads-dir "C:/Users/you/Downloads"
"""

from __future__ import annotations

import argparse
import json
import re
import uuid
from pathlib import Path
from typing import Any


CATEGORY_KEYWORDS = {
    "fake_lottery": [
        "gagné", "gagne", "lotterie", "tiré au sort", "prime", "promo",
        "félicitations", "felicitations", "felicitations", "concours", "cadeau",
        "bonus", "reclamer", "remporter", "lot"],
    "vishing_agent": [
        "agent", "mobile money", "code pin", "pin", "anomalie", "votre compte",
        "donnez", "donne", "correctif", "correction", "support", "service client"
    ],
    "otp_request": [
        "otp", "code secret", "code de verification", "code de vérification",
        "partagez le code", "partager le code", "code sms", "verification"
    ],
    "transfer_request": [
        "envoyez", "envoyer", "transfert", "depot", "depot", "depot d argent",
        "frai de dossier", "frais de dossier", "payer", "versement", "cotisation"
    ],
    "account_blocked": [
        "compte bloque", "compte bloque", "compte suspendu", "bloque",
        "verifier votre compte", "votre compte est", "action requise"
    ],
    "fake_cashback": [
        "cashback", "remboursement", "retrocession", "retrocesion", "retrait",
        "bonus", "paiement recu", "argent gratuit", "recompense"
    ],
}


FRAUD_KEYWORDS = [
    "arnaque",
    "fraude",
    "escroquerie",
    "phishing",
    "gagné",
    "gagne",
    "promo",
    "lotterie",
    "prime",
    "paiement",
    "otp",
    "code pin",
    "mobile money",
    "orange money",
    "momo",
    "envoyez",
    "donnez",
    "donne",
    "compte bloqué",
    "compte bloque",
    "bloqué",
    "suspendu",
    "votre compte",
    "urgent",
    "immédiatement",
    "immediatement",
    "frais de dossier",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Construire un dataset de citations de fraude.")
    parser.add_argument("--downloads-dir", type=Path, default=Path.home() / "Downloads",
                        help="Dossier contenant les .jsonl à traiter. Default: ~/Downloads")
    parser.add_argument("--output", type=Path, default=Path("data/processed/scam_quotes.jsonl"),
                        help="Fichier JSONL de sortie.")
    parser.add_argument("--min-chars", type=int, default=60,
                        help="Longueur minimum d'une citation pour être conservée.")
    return parser.parse_args()


def find_jsonl_files(downloads_dir: Path) -> list[Path]:
    if not downloads_dir.exists():
        return []
    return sorted(downloads_dir.glob("*.jsonl"))


def read_json_line(line: str) -> dict[str, Any] | None:
    text = line.strip()
    if not text:
        return None
    try:
        obj = json.loads(text)
    except json.JSONDecodeError:
        return None
    return obj if isinstance(obj, dict) else None


def extract_text(record: dict[str, Any]) -> str:
    for key in ("texte", "text", "message", "content", "body", "quote", "description", "raw_text"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return ""


def normalize_text(raw: str) -> str:
    text = raw.strip()
    if not text:
        return ""
    text = text.replace("\r", " ").replace("\n", " ")
    text = text.replace("’", "'")
    text = text.replace("–", "-")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\sà-ÿÀ-Ý0-9,.!?;:/%\-']", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    text = text.strip(" -_.,;:!?()[]{}\"'")
    return text


def split_into_quotes(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    cleaned = []
    for s in sentences:
        s = s.strip()
        if len(s) >= 25:
            cleaned.append(s)
    return cleaned


def detect_keywords(text: str) -> list[str]:
    lowered = text.lower()
    matched = []
    for kw in FRAUD_KEYWORDS:
        if kw.lower() in lowered:
            matched.append(kw)
    return matched


def detect_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw.lower() in lowered for kw in keywords):
            return category
    return "a_categoriser"


def score_quote(text: str) -> int:
    score = 0
    lowered = text.lower()
    for kw in FRAUD_KEYWORDS:
        if kw.lower() in lowered:
            score += 1
    if any(word in lowered for word in ["gagné", "gagne", "donnez", "envoyez", "code", "otp", "bloqué", "bloque"]):
        score += 1
    if len(text) > 100:
        score += 1
    return min(score, 10)


def is_scam_quote(text: str) -> bool:
    lowered = text.lower()
    if len(text) < 60:
        return False
    if not any(kw in lowered for kw in FRAUD_KEYWORDS):
        return False
    if any(phrase in lowered for phrase in [
        "nous vous recommandons",
        "la fraude est",
        "les arnaques sont",
        "pour éviter",
        "pour signaler",
        "votre article",
        "les victimes",
        "notre article",
        "le site d'arnaque",
    ]):
        return False
    return True


def build_record(source: str, url: str, quote: str) -> dict[str, Any]:
    keywords = detect_keywords(quote)
    category = detect_category(quote)
    score = score_quote(quote)
    return {
        "id": uuid.uuid4().hex[:12],
        "source": source,
        "url": url,
        "quote": quote,
        "score": score,
        "matched_keywords": keywords,
        "suspected_category": category,
        "needs_review": True,
    }


def main() -> None:
    args = parse_args()
    files = find_jsonl_files(args.downloads_dir.expanduser().resolve())
    if not files:
        print(f"[warn] Aucun .jsonl dans {args.downloads_dir.expanduser().resolve()}")
        return

    records: list[dict[str, Any]] = []
    seen_quotes: set[str] = set()

    for file_path in files:
        with file_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                item = read_json_line(line)
                if item is None:
                    continue

                raw_text = extract_text(item)
                if not raw_text:
                    continue
                normalized = normalize_text(raw_text)
                if len(normalized) < args.min_chars:
                    continue

                for sentence in split_into_quotes(normalized):
                    if not is_scam_quote(sentence):
                        continue
                    if sentence in seen_quotes:
                        continue
                    seen_quotes.add(sentence)
                    source = str(item.get("source") or file_path.stem)
                    url = str(item.get("url") or "")
                    records.append(build_record(source, url, sentence))

    out_path = args.output.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"[ok] {len(records)} citations d'arnaque exportees.")
    print(f"[ok] Sortie: {out_path}")


if __name__ == "__main__":
    main()
