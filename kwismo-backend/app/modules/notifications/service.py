"""Logique metier du module notifications. / Business logic for the notifications module."""

from app.core.exceptions import not_implemented


async def list_notifications(user_id: str, page: int, page_size: int):
    raise not_implemented()
