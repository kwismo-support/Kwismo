"""Endpoints FastAPI pour les formules d'abonnement / Plans."""

from fastapi import APIRouter, Depends, status

from app.core.permissions import require_roles
from app.modules.plans.schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanResponse,
    SubscriptionPlanUpdate,
)
from app.modules.plans.service import plans_service

router = APIRouter(tags=["Subscription Plans"])


# ---------------------------------------------------------------------------
# Routes Publiques / Utilisateurs Connectés (Mobile & Web)
# ---------------------------------------------------------------------------

@router.get(
    "/plans/active",
    response_model=list[SubscriptionPlanResponse],
    summary="Lister les formules actives disponibles pour souscription",
)
async def list_active_plans() -> list[SubscriptionPlanResponse]:
    """Retourne la liste des offres d'abonnement actives configurées par l'administrateur."""
    return await plans_service.list_active_plans()


# ---------------------------------------------------------------------------
# Routes Administrateur (Admin & Super Admin)
# ---------------------------------------------------------------------------

@router.get(
    "/admin/plans",
    response_model=list[SubscriptionPlanResponse],
    summary="[Admin] Lister toutes les formules (actives et inactives)",
)
async def list_all_plans_admin(
    user=Depends(require_roles("super_admin", "admin")),
) -> list[SubscriptionPlanResponse]:
    """Réservé aux administrateurs pour la gestion des offres et tarifs."""
    return await plans_service.list_all_plans()


@router.get(
    "/admin/plans/{plan_id}",
    response_model=SubscriptionPlanResponse,
    summary="[Admin] Obtenir les détails d'une formule",
)
async def get_plan_admin(
    plan_id: str,
    user=Depends(require_roles("super_admin", "admin")),
) -> SubscriptionPlanResponse:
    return await plans_service.get_plan_by_id(plan_id)


@router.post(
    "/admin/plans",
    response_model=SubscriptionPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Créer une nouvelle formule d'abonnement",
)
async def create_plan_admin(
    data: SubscriptionPlanCreate,
    user=Depends(require_roles("super_admin", "admin")),
) -> SubscriptionPlanResponse:
    return await plans_service.create_plan(data)


@router.put(
    "/admin/plans/{plan_id}",
    response_model=SubscriptionPlanResponse,
    summary="[Admin] Modifier une formule d'abonnement",
)
async def update_plan_admin(
    plan_id: str,
    data: SubscriptionPlanUpdate,
    user=Depends(require_roles("super_admin", "admin")),
) -> SubscriptionPlanResponse:
    return await plans_service.update_plan(plan_id, data)


@router.patch(
    "/admin/plans/{plan_id}/toggle",
    response_model=SubscriptionPlanResponse,
    summary="[Admin] Activer / Désactiver une formule",
)
async def toggle_plan_admin(
    plan_id: str,
    user=Depends(require_roles("super_admin", "admin")),
) -> SubscriptionPlanResponse:
    return await plans_service.toggle_plan_status(plan_id)


@router.delete(
    "/admin/plans/{plan_id}",
    summary="[Admin] Supprimer une formule d'abonnement",
)
async def delete_plan_admin(
    plan_id: str,
    user=Depends(require_roles("super_admin", "admin")),
) -> dict[str, str]:
    return await plans_service.delete_plan(plan_id)
