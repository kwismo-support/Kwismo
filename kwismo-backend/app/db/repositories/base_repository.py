"""CRUD generique reutilisable, portable sur toute base geree par Prisma. / Reusable generic CRUD, portable across any Prisma-managed database.

FR — Enveloppe fine autour d'un delegate de modele Prisma (ex. `db.user`,
`db.numero`...). N'utilise QUE l'API Prisma Client Python
(`find_many`/`find_unique`/`count`/`create`/`update`/`delete`) : c'est cette
regle qui garantit la portabilite SQLite/PostgreSQL/MySQL (cf. cahier §3.1
"Portabilite BD"). AUCUNE requete SQL brute (`query_raw`/`execute_raw`) ne
doit etre ajoutee ici ni ailleurs dans le projet — ce serait specifique au
moteur de la base active et casserait la bascule DB_TYPE.

Les repositories renvoient des instances de modele Prisma (pas encore les
schemas Pydantic `*Out` des modules) : la conversion vers le contrat public
de l'API se fait dans la couche `service.py` de chaque module.

EN — Thin wrapper around a Prisma model delegate (e.g. `db.user`,
`db.numero`...). Uses ONLY the Prisma Client Python API
(`find_many`/`find_unique`/`count`/`create`/`update`/`delete`): this rule is
what guarantees SQLite/PostgreSQL/MySQL portability (see spec §3.1 "DB
portability"). NO raw SQL query (`query_raw`/`execute_raw`) should ever be
added here or anywhere else in the project — it would be specific to the
active database engine and break the DB_TYPE switch.

Repositories return Prisma model instances (not yet the modules' public
`*Out` Pydantic schemas): converting to the API's public contract happens in
each module's `service.py` layer.
"""

from typing import Any, Generic, TypeVar

from app.core.schemas import Page

ModelT = TypeVar("ModelT")


class BaseRepository(Generic[ModelT]):
    def __init__(self, delegate: Any) -> None:
        """`delegate` = accesseur de modele Prisma, ex. `db.user`. / `delegate` = a Prisma model accessor, e.g. `db.user`."""
        self.delegate = delegate

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
