"""Routes /roles, /access-rights. / Roles and access rights routes."""

from fastapi import APIRouter, Depends, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
from app.modules.access_control.schemas import AccessRightIn, AccessRightOut, RoleIn, RoleOut

router = APIRouter(tags=["Access Control"])


@router.get(
    "/roles",
    response_model=list[RoleOut],
    responses=AUTH_RESPONSES,
    summary="List roles / Lister les rôles",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def list_roles(user=Depends(require_roles("admin"))) -> list[RoleOut]:
    raise not_implemented()


@router.post(
    "/roles",
    response_model=RoleOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create a role / Créer un rôle",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_role(payload: RoleIn, user=Depends(require_roles("admin"))) -> RoleOut:
    raise not_implemented()


@router.get(
    "/access-rights",
    response_model=list[AccessRightOut],
    responses=AUTH_RESPONSES,
    summary="List access rights / Lister les droits d'accès",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def list_access_rights(user=Depends(require_roles("admin"))) -> list[AccessRightOut]:
    raise not_implemented()


@router.post(
    "/access-rights",
    response_model=AccessRightOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create an access right / Créer un droit d'accès",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_access_right(
    payload: AccessRightIn, user=Depends(require_roles("admin"))
) -> AccessRightOut:
    raise not_implemented()
