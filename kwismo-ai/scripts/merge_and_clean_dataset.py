#!/usr/bin/env python3
"""Fusionne, nettoie et prépare un dataset JSONL à partir de plusieurs fichiers .jsonl.

Objectif :
- récupérer tous les fichiers .jsonl du dossier Téléchargements (ou d'un dossier donné)
- valider chaque ligne JSON
- fusionner les données sans écraser le fichier principal
- nettoyer le texte pour le modèle B
- dédupliquer les lignes quasi identiques
- exporter un dataset final prêt à l'entraînement

Usage :
    python scripts/merge_and_clean_dataset.py
    python scripts/merge_and_clean_dataset.py --downloads-dir "C:/Users/you/Downloads"
    python scripts/merge_and_clean_dataset.py --downloads-dir "C:/Users/you/Downloads" --output-dir data/processed
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


DEFAULT_FRAUD_KEYWORDS = [
    "arnaque",
    "scam",
    "fraude",
    "phishing",
    "hameconnage",
    "hameçonnage",
    "usurpation",
    "piratage",
    "code otp",
    "otp",
    "orange money",
    "momo",
    "mobile money",
    "compte bloqué",
    "compte bloque",
    "transfert dargent",
    "svp ne partagez pas",
    "rendez-vous",
    "caution",
    "cadeau",
    "revenu facile",
    "argent facile",
    "urgent",
    "immédiatement",
    "immediatement",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fusionner, nettoyer et préparer un dataset JSONL.")
    parser.add_argument(
        "--downloads-dir",
        type=Path,
        default=Path.home() / "Downloads",
        help="Dossier contenant les fichiers .jsonl à fusionner. Par défaut: ~/Downloads",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/processed"),
        help="Dossier de sortie pour les datasets nettoyés.",
    )
    parser.add_argument(
        "--min-chars",
        type=int,
        default=25,
        help="Nombre minimum de caractères d'un texte après nettoyage pour être conservé.",
    )
    parser.add_argument(
        "--max-lines",
        type=int,
        default=None,
        help="Optionnel: limite le nombre de lignes finales (utile pour tester).",
    )
    parser.add_argument(
        "--main-file",
        type=Path,
        default=Path("data/raw/scraped/messages.jsonl"),
        help="Fichier principal à fusionner, sans l'écraser si absent.",
    )
    return parser.parse_args()


def find_jsonl_files(downloads_dir: Path, explicit_paths: list[str] | None = None) -> list[Path]:
    if explicit_paths:
        return [Path(p) for p in explicit_paths if Path(p).exists()]

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
    for key in ("texte", "text", "message", "content", "body", "description", "raw_text"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return ""


def clean_text(raw_text: str) -> str:
    text = raw_text.strip()
    if not text:
        return ""

    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"[\t\xa0]+", " ", text)
    text = re.sub(r"[^\w\sà-ÿÀ-Ý0-9,.!?;:/%\-']", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    text = text.strip(" -_.,;:!?()[]{}\"'")
    return text


def infer_label(text: str) -> str:
    normalized = text.lower()
    if any(keyword in normalized for keyword in DEFAULT_FRAUD_KEYWORDS):
        return "fraud"
    if "merci" in normalized and len(normalized) < 30:
        return "legit"
    return "unknown"


def normalize_record(record: dict[str, Any], source_file: str) -> dict[str, Any] | None:
    raw_text = extract_text(record)
    if not raw_text:
        return None

    text = clean_text(raw_text)
    if len(text) < 25:
        return None

    label = infer_label(text)

    item = {
        "text": text,
        "label": label,
        "source_file": source_file,
        "source": str(record.get("source") or record.get("site") or "unknown"),
        "url": str(record.get("url") or ""),
    }
    return item


def merge_jsonl_files(files: list[Path]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()

    for file_path in files:
        if not file_path.exists():
            continue

        with file_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                record = read_json_line(line)
                if record is None:
                    continue

                normalized = normalize_record(record, file_path.name)
                if normalized is None:
                    continue

                key = normalized["text"]
                if key in seen:
                    continue

                seen.add(key)
                merged.append(normalized)

    return merged


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def build_summary(rows: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(row["label"] for row in rows)
    return {
        "total": len(rows),
        "fraud": counts.get("fraud", 0),
        "legit": counts.get("legit", 0),
        "unknown": counts.get("unknown", 0),
    }


def main() -> None:
    args = parse_args()

    downloads_dir = args.downloads_dir.expanduser().resolve()
    output_dir = args.output_dir.expanduser().resolve()
    main_file = args.main_file.expanduser().resolve()

    files = find_jsonl_files(downloads_dir)
    if not files:
        print(f"[warn] Aucun fichier .jsonl trouve dans {downloads_dir}.")
        print("[info] Le script s'arrete sans produire de dataset.")
        return

    merged = merge_jsonl_files(files)

    if main_file.exists():
        additional = merge_jsonl_files([main_file])
        merged_by_text = {row["text"]: row for row in merged}
        for row in additional:
            merged_by_text.setdefault(row["text"], row)
        merged = list(merged_by_text.values())

    if args.max_lines is not None:
        merged = merged[: args.max_lines]

    output_dir.mkdir(parents=True, exist_ok=True)
    merged_path = output_dir / "merged_all_clean.jsonl"
    model_b_path = output_dir / "model_b_dataset.jsonl"

    write_jsonl(merged_path, merged)

    # Dataset final pour Model B : on garde tout, avec label heuristique. 
    # Les messages de type "unknown" peuvent être relabelisés plus tard.
    write_jsonl(model_b_path, merged)

    summary = build_summary(merged)
    print(f"[ok] {len(merged)} lignes nettoyées et dédupliquées.")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"[ok] Fichier fusionné : {merged_path}")
    print(f"[ok] Dataset Model B : {model_b_path}")


if __name__ == "__main__":
    main()
