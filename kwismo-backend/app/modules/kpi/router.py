"""Routes /kpi/*. / KPI routes."""

from fastapi import APIRouter, Depends

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES
from app.modules.kpi.schemas import KpiOut

router = APIRouter(prefix="/kpi", tags=["KPI"])


@router.get(
    "/global",
    response_model=list[KpiOut],
    responses=AUTH_RESPONSES,
    summary="Global KPIs / KPI globaux",
    description="**FR** — KPI globaux (dashboard admin).\n\n**EN** — Global KPIs (admin dashboard).",
)
async def get_global_kpi(user=Depends(require_roles("admin"))) -> list[KpiOut]:
    raise not_implemented()


@router.get(
    "/partner",
    response_model=list[KpiOut],
    responses=AUTH_RESPONSES,
    summary="Partner KPIs / KPI du partenaire",
    description="**FR** — KPI du partenaire connecté.\n\n**EN** — The connected partner's KPIs.",
)
async def get_partner_kpi(user=Depends(require_roles("partner"))) -> list[KpiOut]:
    raise not_implemented()
