"""Logique metier du module numbers. / Business logic for the numbers module.

FR — Appelle app.modules.ai_gateway.client pour obtenir le score, avec repli
sur ai_gateway.fallback_rules si l'IA est indisponible.
EN — Calls app.modules.ai_gateway.client to get the score, falling back to
ai_gateway.fallback_rules if the AI is unavailable.
"""

from app.core.exceptions import not_implemented
from app.db.repositories.number_repository import NumberRepository

_numbers = NumberRepository()


async def verify_number(payload):
    raise not_implemented()


async def batch_verify_numbers(payload):
    raise not_implemented()


async def list_numbers(page: int, page_size: int, statut: str | None, country_id: str | None, operator_id: str | None):
    raise not_implemented()


async def get_number(number_id: str):
    raise not_implemented()


async def set_number_status(number_id: str, payload):
    raise not_implemented()
