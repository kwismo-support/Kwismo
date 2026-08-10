"""Cree un compte administrateur. / Creates an administrator account.

Usage: python scripts/create_admin.py <email> <mot_de_passe> <nom> <prenom>
"""

import asyncio
import sys

from argon2 import PasswordHasher

from app.db.prisma_client import connect_db, db, disconnect_db

_hasher = PasswordHasher()


async def create_admin(email: str, mot_de_passe: str, nom: str, prenom: str) -> None:
    role = await db.role.upsert(
        where={"nomRole": "admin"},
        data={"create": {"nomRole": "admin"}, "update": {}},
    )
    await db.user.create(
        data={
            "email": email,
            "motDePasse": _hasher.hash(mot_de_passe),
            "nom": nom,
            "prenom": prenom,
            "emailVerifie": True,
            "roleId": role.id,
        }
    )
    print(f"Admin cree : {email}")


async def main() -> None:
    if len(sys.argv) != 5:
        print("Usage: python scripts/create_admin.py <email> <mot_de_passe> <nom> <prenom>")
        raise SystemExit(1)
    await connect_db()
    try:
        await create_admin(*sys.argv[1:5])
    finally:
        await disconnect_db()


if __name__ == "__main__":
    asyncio.run(main())
