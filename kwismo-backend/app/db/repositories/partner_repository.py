"""Acces donnees pour Partner. / Data access for Partner."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class PartnerRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(lambda: getattr(db, "partner", None))
