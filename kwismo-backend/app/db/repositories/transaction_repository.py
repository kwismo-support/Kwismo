"""Acces donnees pour Transaction. / Data access for Transaction."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class TransactionRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(lambda: getattr(db, "transaction", None))
