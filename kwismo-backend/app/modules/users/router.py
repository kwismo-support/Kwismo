"""Routes /users/*. / User account routes."""

from fastapi import APIRouter, Depends, Query, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.users.schemas import (
    UserDetailOut,
    UserListItemOut,
    UserMeOut,
    UserStatusIn,
    UserUpdateIn,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserMeOut,
    responses=AUTH_RESPONSES,
    summary="Get my profile / Consulter mon profil",
    description=(
        "**FR** — Profil du compte courant (nom, prénom, email) et KPI personnels.\n\n"
        "**EN** — Current account profile (name, surname, email) and personal KPIs."
    ),
)
async def get_me(user=Depends(require_roles("user"))) -> UserMeOut:
    raise not_implemented()


@router.patch(
    "/me",
    response_model=UserMeOut,
    responses=AUTH_RESPONSES,
    summary="Update my profile / Mettre à jour mon profil",
    description=(
        "**FR** — Met à jour le nom et/ou le prénom du compte courant.\n\n"
        "**EN** — Updates the current account's first/last name."
    ),
)
async def update_me(payload: UserUpdateIn, user=Depends(require_roles("user"))) -> UserMeOut:
    raise not_implemented()


@router.get(
    "",
    response_model=Page[UserListItemOut],
    responses=AUTH_RESPONSES,
    summary="List users / Lister les utilisateurs",
    description=(
        "**FR** — Liste paginée des comptes (nom, prénom, email, nombre de numéros "
        "rattachés). Périmètre restreint côté serveur pour un `partner`.\n\n"
        "**EN** — Paginated account list (name, surname, email, attached numbers "
        "count). Server-side scoped for a `partner`."
    ),
)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user=Depends(require_roles("admin", "partner")),
) -> Page[UserListItemOut]:
    raise not_implemented()


@router.get(
    "/{user_id}",
    response_model=UserDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get a user's detail / Détail d'un utilisateur",
    description=(
        "**FR** — Détail d'un compte, incluant la liste de ses numéros associés.\n\n"
        "**EN** — Account detail, including the list of its associated numbers."
    ),
)
async def get_user(user_id: str, user=Depends(require_roles("admin", "partner"))) -> UserDetailOut:
    raise not_implemented()


@router.patch(
    "/{user_id}/status",
    response_model=UserDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Activate/suspend a user / Activer ou suspendre un utilisateur",
    description=(
        "**FR** — Active ou suspend un compte.\n\n"
        "**EN** — Activates or suspends an account."
    ),
)
async def set_user_status(
    user_id: str, payload: UserStatusIn, user=Depends(require_roles("admin"))
) -> UserDetailOut:
    raise not_implemented()
