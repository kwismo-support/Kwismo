"""Logique metier du module users. / Business logic for the users module."""

from app.core.exceptions import not_implemented
from app.db.repositories.user_repository import UserRepository

_users = UserRepository()


async def get_me(user_id: str):
    raise not_implemented()


async def update_me(user_id: str, payload):
    raise not_implemented()


async def list_users(page: int, page_size: int):
    raise not_implemented()


async def get_user(user_id: str):
    raise not_implemented()


async def set_user_status(user_id: str, payload):
    raise not_implemented()
