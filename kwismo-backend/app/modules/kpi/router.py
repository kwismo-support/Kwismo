"""Routes /kpi/*. / KPI routes."""

from fastapi import APIRouter, Depends

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
from app.modules.kpi import service
from app.modules.kpi.schemas import KpiOut

router = APIRouter(prefix="/kpi", tags=["KPI"])


@router.get(
    "/global",
    response_model=list[KpiOut],
    responses=AUTH_RESPONSES,
    summary="Global KPIs / KPI globaux",
    description="**FR** — KPI globaux en temps réel + historique stocké (dashboard admin).\n\n**EN** — Real-time global KPIs + stored history (admin dashboard).",
)
async def get_global_kpi(user=Depends(require_roles("admin"))) -> list[KpiOut]:
    return await service.get_global_kpi()


@router.get(
    "/partner",
    response_model=list[KpiOut],
    responses=AUTH_RESPONSES,
    summary="Partner KPIs / KPI du partenaire",
    description="**FR** — KPI du partenaire connecté (historique stocké).\n\n**EN** — Connected partner's KPIs (stored history).",
)
async def get_partner_kpi(user=Depends(require_roles("partner"))) -> list[KpiOut]:
    if user.partner_id is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compte non associé à un partenaire / Account not linked to a partner.",
        )
    return await service.get_partner_kpi(user.partner_id)
