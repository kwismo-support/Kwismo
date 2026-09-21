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

import asyncio
import logging

from prisma import Prisma

logger = logging.getLogger("kwismo.backend")

db = Prisma()


async def connect_db() -> None:
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if db.is_connected():
        engine = getattr(db, "_engine", None)
        engine_loop = getattr(engine, "_loop", None)
        if engine_loop and current_loop and (engine_loop != current_loop or engine_loop.is_closed()):
            try:
                await db.disconnect()
            except Exception:
                pass
            finally:
                db._engine = None

    if not db.is_connected():
        try:
            await db.connect()
            logger.info("Base de donnees connectee (%s).", db.__class__.__name__)
        except Exception:
            try:
                await db.disconnect()
            except Exception:
                pass
            finally:
                db._engine = None
            await db.connect()


async def disconnect_db() -> None:
    if db.is_connected():
        try:
            await db.disconnect()
        except Exception:
            pass
        finally:
            db._engine = None
        logger.info("Base de donnees deconnectee.")


