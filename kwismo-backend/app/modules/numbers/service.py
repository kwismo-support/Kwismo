"""Logique metier du module numbers. / Business logic for the numbers module.

FR — Appelle fallback_rules directement (l'IA sera branchee plus tard).
EN — Calls fallback_rules directly (AI will be wired later).
"""

import logging

from fastapi import HTTPException, status

from app.core.cache import get_cached, invalidate_cache
from app.db.prisma_client import db
from app.db.repositories.number_repository import NumberRepository
from app.modules.ai_gateway.fallback_rules import score_number_fallback
from app.modules.numbers.schemas import (
    NumberBatchVerifyIn,
    NumberDetailOut,
    NumberOut,
    NumberStatusIn,
    NumberVerifyIn,
)
from app.utils.dates import utcnow
from app.utils.i18n import t
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")
_numbers = NumberRepository()

VALID_STATUTS = {"securise", "a_signaler", "frauduleux", "unknown"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_out(n) -> NumberOut:
    raw = n.scoreRisque or 0.0
    score = min(1.0, max(0.0, raw / 100.0 if raw > 1.0 else raw))
    return NumberOut(
        id=n.id,
        valeur=n.valeur,
        score_risque=score,
        statut=n.statut,
        date_derniere_verification=n.dateDerniereVerification,
        country_id=n.countryId,
        operator_id=n.operatorId,
    )


def _to_detail_out(n, nombre_signalements: int) -> NumberDetailOut:
    raw = n.scoreRisque or 0.0
    score = min(1.0, max(0.0, raw / 100.0 if raw > 1.0 else raw))
    return NumberDetailOut(
        id=n.id,
        valeur=n.valeur,
        score_risque=score,
        statut=n.statut,
        date_derniere_verification=n.dateDerniereVerification,
        country_id=n.countryId,
        operator_id=n.operatorId,
        created_at=n.createdAt,
        updated_at=n.updatedAt,
        nombre_signalements=nombre_signalements,
    )


async def _statut_from_score(score: float) -> str:
    from app.modules.settings.service import evaluate_risk_status
    return await evaluate_risk_status(score)


async def _score_and_upsert(valeur: str, country_id: str | None = None) -> NumberOut:
    """Evalue le score du numero (fallback rules) et upsert dans Numero."""
    # Detecter le pays et l'operateur si non fournis via cache.
    resolved_country_id = country_id
    resolved_operator_id: str | None = None

    if resolved_country_id is None:
        async def _fetch_countries():
            countries = await db.country.find_many()
            return [{"id": c.id, "codePays": c.codePays} for c in countries]
        
        countries = await get_cached("countries:lookup", _fetch_countries, ttl=3600)
        for c in countries:
            if valeur.startswith(c["codePays"]):
                resolved_country_id = c["id"]
                break

        # Fallback to the default country (estParDefaut = True, e.g. Cameroon).
        if resolved_country_id is None:
            default_country = await db.country.find_first(where={"estParDefaut": True})
            if default_country is not None:
                resolved_country_id = default_country.id

    if resolved_country_id:
        async def _fetch_operators():
            operators = await db.operator.find_many(
                where={"countryId": resolved_country_id},
                include={"prefixes": True},
            )
            result = []
            for op in operators:
                prefixes = [p.prefixe for p in (op.prefixes or [])]
                result.append({"id": op.id, "prefixes": prefixes})
            return result

        operators = await get_cached(f"operators:lookup:{resolved_country_id}", _fetch_operators, ttl=3600)
        
        country_obj = await db.country.find_unique(where={"id": resolved_country_id})
        local = valeur
        if country_obj and valeur.startswith(country_obj.codePays):
            local = valeur[len(country_obj.codePays):]
        
        for op in operators:
            for prefix in op["prefixes"]:
                if local.startswith(prefix):
                    resolved_operator_id = op["id"]
                    break
            if resolved_operator_id:
                break

    existing = await db.numero.find_unique(where={"valeur": valeur})
    if existing:
        nombre_signalements = await db.report.count(where={"numeroId": existing.id})
    else:
        nombre_signalements = 0
    
    coherence_ok = True
    if resolved_country_id:
        country = await db.country.find_unique(where={"id": resolved_country_id})
        if country and not valeur.startswith(country.codePays):
            coherence_ok = False

    prediction = score_number_fallback(nombre_signalements, coherence_ok)
    statut = await _statut_from_score(prediction.score_risque)
    now = utcnow()

    # Upsert dans le registre Numero.
    if existing:
        numero = await db.numero.update(
            where={"valeur": valeur},
            data={
                "scoreRisque": prediction.score_risque,
                "statut": statut,
                "dateDerniereVerification": now,
                "countryId": resolved_country_id,
                "operatorId": resolved_operator_id,
            },
        )
    else:
        numero = await db.numero.create(
            data={
                "valeur": valeur,
                "scoreRisque": prediction.score_risque,
                "statut": statut,
                "dateDerniereVerification": now,
                "countryId": resolved_country_id,
                "operatorId": resolved_operator_id,
            }
        )
    return _to_out(numero)


# ---------------------------------------------------------------------------
# verify_number
# ---------------------------------------------------------------------------

async def verify_number(payload: NumberVerifyIn, lang: str = "fr") -> NumberOut:
    valeur = normalize_phone(payload.valeur)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("invalid_phone_format", lang),
        )
    return await _score_and_upsert(valeur, payload.country_id)


# ---------------------------------------------------------------------------
# batch_verify_numbers
# ---------------------------------------------------------------------------

async def batch_verify_numbers(payload: NumberBatchVerifyIn) -> list[NumberOut]:
    import asyncio

    async def _verify_one(raw: str) -> NumberOut:
        valeur = normalize_phone(raw)
        if not is_valid_phone(valeur):
            return NumberOut(
                id="invalid",
                valeur=raw,
                score_risque=0.0,
                statut="unknown",
            )
        try:
            return await _score_and_upsert(valeur)
        except Exception as exc:
            logger.warning("Erreur lors de la verification de %s : %s", raw, exc)
            return NumberOut(id="error", valeur=raw, score_risque=0.0, statut="unknown")

    results = await asyncio.gather(*[_verify_one(raw) for raw in payload.numeros])
    return list(results)


# ---------------------------------------------------------------------------
# list_numbers
# ---------------------------------------------------------------------------

async def list_numbers(
    page: int,
    page_size: int,
    statut: str | None,
    country_id: str | None,
    operator_id: str | None,
):
    from app.core.schemas import Page

    where: dict = {}
    if statut:
        where["statut"] = statut
    if country_id:
        where["countryId"] = country_id
    if operator_id:
        where["operatorId"] = operator_id

    skip = (page - 1) * page_size
    total = await db.numero.count(where=where)
    items = await db.numero.find_many(
        where=where,
        skip=skip,
        take=page_size,
        order={"updatedAt": "desc"},
    )
    return Page(items=[_to_out(n) for n in items], total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_number
# ---------------------------------------------------------------------------

async def get_number(number_id: str, lang: str = "fr") -> NumberDetailOut:
    numero = await db.numero.find_unique(where={"id": number_id})
    if numero is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("number_not_found", lang))
    nombre_signalements = await db.report.count(where={"numeroId": number_id})
    return _to_detail_out(numero, nombre_signalements)


# ---------------------------------------------------------------------------
# set_number_status
# ---------------------------------------------------------------------------

async def set_number_status(number_id: str, payload: NumberStatusIn, lang: str = "fr") -> NumberDetailOut:
    if payload.statut not in VALID_STATUTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("number_status_invalid", lang),
        )
    numero = await db.numero.find_unique(where={"id": number_id})
    if numero is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("number_not_found", lang))

    if payload.reanalyser:
        # Relancer l'evaluation (fallback rules pour l'instant).
        out = await _score_and_upsert(numero.valeur)
        nombre_signalements = await db.report.count(where={"numeroId": number_id})
        numero = await db.numero.find_unique(where={"id": number_id})
        return _to_detail_out(numero, nombre_signalements)

    # Forcer le statut manuellement.
    numero = await db.numero.update(
        where={"id": number_id},
        data={"statut": payload.statut, "dateDerniereVerification": utcnow()},
    )
    nombre_signalements = await db.report.count(where={"numeroId": number_id})
    return _to_detail_out(numero, nombre_signalements)


async def sync_numbers(since: str | None = None):
    from datetime import datetime
    from app.modules.numbers.schemas import NumberSyncOut
    from app.modules.settings.service import get_threshold_rules

    where: dict = {}
    if since:
        try:
            clean_since = since.strip()
            if clean_since.endswith("Z"):
                clean_since = clean_since[:-1] + "+00:00"
            since_dt = datetime.fromisoformat(clean_since)
            where["updatedAt"] = {"gte": since_dt}
        except Exception as exc:
            logger.warning("Invalid since timestamp format '%s': %s", since, exc)

    numeros = await db.numero.find_many(where=where, take=500, order={"updatedAt": "desc"})
    rules = await get_threshold_rules()

    return NumberSyncOut(
        items=[_to_out(n) for n in numeros],
        threshold_rules=[r.model_dump() for r in rules],
        synced_at=utcnow(),
    )

