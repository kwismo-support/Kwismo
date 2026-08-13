#!/usr/bin/env python3
"""Exporte un dataset final propre au format CSV pour l'entraînement du modèle.

Le script lit un fichier JSONL normalisé (ex. scam_quotes_normalized.jsonl),
choisit les colonnes utiles, nettoie les champs, et exporte un fichier CSV
prêt à être utilisé pour l'entraînement ou l'analyse.

Usage:
    python scripts/export_final_training_csv.py
    python scripts/export_final_training_csv.py --input data/processed/scam_quotes_normalized.jsonl --output data/processed/final_model_b_dataset.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Exporter un dataset final propre en CSV.")
    parser.add_argument("--input", type=Path, default=Path("data/processed/scam_quotes_normalized.jsonl"),
                        help="Fichier JSONL source.")
    parser.add_argument("--output", type=Path, default=Path("data/processed/final_model_b_dataset.csv"),
                        help="Fichier CSV de sortie.")
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


def clean_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float, bool)):
        return str(value)
    text = str(value).strip()
    text = re.sub(r"\s+", " ", text)
    return text


def final_label(category: str | None) -> str:
    if category is None:
        return "fraud"
    mapping = {
        "fake_lottery": "fraud",
        "vishing_agent": "fraud",
        "otp_request": "fraud",
        "transfer_request": "fraud",
        "account_blocked": "fraud",
        "fake_cashback": "fraud",
        "a_categoriser": "fraud",
    }
    return mapping.get(str(category), "fraud")


def main() -> None:
    args = parse_args()
    rows = load_jsonl(args.input.expanduser().resolve())

    export_rows: list[dict[str, str]] = []
    seen: set[str] = set()

    for row in rows:
        if not isinstance(row, dict):
            continue

        text = row.get("text_normalized") or row.get("text_original") or row.get("quote")
        if not isinstance(text, str):
            continue

        text = clean_value(text)
        if not text:
            continue

        # on garde le texte normalisé si présent ; sinon l'original
        text_key = text
        if text_key in seen:
            continue
        seen.add(text_key)

        source = clean_value(row.get("source") or "unknown")
        category = clean_value(row.get("suspected_category") or "unknown")
        lang = clean_value(row.get("lang_detected") or "unknown")
        score = clean_value(row.get("score") or 0)

        export_rows.append({
            "text": text,
            "label": final_label(category),
            "category": category,
            "source": source,
            "lang": lang,
            "score": score,
        })

    out_path = args.output.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = ["text", "label", "category", "source", "lang", "score"]
    with out_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(export_rows)

    print(f"[ok] {len(export_rows)} lignes exportees vers {out_path}")


if __name__ == "__main__":
    main()
