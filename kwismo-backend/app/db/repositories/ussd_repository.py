"""Acces donnees pour Country / Operator / UssdAction. / Data access for Country / Operator / UssdAction."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class CountryRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.country)


class OperatorRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.operator)


class UssdActionRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(db.ussdaction)
