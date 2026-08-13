"""Acces donnees pour Numero. / Data access for Numero."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class NumberRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.numero)

    async def get_by_valeur(self, valeur: str):
        return await self.delegate.find_unique(where={"valeur": valeur})
