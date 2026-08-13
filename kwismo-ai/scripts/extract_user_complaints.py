#!/usr/bin/env python3
"""Extrait uniquement les plaintes réelles d'utilisateurs sur les arnaques/fraudes.

Ce script:
- parcourt tous les fichiers .jsonl dans ~/Downloads (ou un dossier fourni)
- charge les lignes JSON
- nettoie le texte
- garde uniquement les messages qui ressemblent à une plainte de victime
- exporte un dataset final de type "user_complaint" pour Model B

Usage:
    python scripts/extract_user_complaints.py
    python scripts/extract_user_complaints.py --downloads-dir "C:/Users/you/Downloads"
    python scripts/extract_user_complaints.py --downloads-dir "C:/Users/you/Downloads" --output data/processed/user_complaints.jsonl
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


COMPLAINT_PATTERNS = [
    "je suis victime",
    "j ai ete victime",
    "j'ai été victime",
    "je me suis fait arnaquer",
    "je me suis fait escroquer",
    "je me suis fait voler",
    "on m a vole",
    "on m'a volé",
    "on m a escroque",
    "on m'a escroqué",
    "j ai perdu",
    "j'ai perdu",
    "j ai reçu",
    "j'ai reçu",
    "j ai rea",
    "j'ai rea",
    "compte pirate",
    "compte piraté",
    "mon compte a ete pirate",
    "mon compte a été piraté",
    "on m a demande",
    "on m'a demandé",
    "on m a demande le code",
    "on m'a demandé le code",
    "code otp",
    "otp",
    "j ai ete dup",
    "j'ai été dupé",
    "j ai ete trompe",
    "j'ai été trompé",
    "j ai ete victime d arnaque",
    "j'ai été victime d'arnaque",
    "je viens de me faire arnaquer",
    "je viens d etre victime",
    "message frauduleux",
    "sms frauduleux",
    "faux message",
    "faux sms",
    "faux appel",
    "mon argent a disparu",
    "argent a quitte",
    "argent a disparu",
    "j ai ete victime de la fraude",
    "j'ai été victime de la fraude",
]

FRAUD_KEYWORDS = [
    "arnaque",
    "fraude",
    "escroquerie",
    "phishing",
    "piratage",
    "compte pirate",
    "compte bloque",
    "mobile money",
    "orange money",
    "momo",
    "code otp",
    "otp",
    "transfert",
    "argent",
    "vol",
    "ve",
    "faux message",
    "sms frauduleux",
]

NON_COMPLAINT_PATTERNS = [
    "attention aux arnaques",
    "evitez les arnaques",
    "les arnaques sont",
    "pour signaler une arnaque",
    "les escroqueries",
    "notre article",
    "nous vous recommandons",
    "l'organisation",
    "la fraude est",
    "une arnaque consiste",
    "la plateforme de signalement",
    "le site d'arnaque",
    "les victimes peuvent",
    "ce message est un faux",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extraire les plaintes d'utilisateurs liées à des arnaques/fraudes.")
    parser.add_argument("--downloads-dir", type=Path, default=Path.home() / "Downloads",
                        help="Dossier des fichiers .jsonl à traiter. Default: ~/Downloads")
    parser.add_argument("--output", type=Path, default=Path("data/processed/user_complaints.jsonl"),
                        help="Fichier JSONL de sortie des plaintes d'utilisateurs.")
    parser.add_argument("--min-chars", type=int, default=30,
                        help="Nombre minimum de caractères pour conserver un message.")
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
    for key in ("texte", "text", "message", "content", "body", "description", "raw_text"):
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value
    return ""


def normalize_text(raw: str) -> str:
    text = raw.strip()
    if not text:
        return ""
    text = text.replace("\r", " ").replace("\n", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text)
    text = text.replace("’", "'")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[^\w\sà-ÿÀ-Ý0-9,.!?;:/%\-']", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    text = text.strip(" -_.,;:!?()[]{}\"'")
    return text


def looks_like_user_complaint(text: str) -> bool:
    t = text.lower()
    has_conflict_pattern = any(p in t for p in COMPLAINT_PATTERNS)
    has_fraud_context = any(k in t for k in FRAUD_KEYWORDS)
    is_not_generic = not any(p in t for p in NON_COMPLAINT_PATTERNS)
    return has_conflict_pattern and has_fraud_context and is_not_generic


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def main() -> None:
    args = parse_args()

    files = find_jsonl_files(args.downloads_dir.expanduser().resolve())
    if not files:
        print(f"[warn] Aucun fichier .jsonl trouve dans {args.downloads_dir.expanduser().resolve()}.")
        return

    valid_texts: list[str] = []
    for file_path in files:
        with file_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                record = read_json_line(line)
                if record is None:
                    continue
                raw_text = extract_text(record)
                if not raw_text:
                    continue
                text = normalize_text(raw_text)
                if len(text) < args.min_chars:
                    continue
                if looks_like_user_complaint(text):
                    valid_texts.append(text)

    deduped = dedupe_preserve_order(valid_texts)

    out_path = args.output.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf-8") as fh:
        for text in deduped:
            row = {
                "text": text,
                "label": "fraud_complaint",
                "type": "user_complaint",
                "source": "merged_downloads",
            }
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"[ok] {len(deduped)} plaintes d'utilisateurs extraites.")
    print(f"[ok] Sortie : {out_path}")


if __name__ == "__main__":
    main()
