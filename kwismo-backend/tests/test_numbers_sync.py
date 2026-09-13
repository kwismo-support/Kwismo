"""Tests de la route de synchronisation delta /numbers/sync."""

from fastapi.testclient import TestClient


def test_sync_numbers_requires_auth(client: TestClient) -> None:
    response = client.get("/numbers/sync")
    assert response.status_code == 401
