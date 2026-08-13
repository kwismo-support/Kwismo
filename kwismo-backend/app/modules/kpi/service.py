"""Logique metier du module kpi. / Business logic for the kpi module."""

import logging

from app.db.prisma_client import db
from app.modules.kpi.schemas import KpiOut

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# get_global_kpi
# ---------------------------------------------------------------------------

async def get_global_kpi() -> list[KpiOut]:
    """Retourne les KPI globaux stockes en base + calcule les indicateurs dynamiques."""
    # KPI stockes en base (portee "global").
    stored = await db.kpi.find_many(
        where={"portee": "global"},
        order=[{"periode": "desc"}, {"nomIndicateur": "asc"}],
    )
    stored_out = [
        KpiOut(
            id=k.id,
            nom_indicateur=k.nomIndicateur,
            valeur=k.valeur,
            periode=k.periode,
            portee=k.portee,
        )
        for k in stored
    ]

    # KPI calcules en temps reel si la base est vide ou pour le complement.
    total_users = await db.user.count()
    total_numeros = await db.numero.count()
    total_reports = await db.report.count()
    total_frauduleux = await db.numero.count(where={"statut": "frauduleux"})
    total_transactions = await db.transaction.count()

    taux_fraude = (total_frauduleux / total_numeros) if total_numeros > 0 else 0.0

    from app.utils.dates import utcnow
    periode = utcnow().strftime("%Y-%m")

    dynamic = [
        KpiOut(id="dyn_users", nom_indicateur="total_utilisateurs", valeur=float(total_users), periode=periode, portee="global"),
        KpiOut(id="dyn_numeros", nom_indicateur="total_numeros_analyses", valeur=float(total_numeros), periode=periode, portee="global"),
        KpiOut(id="dyn_reports", nom_indicateur="total_signalements", valeur=float(total_reports), periode=periode, portee="global"),
        KpiOut(id="dyn_fraude", nom_indicateur="taux_fraude_detectee", valeur=round(taux_fraude, 4), periode=periode, portee="global"),
        KpiOut(id="dyn_tx", nom_indicateur="total_transferts_proteges", valeur=float(total_transactions), periode=periode, portee="global"),
    ]

    return stored_out + dynamic


# ---------------------------------------------------------------------------
# get_partner_kpi
# ---------------------------------------------------------------------------

async def get_partner_kpi(partner_id: str) -> list[KpiOut]:
    """Retourne les KPI du partenaire connecte."""
    stored = await db.kpi.find_many(
        where={"portee": "partner", "partnerId": partner_id},
        order=[{"periode": "desc"}, {"nomIndicateur": "asc"}],
    )
    return [
        KpiOut(
            id=k.id,
            nom_indicateur=k.nomIndicateur,
            valeur=k.valeur,
            periode=k.periode,
            portee=k.portee,
        )
        for k in stored
    ]
