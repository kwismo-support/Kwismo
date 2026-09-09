"""Fixtures pytest partagees. / Shared pytest fixtures.

FR — `client` demarre l'app (lifespan inclus, donc connecte Prisma). Utilise
la base pointee par DATABASE_URL (.env) ; a isoler sur une base dediee aux
tests quand les premieres routes seront implementees.
EN — `client` starts the app (lifespan included, so it connects Prisma).
Uses the database pointed to by DATABASE_URL (.env); isolate it to a
dedicated test database once the first routes are implemented.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    with TestClient(app, base_url="http://testserver/api/v1") as test_client:
        yield test_client
