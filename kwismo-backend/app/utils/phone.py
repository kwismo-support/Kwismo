"""Normalisation/validation de numeros. / Phone number normalization/validation.

FR — Exemple minimal ; a remplacer par une lib dediee (ex. phonenumbers) si
besoin de couvrir plus de pays.
EN — Minimal example; replace with a dedicated library (e.g. phonenumbers)
to cover more countries if needed.
"""

import re

E164_RE = re.compile(r"^\+[1-9]\d{6,14}$")


def normalize_phone(raw: str) -> str:
    """Retire espaces/tirets/points. / Strips spaces/dashes/dots."""

    return re.sub(r"[\s.\-()]", "", raw.strip())


def is_valid_phone(raw: str) -> bool:
    return bool(E164_RE.match(normalize_phone(raw)))


def extract_prefix(raw: str, country_code: str, prefix_length: int = 2) -> str:
    """Ex. extract_prefix("+237690000000", "+237") -> "69". / e.g. extract_prefix("+237690000000", "+237") -> "69"."""

    normalized = normalize_phone(raw)
    local_part = normalized.removeprefix(country_code)
    return local_part[:prefix_length]
