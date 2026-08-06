"""Instance Prisma partagee (connexion/deconnexion). / Shared Prisma instance (connect/disconnect).

FR — Point d'entree UNIQUE vers la base de donnees. Peu importe le
DB_TYPE/DATABASE_URL actif (sqlite/postgresql/mysql, cf. scripts/sync_db_provider.py) :
ce module ne change jamais, car Prisma Client Python expose la MEME API quel
que soit le connecteur. C'est cette uniformite qui garantit la portabilite —
tant que le code passe par `db` ci-dessous (et jamais par du SQL brut), il
fonctionne sur n'importe laquelle des bases supportees.
EN — SINGLE entry point to the database. Whatever DB_TYPE/DATABASE_URL is
active (sqlite/postgresql/mysql, see scripts/sync_db_provider.py), this
module never changes, because Prisma Client Python exposes the SAME API
regardless of the connector. That uniformity is what guarantees
portability — as long as code goes through `db` below (and never through
raw SQL), it works on any of the supported databases.
"""

import logging

from prisma import Prisma

logger = logging.getLogger("kwismo.backend")

db = Prisma()


async def connect_db() -> None:
    if not db.is_connected():
        await db.connect()
        logger.info("Base de donnees connectee (%s).", db.__class__.__name__)


async def disconnect_db() -> None:
    if db.is_connected():
        await db.disconnect()
        logger.info("Base de donnees deconnectee.")
