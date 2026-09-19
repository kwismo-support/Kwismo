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
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

from app.core.security import CurrentUser


async def list_roles(current_user: CurrentUser) -> list[RoleOut]:
    if (current_user.role == "partner" or current_user.partner_id) and current_user.partner_id:
        roles = await db.role.find_many(
            where={"partnerId": current_user.partner_id},
            include={"partner": True},
            order={"nomRole": "asc"},
        )
    else:
        roles = await db.role.find_many(
            include={"partner": True},
            order={"nomRole": "asc"},
        )

    return [
        RoleOut(
            id=r.id,
            nom_role=r.nomRole,
            partner_id=r.partnerId,
            partner_name=r.partner.nomEntreprise if r.partner else None,
            is_system=r.partnerId is None,
        )
        for r in roles
    ]


async def create_role(payload: RoleIn, current_user: CurrentUser, lang: str = "fr") -> RoleOut:
    eff_partner_id = current_user.partner_id or payload.partner_id

    existing = await db.role.find_first(
        where={
            "nomRole": payload.nom_role,
            "partnerId": eff_partner_id,
        }
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("role_already_exists", lang),
        )
    role = await db.role.create(
        data={
            "nomRole": payload.nom_role,
            "partnerId": eff_partner_id,
        },
        include={"partner": True},
    )
    return RoleOut(
        id=role.id,
        nom_role=role.nomRole,
        partner_id=role.partnerId,
        partner_name=role.partner.nomEntreprise if role.partner else None,
        is_system=role.partnerId is None,
    )


async def delete_role(role_id: str, current_user: CurrentUser, lang: str = "fr"):
    from app.core.schemas import Message

    role = await db.role.find_unique(where={"id": role_id})
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("role_not_found", lang),
        )

    if current_user.role == "partner" and role.partnerId != current_user.partner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rôle non modifiable / Role not owned by partner.",
        )

    # Vérifier qu'aucun utilisateur n'est encore attaché à ce rôle.
    users_count = await db.user.count(where={"roleId": role_id})
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("role_has_users", lang),
        )

    await db.role.delete(where={"id": role_id})
    return Message(
        message_fr=t("role_deleted", "fr"),
        message_en=t("role_deleted", "en"),
    )


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


async def create_access_right(payload: AccessRightIn, lang: str = "fr") -> AccessRightOut:
    role = await db.role.find_unique(where={"id": payload.role_id})
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("role_not_found", lang),
        )
    existing = await db.accessright.find_first(
        where={"roleId": payload.role_id, "permission": payload.permission}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("access_right_already_exists", lang),
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


async def delete_access_right(right_id: str, lang: str = "fr"):
    from app.core.schemas import Message

    right = await db.accessright.find_unique(where={"id": right_id})
    if right is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("access_right_not_found", lang),
        )
    await db.accessright.delete(where={"id": right_id})
    return Message(
        message_fr=t("access_right_deleted", "fr"),
        message_en=t("access_right_deleted", "en"),
    )
