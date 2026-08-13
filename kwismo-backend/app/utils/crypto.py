"""Chiffrement de champs sensibles. / Sensitive field encryption.

FR — Chiffrement symetrique (Fernet) pour les champs stockes en base qui le
necessitent. Cle lue depuis FIELD_ENCRYPTION_KEY (.env) ; a generer avec
`Fernet.generate_key()`.
EN — Symmetric encryption (Fernet) for database fields that require it. Key
read from FIELD_ENCRYPTION_KEY (.env); generate one with
`Fernet.generate_key()`.
"""

from functools import lru_cache

from cryptography.fernet import Fernet

from app.core.config import get_settings


@lru_cache
def _fernet() -> Fernet:
    return Fernet(get_settings().field_encryption_key.encode())


def encrypt_field(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_field(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()
