"""Acces donnees pour Pays / Operateurs / UssdAction. / Data access for Country / Operator / UssdAction."""

from app.db.prisma_client import db
from app.db.repositories.base_repository import BaseRepository


class CountryRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(lambda: getattr(db, "country", None))


class OperatorRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(lambda: getattr(db, "operator", None))


class UssdActionRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__(lambda: getattr(db, "ussdaction", None))
