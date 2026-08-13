"""Logique metier du module ussd. / Business logic for the ussd module."""

import logging

from fastapi import HTTPException, status

from app.core.cache import get_cached, invalidate_cache, invalidate_pattern
from app.db.prisma_client import db
from app.modules.ussd.schemas import (
    CountryIn,
    CountryOut,
    OperatorIn,
    OperatorOut,
    OperatorPrefixOut,
    UssdActionIn,
    UssdActionOut,
)
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _country_out(c) -> CountryOut:
    return CountryOut(
        id=c.id,
        nom=c.nom,
        code_pays=c.codePays,
        est_par_defaut=c.estParDefaut,
    )


def _operator_out(op) -> OperatorOut:
    prefixes = [
        OperatorPrefixOut(id=p.id, prefixe=p.prefixe)
        for p in (op.prefixes or [])
    ]
    return OperatorOut(
        id=op.id,
        nom=op.nom,
        country_id=op.countryId,
        prefixes=prefixes,
    )


def _action_out(a) -> UssdActionOut:
    return UssdActionOut(
        id=a.id,
        operator_id=a.operatorId,
        nom_action=a.nomAction,
        code_ussd=a.codeUSSD,
        format=a.format,
    )


# ---------------------------------------------------------------------------
# Countries
# ---------------------------------------------------------------------------

async def list_countries() -> list[CountryOut]:
    async def _fetch():
        countries = await db.country.find_many(order={"nom": "asc"})
        return [_country_out(c).__dict__ for c in countries]
    
    cached = await get_cached("countries:all", _fetch, ttl=3600)
    return [CountryOut(**c) for c in cached]


async def create_country(payload: CountryIn, lang: str = "fr") -> CountryOut:
    existing = await db.country.find_unique(where={"codePays": payload.code_pays})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("country_dial_code_exists", lang),
        )
    if payload.est_par_defaut:
        await db.country.update_many(where={"estParDefaut": True}, data={"estParDefaut": False})
    country = await db.country.create(
        data={"nom": payload.nom, "codePays": payload.code_pays, "estParDefaut": payload.est_par_defaut}
    )
    await invalidate_cache("countries:all")
    return _country_out(country)


async def update_country(country_id: str, payload: CountryIn, lang: str = "fr") -> CountryOut:
    country = await db.country.find_unique(where={"id": country_id})
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("country_not_found", lang))
    if payload.est_par_defaut:
        await db.country.update_many(where={"estParDefaut": True}, data={"estParDefaut": False})
    country = await db.country.update(
        where={"id": country_id},
        data={"nom": payload.nom, "codePays": payload.code_pays, "estParDefaut": payload.est_par_defaut},
    )
    await invalidate_cache("countries:all")
    return _country_out(country)


async def delete_country(country_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    country = await db.country.find_unique(where={"id": country_id})
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("country_not_found", lang))
    await db.country.delete(where={"id": country_id})
    await invalidate_cache("countries:all")
    await invalidate_pattern("operators:*")
    return Message(message_fr=t("country_deleted", "fr"), message_en=t("country_deleted", "en"))


# ---------------------------------------------------------------------------
# Operators
# ---------------------------------------------------------------------------

async def list_operators(country_id: str, lang: str = "fr") -> list[OperatorOut]:
    country = await db.country.find_unique(where={"id": country_id})
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("country_not_found", lang))

    async def _fetch():
        operators = await db.operator.find_many(
            where={"countryId": country_id},
            include={"prefixes": True},
            order={"nom": "asc"},
        )
        return [_operator_out(op).__dict__ for op in operators]

    cached = await get_cached(f"operators:country:{country_id}", _fetch, ttl=3600)
    return [OperatorOut(**op) for op in cached]


async def create_operator(payload: OperatorIn, lang: str = "fr") -> OperatorOut:
    country = await db.country.find_unique(where={"id": payload.country_id})
    if country is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=t("country_not_found", lang))

    op = await db.operator.create(data={"nom": payload.nom, "countryId": payload.country_id})
    for p in payload.prefixes:
        await db.operatorprefix.create(data={"operatorId": op.id, "prefixe": p})

    op = await db.operator.find_unique(where={"id": op.id}, include={"prefixes": True})
    await invalidate_cache(f"operators:country:{payload.country_id}")
    return _operator_out(op)


async def update_operator(operator_id: str, payload: OperatorIn, lang: str = "fr") -> OperatorOut:
    op = await db.operator.find_unique(where={"id": operator_id})
    if op is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("operator_not_found", lang))

    old_country_id = op.countryId
    await db.operator.update(where={"id": operator_id}, data={"nom": payload.nom, "countryId": payload.country_id})
    await db.operatorprefix.delete_many(where={"operatorId": operator_id})
    for p in payload.prefixes:
        await db.operatorprefix.create(data={"operatorId": operator_id, "prefixe": p})

    op = await db.operator.find_unique(where={"id": operator_id}, include={"prefixes": True})
    await invalidate_cache(f"operators:country:{old_country_id}")
    await invalidate_cache(f"operators:country:{payload.country_id}")
    await invalidate_pattern(f"ussd:operator:{operator_id}*")
    return _operator_out(op)


async def delete_operator(operator_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    op = await db.operator.find_unique(where={"id": operator_id})
    if op is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("operator_not_found", lang))
    country_id = op.countryId
    await db.operator.delete(where={"id": operator_id})
    await invalidate_cache(f"operators:country:{country_id}")
    await invalidate_pattern(f"ussd:operator:{operator_id}*")
    return Message(message_fr=t("operator_deleted", "fr"), message_en=t("operator_deleted", "en"))


# ---------------------------------------------------------------------------
# USSD actions
# ---------------------------------------------------------------------------

async def list_ussd_actions(operator_id: str, lang: str = "fr") -> list[UssdActionOut]:
    op = await db.operator.find_unique(where={"id": operator_id})
    if op is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("operator_not_found", lang))

    async def _fetch():
        actions = await db.ussdaction.find_many(
            where={"operatorId": operator_id},
            order={"nomAction": "asc"},
        )
        return [_action_out(a).__dict__ for a in actions]

    cached = await get_cached(f"ussd:operator:{operator_id}", _fetch, ttl=3600)
    return [UssdActionOut(**a) for a in cached]


async def create_ussd_action(payload: UssdActionIn, lang: str = "fr") -> UssdActionOut:
    op = await db.operator.find_unique(where={"id": payload.operator_id})
    if op is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=t("operator_not_found", lang))
    action = await db.ussdaction.create(
        data={
            "operatorId": payload.operator_id,
            "nomAction": payload.nom_action,
            "codeUSSD": payload.code_ussd,
            "format": payload.format,
        }
    )
    await invalidate_cache(f"ussd:operator:{payload.operator_id}")
    return _action_out(action)


async def update_ussd_action(action_id: str, payload: UssdActionIn, lang: str = "fr") -> UssdActionOut:
    action = await db.ussdaction.find_unique(where={"id": action_id})
    if action is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("ussd_action_not_found_404", lang))
    old_operator_id = action.operatorId
    action = await db.ussdaction.update(
        where={"id": action_id},
        data={
            "operatorId": payload.operator_id,
            "nomAction": payload.nom_action,
            "codeUSSD": payload.code_ussd,
            "format": payload.format,
        },
    )
    await invalidate_cache(f"ussd:operator:{old_operator_id}")
    await invalidate_cache(f"ussd:operator:{payload.operator_id}")
    return _action_out(action)


async def delete_ussd_action(action_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    action = await db.ussdaction.find_unique(where={"id": action_id})
    if action is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("ussd_action_not_found_404", lang))
    operator_id = action.operatorId
    await db.ussdaction.delete(where={"id": action_id})
    await invalidate_cache(f"ussd:operator:{operator_id}")
    return Message(message_fr=t("ussd_action_deleted", "fr"), message_en=t("ussd_action_deleted", "en"))
