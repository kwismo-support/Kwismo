"""Synchronise le connecteur Prisma (prisma/schema.prisma) avec DB_TYPE (.env).

Usage
-----
    python scripts/sync_db_provider.py [--generate]

    --generate   Lance aussi `prisma generate` une fois le schema mis a jour.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

from dotenv import dotenv_values

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"
SCHEMA_FILE = BACKEND_DIR / "prisma" / "schema.prisma"

# DB_TYPE (.env) -> provider Prisma (schema.prisma)
PROVIDERS = {
    "sqlite": "sqlite",
    "postgresql": "postgresql",
    "postgres": "postgresql",  # alias tolere
    "mysql": "mysql",
}

# Capture la valeur du provider a l'interieur du bloc `datasource db { ... }`
DATASOURCE_PROVIDER_RE = re.compile(
    r'(datasource\s+db\s*\{[^}]*?provider\s*=\s*")[a-z]+(")',
    re.DOTALL,
)


def read_db_type() -> str:
    db_type = (os.getenv("DB_TYPE") or dotenv_values(ENV_FILE).get("DB_TYPE") or "sqlite").strip().lower()
    if db_type not in PROVIDERS:
        allowed = ", ".join(sorted(set(PROVIDERS) - {"postgres"}))
        raise SystemExit(
            f"DB_TYPE='{db_type}' invalide. Valeurs acceptees : {allowed}."
        )
    return db_type


def sync(db_type: str) -> bool:
    """Reecrit le provider dans schema.prisma. Retourne True si modifie."""
    target_provider = PROVIDERS[db_type]
    schema_text = SCHEMA_FILE.read_text(encoding="utf-8")

    match = DATASOURCE_PROVIDER_RE.search(schema_text)
    if match is None:
        raise SystemExit(f"Bloc datasource introuvable dans {SCHEMA_FILE}.")
    current_provider = match.group(0).split('"')[1]

    if current_provider == target_provider:
        print(f"Deja sur '{target_provider}' — rien a faire.")
        return False

    new_schema_text = DATASOURCE_PROVIDER_RE.sub(
        rf'\g<1>{target_provider}\g<2>', schema_text, count=1
    )
    SCHEMA_FILE.write_text(new_schema_text, encoding="utf-8")

    print(f"provider : '{current_provider}' -> '{target_provider}' ({SCHEMA_FILE})")
    print("Relance `prisma migrate dev` pour appliquer le schema sur cette base.")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--generate",
        action="store_true",
        help="Lance `prisma generate` juste apres avoir mis a jour le schema.",
    )
    args = parser.parse_args()

    db_type = read_db_type()
    changed = sync(db_type)

    if args.generate and changed:
        print("Lancement de `prisma generate`...")
        subprocess.run([sys.executable, "-m", "prisma", "generate"], cwd=BACKEND_DIR, check=True)


if __name__ == "__main__":
    main()
