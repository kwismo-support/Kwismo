#!/usr/bin/env python3
"""Construit un dataset final pour Model B en combinant
- textes frauduleux (positive)
- textes légitimes (négative)
- normalisation FR / franglais / pidgin
- export CSV train/val séparés

Usage:
    python scripts/build_model_b_training_dataset.py
    python scripts/build_model_b_training_dataset.py --fraud data/processed/scam_quotes_normalized.jsonl --legit data/processed/legit_examples.jsonl --output-dir data/processed/model_b_ready
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import re
from pathlib import Path
from typing import Any


FRAUD_PATTERN_HINTS = [
    "gagne", "lotterie", "promo", "otp", "pin", "envoyez", "donnez", "compte bloque",
    "argent", "momo", "orange money", "mobile money", "fraude", "arnaque", "pirate",
    "message frauduleux", "code secret", "frais de dossier", "urgent",
]

LEGIT_PATTERN_HINTS = [
    "merci", "paiement reçu", "recu", "transaction reussie", "solde", "consommation",
    "facture", "recharge", "service client", "confirmation", "succes", "paiement validé",
    "votre code est", "transfert reussi", "reussi", "transaction confirme"
]

NORMALIZATION_MAP = {
    "gagnée": "gagne",
    "gagnee": "gagne",
    "gagné": "gagne",
    "ganne": "gagne",
    "jai": "j ai",
    "j'ai": "j ai",
    "m'a": "m a",
    "m a": "m a",
    "n'a": "n a",
    "d'argent": "d argent",
    "d argent": "d argent",
    "dargent": "d argent",
    "bloqué": "bloque",
    "bloquee": "bloque",
    "bloque": "bloque",
    "piraté": "pirate",
    "pirate": "pirate",
    "donnez": "donnez",
    "donne": "donnez",
    "donner": "donnez",
    "envoyez": "envoyez",
    "envoye": "envoyez",
    "one time password": "otp",
    "one-time password": "otp",
    "code pin": "pin",
    "pin code": "pin",
    "orange money": "orange money",
    "orangemoney": "orange money",
    "mobile money": "mobile money",
    "momo": "momo",
    "urgent": "urgent",
    "urjent": "urgent",
    "recu": "recu",
    "reçu": "recu",
    "succes": "succes",
    "success": "succes",
    "confirm": "confirme",
    "confirme": "confirme",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Construire le dataset final Model B.")
    parser.add_argument("--fraud", type=Path, default=Path("data/processed/scam_quotes_normalized.jsonl"),
                        help="Fichier JSONL de messages frauduleux.")
    parser.add_argument("--legit", type=Path, default=Path("data/processed/legit_examples.jsonl"),
                        help="Fichier JSONL de messages légitimes.")
    parser.add_argument("--output-dir", type=Path, default=Path("data/processed/model_b_ready"),
                        help="Répertoire de sortie pour le dataset final.")
    parser.add_argument("--val-ratio", type=float, default=0.15,
                        help="Ratio validation (0.15 = 15%).")
    parser.add_argument("--seed", type=int, default=42,
                        help="Seed pour la reproductibilité.")
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


def normalize_text(text: str) -> str:
    t = text.strip().lower()
    t = t.replace("\r", " ").replace("\n", " ")
    t = t.replace("’", "'")
    t = t.replace("–", "-")
    t = re.sub(r"https?://\S+|www\.\S+", " ", t, flags=re.IGNORECASE)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"[^a-z0-9à-ÿ\s\-]", " ", t, flags=re.UNICODE)
    t = re.sub(r"\s+", " ", t)
    t = t.strip()

    tokens = t.split()
    normalized_tokens = []
    for token in tokens:
        token = token.strip()
        token = NORMALIZATION_MAP.get(token, token)
        normalized_tokens.append(token)
    t = " ".join(normalized_tokens)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def extract_text(row: dict[str, Any]) -> str:
    for key in ("text_normalized", "text_original", "quote", "text", "message", "content"):
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return ""


def row_to_training_example(row: dict[str, Any], label: int) -> dict[str, str | int]:
    raw = extract_text(row)
    text = normalize_text(raw)
    if len(text) < 20:
        return None
    return {
        "text": text,
        "label": label,
        "source": str(row.get("source") or "unknown"),
        "category": str(row.get("suspected_category") or row.get("category") or "unknown"),
    }


def ensure_legit_examples(path: Path) -> list[dict[str, Any]]:
    if path.exists():
        return load_jsonl(path)

    examples = [
        {"text": "merci votre paiement a ete confirme et votre transaction est reussie", "source": "synthetic", "category": "legit"},
        {"text": "votre recharge a ete effectuee avec succes merci pour votre achat", "source": "synthetic", "category": "legit"},
        {"text": "solde de votre compte est mis a jour merci pour votre transfert", "source": "synthetic", "category": "legit"},
        {"text": "votre facture a ete payee merci nous avons bien recu votre paiement", "source": "synthetic", "category": "legit"},
        {"text": "votre code de confirmation a ete envoye a votre numero merci", "source": "synthetic", "category": "legit"},
        {"text": "paiement recu confirmation de la transaction effectuee", "source": "synthetic", "category": "legit"},
        {"text": "service client merci pour votre appel votre demande a bien ete prise en compte", "source": "synthetic", "category": "legit"},
    ]
    return examples


def main() -> None:
    args = parse_args()
    random.seed(args.seed)

    fraud_rows = load_jsonl(args.fraud)
    legit_rows = ensure_legit_examples(args.legit)

    records: list[dict[str, Any]] = []

    for row in fraud_rows:
        example = row_to_training_example(row, 1)
        if example is not None:
            records.append(example)

    for row in legit_rows:
        text = normalize_text(str(row.get("text") or ""))
        if len(text) < 20:
            continue
        records.append({
            "text": text,
            "label": 0,
            "source": str(row.get("source") or "synthetic"),
            "category": str(row.get("category") or "legit"),
        })

    if not records:
        raise SystemExit("Aucune donnée disponible pour construire le dataset final.")

    random.shuffle(records)
    val_size = max(1, int(len(records) * args.val_ratio))
    val_records = records[:val_size]
    train_records = records[val_size:]

    args.output_dir.mkdir(parents=True, exist_ok=True)
    train_path = args.output_dir / "train.csv"
    val_path = args.output_dir / "val.csv"

    def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
        with path.open("w", encoding="utf-8", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=["text", "label", "source", "category"])
            writer.writeheader()
            for row in rows:
                writer.writerow({
                    "text": row["text"],
                    "label": row["label"],
                    "source": row["source"],
                    "category": row["category"],
                })

    write_csv(train_path, train_records)
    write_csv(val_path, val_records)

    print(f"[ok] {len(train_records)} train / {len(val_records)} val")
    print(f"[ok] train: {train_path}")
    print(f"[ok] val: {val_path}")


if __name__ == "__main__":
    main()
