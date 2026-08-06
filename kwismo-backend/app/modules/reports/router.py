"""Routes /reports/*. / /reports/* routes. Cf. cahier des charges Backend §5.5."""

from fastapi import APIRouter, Depends, Query, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.reports.schemas import ReportCreateIn, ReportOut, ReportValidateIn

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create a report / Créer un signalement",
    description="**FR** — Crée un signalement (motif + numéro).\n\n**EN** — Creates a report (reason + number).",
)
async def create_report(payload: ReportCreateIn, user=Depends(require_roles("user"))) -> ReportOut:
    raise not_implemented()


@router.get(
    "",
    response_model=Page[ReportOut],
    responses=AUTH_RESPONSES,
    summary="List reports / Lister les signalements",
    description=(
        "**FR** — Liste des signalements ; périmètre restreint côté serveur pour un "
        "`partner`.\n\n"
        "**EN** — List of reports; server-side scoped for a `partner`."
    ),
)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user=Depends(require_roles("admin", "partner")),
) -> Page[ReportOut]:
    raise not_implemented()


@router.patch(
    "/{report_id}/validate",
    response_model=ReportOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Validate/close a report / Valider ou clore un signalement",
    description="**FR** — Valide ou clôt un signalement.\n\n**EN** — Validates or closes a report.",
)
async def validate_report(
    report_id: str, payload: ReportValidateIn, user=Depends(require_roles("admin"))
) -> ReportOut:
    raise not_implemented()
