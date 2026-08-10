"""Routes /partners/*, /partner/scope/*. / Partner routes.

FR — Le cloisonnement des donnees partenaire est applique cote serveur : un
partner ne voit que son perimetre (regles d'affiliation) ; un admin peut
tout consulter en mode supervision.
EN — Partner data scoping is enforced server-side: a partner only sees
their own scope (affiliation rules); an admin can view everything.
"""

from fastapi import APIRouter, Depends, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE, Page
from app.modules.partners.schemas import (
    AffiliationRuleCreateIn,
    AffiliationRuleOut,
    PartnerCreateIn,
    PartnerDetailOut,
    PartnerOut,
    PartnerScopeKpiOut,
    PartnerScopeNumberOut,
    PartnerScopeUserOut,
)

router = APIRouter(tags=["Partners"])


@router.get(
    "/partners",
    response_model=Page[PartnerOut],
    responses=AUTH_RESPONSES,
    summary="List partners / Lister les partenaires",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def list_partners(user=Depends(require_roles("admin"))) -> Page[PartnerOut]:
    raise not_implemented()


@router.post(
    "/partners",
    response_model=PartnerOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Create a partner / Créer un partenaire",
    description="**FR** — Réservé admin.\n\n**EN** — Admin only.",
)
async def create_partner(payload: PartnerCreateIn, user=Depends(require_roles("admin"))) -> PartnerOut:
    raise not_implemented()


@router.get(
    "/partners/{partner_id}",
    response_model=PartnerDetailOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Get a partner's detail / Fiche partenaire",
    description="**FR** — Fiche partenaire + KPI.\n\n**EN** — Partner sheet + KPIs.",
)
async def get_partner(partner_id: str, user=Depends(require_roles("admin"))) -> PartnerDetailOut:
    raise not_implemented()


@router.get(
    "/partners/{partner_id}/affiliation-rules",
    response_model=list[AffiliationRuleOut],
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="List affiliation rules / Règles d'affiliation",
    description="**FR** — Règles d'affiliation (pays + préfixes).\n\n**EN** — Affiliation rules (country + prefixes).",
)
async def list_affiliation_rules(
    partner_id: str, user=Depends(require_roles("admin"))
) -> list[AffiliationRuleOut]:
    raise not_implemented()


@router.post(
    "/partners/{partner_id}/affiliation-rules",
    response_model=AffiliationRuleOut,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Add an affiliation rule / Ajouter une règle d'affiliation",
    description=(
        "**FR** — Ajoute une règle (ex. préfixes 69, 651-654, 68).\n\n"
        "**EN** — Adds a rule (e.g. prefixes 69, 651-654, 68)."
    ),
)
async def add_affiliation_rule(
    partner_id: str, payload: AffiliationRuleCreateIn, user=Depends(require_roles("admin"))
) -> AffiliationRuleOut:
    raise not_implemented()


@router.get(
    "/partner/scope/numbers",
    response_model=Page[PartnerScopeNumberOut],
    responses=AUTH_RESPONSES,
    summary="My scope's numbers / Numéros de mon périmètre",
    description=(
        "**FR** — Numéros correspondant aux règles d'affiliation du partenaire "
        "connecté.\n\n"
        "**EN** — Numbers matching the connected partner's affiliation rules."
    ),
)
async def get_partner_scope_numbers(user=Depends(require_roles("partner"))) -> Page[PartnerScopeNumberOut]:
    raise not_implemented()


@router.get(
    "/partner/scope/users",
    response_model=Page[PartnerScopeUserOut],
    responses=AUTH_RESPONSES,
    summary="My scope's users / Utilisateurs de mon périmètre",
    description="**FR** — Utilisateurs découlant du périmètre.\n\n**EN** — Users derived from the scope.",
)
async def get_partner_scope_users(user=Depends(require_roles("partner"))) -> Page[PartnerScopeUserOut]:
    raise not_implemented()


@router.get(
    "/partner/scope/kpi",
    response_model=list[PartnerScopeKpiOut],
    responses=AUTH_RESPONSES,
    summary="My scope's KPIs / KPI de mon périmètre",
    description="**FR** — KPI limités au périmètre.\n\n**EN** — KPIs limited to the scope.",
)
async def get_partner_scope_kpi(user=Depends(require_roles("partner"))) -> list[PartnerScopeKpiOut]:
    raise not_implemented()
