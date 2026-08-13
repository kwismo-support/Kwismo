"""Traductions FR/EN. / FR/EN translations.

FR — Charge app/locales/{fr,en}.json au demarrage. `resolve_language` lit
l'en-tete Accept-Language (defaut : fr). `t()` recupere une cle
hierarchique ("errors.invalid_otp") et interpole les variables ({country}).
EN — Loads app/locales/{fr,en}.json at startup. `resolve_language` reads
the Accept-Language header (default: fr). `t()` fetches a hierarchical key
("errors.invalid_otp") and interpolates variables ({country}).
"""

import json
from functools import lru_cache
from pathlib import Path

LOCALES_DIR = Path(__file__).resolve().parent.parent / "locales"
SUPPORTED_LANGUAGES = ("fr", "en")
DEFAULT_LANGUAGE = "fr"


@lru_cache
def _catalog(lang: str) -> dict:
    path = LOCALES_DIR / f"{lang}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_language(accept_language: str | None) -> str:
    if not accept_language:
        return DEFAULT_LANGUAGE
    primary = accept_language.split(",")[0].split("-")[0].strip().lower()
    return primary if primary in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def t(key: str, lang: str = DEFAULT_LANGUAGE, **kwargs) -> str:
    node = _catalog(lang if lang in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE)
    for part in key.split("."):
        node = node.get(part, {}) if isinstance(node, dict) else {}
    text = node if isinstance(node, str) else key
    return text.format(**kwargs) if kwargs else text
