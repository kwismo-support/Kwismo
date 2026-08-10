"""Pretraitement du texte (FR/EN/pidgin/franglais). / Text preprocessing (FR/EN/pidgin/franglish)."""

import re

_REPEATED_CHARS_RE = re.compile(r"(.)\1{2,}")


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = _REPEATED_CHARS_RE.sub(r"\1\1", text)  # "gagnéééé" -> "gagnéé"
    return re.sub(r"\s+", " ", text)
