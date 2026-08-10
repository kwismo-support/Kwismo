"""Logique metier du module auth. / Business logic for the auth module.

Une fonction par route de router.py, meme nom. / One function per router.py route, same name.
"""

from app.core.exceptions import not_implemented
from app.db.repositories.user_repository import UserRepository

_users = UserRepository()


async def register(payload):
    raise not_implemented()


async def verify_email(payload):
    raise not_implemented()


async def resend_email_otp(payload):
    raise not_implemented()


async def login(payload):
    raise not_implemented()


async def verify_device(payload):
    raise not_implemented()


async def refresh(payload):
    raise not_implemented()


async def forgot_password(payload):
    raise not_implemented()


async def reset_password(payload):
    raise not_implemented()


async def logout(payload):
    raise not_implemented()
