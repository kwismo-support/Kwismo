#!/usr/bin/env python3
"""Normalise un dataset de messages d'arnaque pour tenir compte des variantes de langue,
   des lapsus et du franglais / pidgin souvent utilisés au Cameroun.

Le script:
- lit un JSONL de type scam quote
- applique une normalisation de texte (français, franglais, anglais, pidgin)
- corrige les variantes de mots courants
- détecte approximativement la langue principale
- garde la version originale et la version normalisée
- exporte un dataset prêt pour Model B

Usage:
    python scripts/normalize_scam_dataset.py
    python scripts/normalize_scam_dataset.py --input data/processed/scam_quotes_clean.jsonl --output data/processed/scam_quotes_normalized.jsonl
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


# Normalisation lexicale: formes fréquentes dans les textos/arnaques
NORMALIZATION_MAP = {
    "gagnée": "gagne",
    "gagnee": "gagne",
    "gagné": "gagne",
    "gain": "gagne",
    "ganne": "gagne",
    "j ai": "j ai",
    "j'ai": "j ai",
    "jai": "j ai",
    "j ai ete": "j ai ete",
    "j ai été": "j ai ete",
    "jai ete": "j ai ete",
    "votre": "votre",
    "votre": "votre",
    "ton": "ton",
    "n a": "n a",
    "n'a": "n a",
    "na": "n a",
    "m a": "m a",
    "m'a": "m a",
    "ma": "m a",
    "d argent": "d argent",
    "d'argent": "d argent",
    "dargent": "d argent",
    "argent": "argent",
    "compte": "compte",
    "compt": "compte",
    "cpte": "compte",
    "bloqué": "bloque",
    "bloque": "bloque",
    "bloquee": "bloque",
    "suspendu": "bloque",
    "suspendue": "bloque",
    "piraté": "pire",
    "pire": "pire",
    "pirate": "pire",
    "otp": "otp",
    "one time password": "otp",
    "one-time password": "otp",
    "passcode": "otp",
    "code pin": "pin",
    "pin code": "pin",
    "pin": "pin",
    "orange money": "orange money",
    "orangemoney": "orange money",
    "momo": "momo",
    "mobile money": "mobile money",
    "montant": "montant",
    "fcfa": "fcfa",
    "frs": "fcfa",
    "frais": "frais",
    "frai": "frais",
    "donnez": "donnez",
    "donne": "donnez",
    "donner": "donnez",
    "envoyez": "envoyez",
    "envoye": "envoyez",
    "send": "envoyez",
    "pay": "payez",
    "payer": "payez",
    "payez": "payez",
    "urgent": "urgent",
    "urjent": "urgent",
    "immediatement": "immediatement",
    "rapidement": "rapidement",
    "appelez": "appelez",
    "call": "appelez",
    "composez": "composez",
    "compose": "composez",
    "dial": "composez",
    "sur votre compte": "votre compte",
    "votre compte": "votre compte",
    "mon compte": "mon compte",
    "ton compte": "ton compte",
    "je suis victime": "je suis victime",
    "jai ete victime": "je suis victime",
    "j ai ete victime": "je suis victime",
    "je me suis fait arnaquer": "je me suis fait arnaquer",
    "je me suis fait escroquer": "je me suis fait escroquer",
    "on m a demande": "on m a demande",
    "on m'a demande": "on m a demande",
    "on m a demande le code": "on m a demande le code",
    "on m a dit": "on m a dit",
    "le code secret": "code secret",
    "code secret": "code secret",
    "faux message": "faux message",
    "fake message": "faux message",
    "message frauduleux": "message frauduleux",
    "sms frauduleux": "sms frauduleux",
    "fraud": "fraude",
    "scam": "arnaque",
    "victim": "victime",
    "victime": "victime",
}

LANGUAGE_HINTS = {
    "fr": ["je", "vous", "votre", "compte", "argent", "orange", "mobile", "arnaque", "fraude"],
    "en": ["your", "account", "money", "send", "code", "otp", "bank", "scam", "fraud"],
    "pidgin": ["make", "dey", "no", "for", "account", "money", "alert", "call", "code"],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalise un dataset de messages d'arnaque.")
    parser.add_argument("--input", type=Path, default=Path("data/processed/scam_quotes_clean.jsonl"),
                        help="Fichier JSONL source à normaliser.")
    parser.add_argument("--output", type=Path, default=Path("data/processed/scam_quotes_normalized.jsonl"),
                        help="Fichier JSONL normalisé à écrire.")
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


def normalize_text(raw: str) -> str:
    t = raw.strip()
    if not t:
        return ""

    t = t.lower()
    t = t.replace("\r", " ").replace("\n", " ")
    t = t.replace("’", "'")
    t = t.replace("–", "-")
    t = re.sub(r"https?://\S+|www\.\S+", " ", t, flags=re.IGNORECASE)
    t = re.sub(r"\s+", " ", t)

    # remplacer les apostrophes par un espace simple pour standardiser les mots
    t = t.replace("'", " ")
    t = re.sub(r"[^a-z0-9à-ÿ\s\-]", " ", t, flags=re.UNICODE)
    t = re.sub(r"\s+", " ", t)
    t = t.strip()

    # normalisation lexicale court-circuit
    tokens = t.split()
    norm_tokens: list[str] = []
    for token in tokens:
        key = token.strip()
        if key in NORMALIZATION_MAP:
            norm_tokens.append(NORMALIZATION_MAP[key])
        else:
            norm_tokens.append(key)

    # normalisation de certains groupes multi-mots
    normalized = " ".join(norm_tokens)
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = normalized.strip()
    return normalized


def detect_language(text: str) -> str:
    lowered = text.lower()
    scores = {name: 0 for name in LANGUAGE_HINTS}
    for lang, hints in LANGUAGE_HINTS.items():
        for hint in hints:
            if hint in lowered:
                scores[lang] += 1
    if not any(scores.values()):
        return "unknown"
    return max(scores, key=scores.get)


def main() -> None:
    args = parse_args()
    rows = load_jsonl(args.input.expanduser().resolve())

    cleaned: list[dict[str, Any]] = []
    seen: set[str] = set()

    for row in rows:
        if not isinstance(row, dict):
            continue

        original = row.get("quote")
        if not isinstance(original, str):
            continue

        original_clean = original.strip()
        if not original_clean:
            continue

        normalized = normalize_text(original_clean)
        if not normalized:
            continue

        if normalized in seen:
            continue
        seen.add(normalized)

        out = {
            "id": row.get("id") or f"n_{len(cleaned)+1}",
            "source": row.get("source") or "unknown",
            "url": row.get("url") or "",
            "text_original": original_clean,
            "text_normalized": normalized,
            "lang_detected": detect_language(normalized),
            "score": int(row.get("score") or 0),
            "matched_keywords": row.get("matched_keywords") or [],
            "suspected_category": row.get("suspected_category") or "a_categoriser",
            "needs_review": bool(row.get("needs_review", True)),
        }
        cleaned.append(out)

    out_path = args.output.expanduser().resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as fh:
        for item in cleaned:
            fh.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"[ok] {len(cleaned)} lignes normalisees exportees.")
    print(f"[ok] Sortie : {out_path}")


if __name__ == "__main__":
    main()
