"""Routes /settings/thresholds. / System settings & risk thresholds routes."""

from fastapi import APIRouter, Depends

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
from app.modules.settings import service
from app.modules.settings.schemas import SettingsThresholdsIn, SettingsThresholdsOut

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get(
    "/thresholds",
    response_model=SettingsThresholdsOut,
    responses=AUTH_RESPONSES,
    summary="Get risk thresholds / Récupérer les seuils de risque",
    description="**FR** — Récupère la configuration des seuils de risque (0.0 à 1.0).\n\n**EN** — Retrieves risk threshold configuration (0.0 to 1.0).",
)
async def get_thresholds(user=Depends(require_roles("user", "admin", "partner"))) -> SettingsThresholdsOut:
    rules = await service.get_threshold_rules()
    return SettingsThresholdsOut(rules=rules)


@router.put(
    "/thresholds",
    response_model=SettingsThresholdsOut,
    responses=AUTH_RESPONSES,
    summary="Update risk thresholds / Configurer les seuils de risque",
    description="**FR** — Seul le SuperAdmin peut configurer les seuils de risque (0.0 à 1.0).\n\n**EN** — SuperAdmin only: configures risk thresholds (0.0 to 1.0).",
)
async def update_thresholds(
    payload: SettingsThresholdsIn, user=Depends(require_roles("admin"))
) -> SettingsThresholdsOut:
    return await service.update_threshold_rules(payload)
