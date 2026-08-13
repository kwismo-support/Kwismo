#!/usr/bin/env python3
"""Nettoie un dataset de citations d'arnaque et supprime les lignes "a_categoriser".

Objectif :
- lire un fichier JSONL de type scam_quotes
- éliminer les lignes trop vagues, non frauduleuses, ou mal classées
- faciliter le labeling manuel pour Model B
- exporter un dataset propre prêt pour l'entraînement

Usage:
    python scripts/clean_scam_quotes.py
    python scripts/clean_scam_quotes.py --input data/processed/scam_quotes.jsonl --output data/processed/scam_quotes_clean.jsonl
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


GENERIC_PATTERNS = [
    "nous vous recommandons",
    "pour votre securite",
    "pour votre sécurité",
    "la fraude est",
    "les arnaques sont",
    "ce message est un faux",
    "l article",
    "notre article",
    "site web",
    "voir plus",
    "cette page",
    "les victimes peuvent",
    "attention aux arnaques",
    "une arnaque consiste",
    "la plateforme de signalement",
    "article sur les arnaques",
    "pour évitez",
    "pour evitez",
    "pour signaler",
    "verifier votre solde",
    "vérifiez toujours",
    "vérifiez votre vrai solde",
]

THRESHOLD_MIN_CHARS = 40


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Nettoie un dataset de citations de fraude.")
    parser.add_argument("--input", type=Path, default=Path("data/processed/scam_quotes.jsonl"),
                        help="Fichier source JSONL à nettoyer.")
    parser.add_argument("--output", type=Path, default=Path("data/processed/scam_quotes_clean.jsonl"),
                        help="Fichier sortie JSONL nettoyé.")
    return parser.parse_args()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict):
                rows.append(obj)
    return rows


def clean_quote(text: str) -> str:
    t = text.strip()
    if not t:
        return ""

    t = t.replace("\r", " ").replace("\n", " ")
    t = re.sub(r"\s+", " ", t)
    t = t.strip(" \"'()[]{}.,;:!?-")
    return t


def looks_like_real_scam_quote(text: str) -> bool:
    t = text.lower()

    if len(t) < THRESHOLD_MIN_CHARS:
        return False

    if any(pattern in t for pattern in GENERIC_PATTERNS):
        return False

    positive_signals = [
        "gagné",
        "gagne",
        "envoyez",
        "donnez",
        "donne",
        "code",
        "otp",
        "pin",
        "argent",
        "frais",
        "mobile money",
        "orange money",
        "compte",
        "bloqué",
        "bloque",
        "piraté",
        "pirate",
        "fraude",
        "arnaque",
        "promo",
        "lotterie",
        "concours",
    ]

    if not any(signal in t for signal in positive_signals):
        return False

    if t.startswith("http"):
        return False

    return True


def is_valid_record(record: dict[str, Any]) -> bool:
    if not isinstance(record, dict):
        return False

    quote = record.get("quote")
    if not isinstance(quote, str):
        return False

    cleaned = clean_quote(quote)
    if not cleaned or not looks_like_real_scam_quote(cleaned):
        return False

    category = record.get("suspected_category")
    if category == "a_categoriser":
        return False

    return True


def main() -> None:
    args = parse_args()
    rows = load_jsonl(args.input.expanduser().resolve())

    kept: list[dict[str, Any]] = []
    seen: set[str] = set()

    for row in rows:
        if not is_valid_record(row):
            continue

        quote = clean_quote(row["quote"])
        if quote in seen:
            continue
        seen.add(quote)

        cleaned = {
            "id": row.get("id") or f"clean_{len(kept) + 1}",
            "source": row.get("source") or "unknown",
            "url": row.get("url") or "",
            "quote": quote,
            "score": int(row.get("score") or 0),
            "matched_keywords": row.get("matched_keywords") or [],
            "suspected_category": row.get("suspected_category") or "a_categoriser",
            "needs_review": bool(row.get("needs_review", True)),
        }
        kept.append(cleaned)

    out_path = args.output.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf-8") as fh:
        for item in kept:
            fh.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"[ok] {len(kept)} lignes valides conservees sur {len(rows)} lues.")
    print(f"[ok] Sortie : {out_path}")


if __name__ == "__main__":
    main()
