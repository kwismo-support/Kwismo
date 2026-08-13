"""Acces donnees pour User. / Data access for User."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.user)

    async def get_by_email(self, email: str):
        return await self.delegate.find_unique(where={"email": email})
