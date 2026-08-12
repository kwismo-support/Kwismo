"""Logique metier du module access_control. / Business logic for the access_control module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.access_control.schemas import (
    AccessRightIn,
    AccessRightOut,
    RoleIn,
    RoleOut,
)

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

async def list_roles() -> list[RoleOut]:
    roles = await db.role.find_many(order={"nomRole": "asc"})
    return [RoleOut(id=r.id, nom_role=r.nomRole) for r in roles]


async def create_role(payload: RoleIn) -> RoleOut:
    existing = await db.role.find_unique(where={"nomRole": payload.nom_role})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un role avec ce nom existe deja / A role with this name already exists.",
        )
    role = await db.role.create(data={"nomRole": payload.nom_role})
    return RoleOut(id=role.id, nom_role=role.nomRole)


# ---------------------------------------------------------------------------
# Access rights
# ---------------------------------------------------------------------------

async def list_access_rights() -> list[AccessRightOut]:
    rights = await db.accessright.find_many(order=[{"roleId": "asc"}, {"permission": "asc"}])
    return [
        AccessRightOut(
            id=r.id,
            role_id=r.roleId,
            permission=r.permission,
            description=r.description,
        )
        for r in rights
    ]


async def create_access_right(payload: AccessRightIn) -> AccessRightOut:
    role = await db.role.find_unique(where={"id": payload.role_id})
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role introuvable / Role not found.",
        )
    existing = await db.accessright.find_first(
        where={"roleId": payload.role_id, "permission": payload.permission}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce droit d'acces existe deja pour ce role / This access right already exists for this role.",
        )
    right = await db.accessright.create(
        data={
            "roleId": payload.role_id,
            "permission": payload.permission,
            "description": payload.description,
        }
    )
    return AccessRightOut(
        id=right.id,
        role_id=right.roleId,
        permission=right.permission,
        description=right.description,
    )
