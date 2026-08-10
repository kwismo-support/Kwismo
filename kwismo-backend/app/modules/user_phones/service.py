"""Logique metier du module user_phones. / Business logic for the user_phones module."""

from app.core.exceptions import not_implemented
from app.db.repositories.user_repository import UserRepository

_users = UserRepository()


async def list_my_phones(user_id: str):
    raise not_implemented()


async def add_my_phone(user_id: str, payload):
    raise not_implemented()


async def verify_my_phone(user_id: str, phone_id: str, payload):
    raise not_implemented()


async def resend_my_phone_otp(user_id: str, phone_id: str):
    raise not_implemented()


async def remove_my_phone(user_id: str, phone_id: str):
    raise not_implemented()


async def declare_my_phone_compromised(user_id: str, phone_id: str):
    raise not_implemented()
