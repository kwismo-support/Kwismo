"""CRUD generique reutilisable, portable sur toute base geree par Prisma. / Reusable generic CRUD, portable across any Prisma-managed database.

FR — Fine enveloppe autour d'un delegate de modele Prisma (ex. `db.user`).
N'utilise que l'API Prisma (find_many/find_unique/count/create/update/delete)
: jamais de SQL brut, pour rester portable entre bases. Renvoie des
instances Prisma brutes ; la conversion vers les schemas `*Out` se fait dans
`service.py`.
EN — Thin wrapper around a Prisma model delegate (e.g. `db.user`). Uses only
the Prisma API (find_many/find_unique/count/create/update/delete): never
raw SQL, to stay portable across databases. Returns raw Prisma instances;
converting to `*Out` schemas happens in `service.py`.
"""

from typing import Any, Generic, TypeVar

from app.core.schemas import Page

ModelT = TypeVar("ModelT")


class BaseRepository(Generic[ModelT]):
    def __init__(self, delegate: Any) -> None:
        """`delegate` = accesseur de modele Prisma, ex. `db.user`."""
        self._raw_delegate = delegate

    @property
    def delegate(self) -> Any:
        if callable(self._raw_delegate):
            return self._raw_delegate()
        return self._raw_delegate

    async def get(self, id: str, include: dict | None = None) -> ModelT | None:
        return await self.delegate.find_unique(where={"id": id}, include=include)

    async def list_page(
        self,
        page: int = 1,
        page_size: int = 20,
        where: dict | None = None,
        order: dict | list[dict] | None = None,
        include: dict | None = None,
    ) -> Page[ModelT]:
        where = where or {}
        total = await self.delegate.count(where=where)
        items = await self.delegate.find_many(
            where=where,
            order=order,
            include=include,
            skip=(page - 1) * page_size,
            take=page_size,
        )
        return Page[ModelT](items=items, total=total, page=page, page_size=page_size)

    async def create(self, data: dict, include: dict | None = None) -> ModelT:
        return await self.delegate.create(data=data, include=include)

    async def update(self, id: str, data: dict, include: dict | None = None) -> ModelT:
        return await self.delegate.update(where={"id": id}, data=data, include=include)

    async def delete(self, id: str) -> ModelT:
        return await self.delegate.delete(where={"id": id})
