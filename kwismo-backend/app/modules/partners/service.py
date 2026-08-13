"""Logique metier du module partners. / Business logic for the partners module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.db.repositories.partner_repository import PartnerRepository
from app.modules.partners.affiliation import is_number_in_partner_scope
from app.modules.partners.schemas import (
    AffiliationRuleCreateIn,
    AffiliationRuleOut,
    AffiliationRulePrefixOut,
    PartnerCreateIn,
    PartnerDetailOut,
    PartnerKpiSummaryOut,
    PartnerOut,
    PartnerScopeKpiOut,
    PartnerScopeNumberOut,
    PartnerScopeUserOut,
)
from app.utils.i18n import t
from app.utils.phone import extract_prefix

logger = logging.getLogger("kwismo.backend")
_partners = PartnerRepository()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _partner_out(p) -> PartnerOut:
    return PartnerOut(
        id=p.id,
        nom_entreprise=p.nomEntreprise,
        type_partenariat=p.typePartenariat,
        date_adhesion=p.dateAdhesion,
    )


def _rule_out(r) -> AffiliationRuleOut:
    prefixes = [AffiliationRulePrefixOut(id=pr.id, prefixe=pr.prefixe) for pr in (r.prefixes or [])]
    return AffiliationRuleOut(
        id=r.id,
        partner_id=r.partnerId,
        country_id=r.countryId,
        prefixes=prefixes,
    )


async def _get_partner_rules(partner_id: str) -> list:
    return await db.affiliationrule.find_many(
        where={"partnerId": partner_id},
        include={"prefixes": True, "country": True},
    )


def _build_prefix_map(rules: list) -> dict[str, list[str]]:
    mapping: dict[str, list[str]] = {}
    for rule in rules:
        if rule.country is None:
            continue
        code = rule.country.codePays
        if code not in mapping:
            mapping[code] = []
        for p in (rule.prefixes or []):
            mapping[code].append(p.prefixe)
    return mapping


# ---------------------------------------------------------------------------
# list_partners
# ---------------------------------------------------------------------------

async def list_partners():
    from app.core.schemas import Page
    total = await db.partner.count()
    items = await db.partner.find_many(order={"dateAdhesion": "desc"})
    return Page(items=[_partner_out(p) for p in items], total=total, page=1, page_size=max(total, 1))


# ---------------------------------------------------------------------------
# create_partner
# ---------------------------------------------------------------------------

async def create_partner(payload: PartnerCreateIn) -> PartnerOut:
    partner = await db.partner.create(
        data={
            "nomEntreprise": payload.nom_entreprise,
            "typePartenariat": payload.type_partenariat,
        }
    )
    return _partner_out(partner)


# ---------------------------------------------------------------------------
# get_partner
# ---------------------------------------------------------------------------

async def get_partner(partner_id: str, lang: str = "fr") -> PartnerDetailOut:
    partner = await db.partner.find_unique(where={"id": partner_id})
    if partner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("partner_not_found", lang),
        )

    rules = await _get_partner_rules(partner_id)
    prefix_map = _build_prefix_map(rules)

    numeros_affilies = 0
    frauduleux_count = 0
    signalements_perimetre = 0

    for country_code, prefixes in prefix_map.items():
        country = await db.country.find_first(where={"codePays": country_code})
        if country is None:
            continue
        # Filtrage DB par countryId — filtrage préfixe en Python (Prisma SQLite sans startsWith)
        numeros = await db.numero.find_many(where={"countryId": country.id})
        numero_ids_in_scope = []
        for n in numeros:
            prefix = extract_prefix(n.valeur, country_code)
            if not is_number_in_partner_scope(prefix, prefixes):
                continue
            numeros_affilies += 1
            if n.statut == "frauduleux":
                frauduleux_count += 1
            numero_ids_in_scope.append(n.id)

        if numero_ids_in_scope:
            # Une seule requête count pour tous les signalements du périmètre pays
            signalements_perimetre += await db.report.count(
                where={"numeroId": {"in": numero_ids_in_scope}}
            )

    taux_fraude = (frauduleux_count / numeros_affilies) if numeros_affilies > 0 else 0.0

    return PartnerDetailOut(
        id=partner.id,
        nom_entreprise=partner.nomEntreprise,
        type_partenariat=partner.typePartenariat,
        date_adhesion=partner.dateAdhesion,
        kpi=PartnerKpiSummaryOut(
            numeros_affilies=numeros_affilies,
            signalements_perimetre=signalements_perimetre,
            taux_fraude_perimetre=round(taux_fraude, 4),
        ),
    )


# ---------------------------------------------------------------------------
# list_affiliation_rules
# ---------------------------------------------------------------------------

async def list_affiliation_rules(partner_id: str, lang: str = "fr") -> list[AffiliationRuleOut]:
    partner = await db.partner.find_unique(where={"id": partner_id})
    if partner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("partner_not_found", lang),
        )
    rules = await db.affiliationrule.find_many(
        where={"partnerId": partner_id},
        include={"prefixes": True},
    )
    return [_rule_out(r) for r in rules]


# ---------------------------------------------------------------------------
# add_affiliation_rule
# ---------------------------------------------------------------------------

async def add_affiliation_rule(partner_id: str, payload: AffiliationRuleCreateIn, lang: str = "fr") -> AffiliationRuleOut:
    partner = await db.partner.find_unique(where={"id": partner_id})
    if partner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("partner_not_found", lang),
        )
    country = await db.country.find_unique(where={"id": payload.country_id})
    if country is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("country_not_found", lang),
        )

    rule = await db.affiliationrule.create(
        data={"partnerId": partner_id, "countryId": payload.country_id}
    )
    for p in payload.prefixes:
        await db.affiliationruleprefix.create(data={"affiliationRuleId": rule.id, "prefixe": p})

    rule = await db.affiliationrule.find_unique(where={"id": rule.id}, include={"prefixes": True})
    return _rule_out(rule)


# ---------------------------------------------------------------------------
# get_partner_scope_numbers
# ---------------------------------------------------------------------------

async def get_partner_scope_numbers(partner_id: str, page: int = 1, page_size: int = 20):
    from app.core.schemas import Page

    rules = await _get_partner_rules(partner_id)
    prefix_map = _build_prefix_map(rules)

    if not prefix_map:
        return Page(items=[], total=0, page=page, page_size=page_size)

    scoped: list[PartnerScopeNumberOut] = []
    for country_code, prefixes in prefix_map.items():
        country = await db.country.find_first(where={"codePays": country_code})
        if country is None:
            continue
        # Filtrage DB par countryId ; filtrage préfixe en Python
        # (Prisma SQLite ne supporte pas startsWith natif sur String).
        numeros = await db.numero.find_many(where={"countryId": country.id})
        for n in numeros:
            prefix = extract_prefix(n.valeur, country_code)
            if is_number_in_partner_scope(prefix, prefixes):
                scoped.append(
                    PartnerScopeNumberOut(
                        id=n.id,
                        valeur=n.valeur,
                        statut=n.statut,
                        score_risque=n.scoreRisque,
                    )
                )

    total = len(scoped)
    start = (page - 1) * page_size
    return Page(items=scoped[start : start + page_size], total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_partner_scope_users
# ---------------------------------------------------------------------------

async def get_partner_scope_users(partner_id: str, page: int = 1, page_size: int = 20):
    from app.core.schemas import Page

    rules = await _get_partner_rules(partner_id)
    prefix_map = _build_prefix_map(rules)

    if not prefix_map:
        return Page(items=[], total=0, page=page, page_size=page_size)

    seen_user_ids: set[str] = set()

    for country_code, prefixes in prefix_map.items():
        country = await db.country.find_first(where={"codePays": country_code})
        if country is None:
            continue
        phones = await db.userphone.find_many(
            where={"countryId": country.id},
            include={"user": True},
        )
        for phone in phones:
            prefix = extract_prefix(phone.valeur, country_code)
            if is_number_in_partner_scope(prefix, prefixes):
                seen_user_ids.add(phone.user.id)

    if not seen_user_ids:
        return Page(items=[], total=0, page=page, page_size=page_size)

    # Une seule requête pour tous les users distincts avec leur _count de phones.
    users_with_count = await db.user.find_many(
        where={"id": {"in": list(seen_user_ids)}},
        include={"_count": {"select": {"phones": True}}},
    )

    items = [
        PartnerScopeUserOut(
            id=u.id,
            nom=u.nom,
            prenom=u.prenom,
            nombre_numeros=u._count.phones if hasattr(u, "_count") and u._count else 0,
        )
        for u in users_with_count
    ]

    total = len(items)
    start = (page - 1) * page_size
    return Page(items=items[start : start + page_size], total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_partner_scope_kpi
# ---------------------------------------------------------------------------

async def get_partner_scope_kpi(partner_id: str) -> list[PartnerScopeKpiOut]:
    kpis = await db.kpi.find_many(
        where={"portee": "partner", "partnerId": partner_id},
        order={"periode": "desc"},
    )
    return [
        PartnerScopeKpiOut(
            nom_indicateur=k.nomIndicateur,
            valeur=k.valeur,
            periode=k.periode,
        )
        for k in kpis
    ]
