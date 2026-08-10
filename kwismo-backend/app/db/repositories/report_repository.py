"""Acces donnees pour Report. / Data access for Report."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class ReportRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.report)
