"""Logique metier du module transactions. / Business logic for the transactions module."""

from app.core.exceptions import not_implemented
from app.db.repositories.transaction_repository import TransactionRepository

_transactions = TransactionRepository()


async def prepare_transaction(user_id: str, payload):
    raise not_implemented()


async def list_transactions(user_id: str, page: int, page_size: int):
    raise not_implemented()


async def get_transaction(user_id: str, transaction_id: str):
    raise not_implemented()
