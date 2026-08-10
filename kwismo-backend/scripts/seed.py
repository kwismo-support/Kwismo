"""Peuple la base : roles, pays, operateurs, actions USSD. / Seeds the database: roles, countries, operators, USSD actions.

Usage: python scripts/seed.py
"""

import asyncio
import json
from pathlib import Path

from app.db.prisma_client import connect_db, db, disconnect_db

SEED_DIR = Path(__file__).resolve().parent.parent / "prisma" / "seed_data"
DEFAULT_ROLES = ["user", "partner", "admin"]


async def seed_roles() -> None:
    for nom_role in DEFAULT_ROLES:
        await db.role.upsert(
            where={"nomRole": nom_role},
            data={"create": {"nomRole": nom_role}, "update": {}},
        )


async def seed_countries() -> dict[str, str]:
    countries = json.loads((SEED_DIR / "countries.json").read_text(encoding="utf-8"))
    ids: dict[str, str] = {}
    for c in countries:
        country = await db.country.upsert(
            where={"codePays": c["code_pays"]},
            data={
                "create": {
                    "nom": c["nom"],
                    "codePays": c["code_pays"],
                    "estParDefaut": c["est_par_defaut"],
                },
                "update": {},
            },
        )
        ids[c["code_pays"]] = country.id
    return ids


async def seed_operators(country_ids: dict[str, str]) -> dict[str, str]:
    operators = json.loads((SEED_DIR / "operators.json").read_text(encoding="utf-8"))
    ids: dict[str, str] = {}
    for o in operators:
        country_id = country_ids[o["country_code_pays"]]
        operator = await db.operator.create(data={"nom": o["nom"], "countryId": country_id})
        for prefixe in o["prefixes"]:
            await db.operatorprefix.create(data={"operatorId": operator.id, "prefixe": prefixe})
        ids[o["nom"]] = operator.id
    return ids


async def seed_ussd_actions(operator_ids: dict[str, str]) -> None:
    actions = json.loads((SEED_DIR / "ussd_actions.json").read_text(encoding="utf-8"))
    for a in actions:
        await db.ussdaction.create(
            data={
                "operatorId": operator_ids[a["operator_nom"]],
                "nomAction": a["nom_action"],
                "codeUSSD": a["code_ussd"],
                "format": a["format"],
            }
        )


async def main() -> None:
    await connect_db()
    try:
        await seed_roles()
        country_ids = await seed_countries()
        operator_ids = await seed_operators(country_ids)
        await seed_ussd_actions(operator_ids)
        print("Seed termine.")
    finally:
        await disconnect_db()


if __name__ == "__main__":
    asyncio.run(main())
