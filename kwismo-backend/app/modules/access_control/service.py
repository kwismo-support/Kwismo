"""Logique metier du module access_control. / Business logic for the access_control module."""

from app.core.exceptions import not_implemented


async def list_roles():
    raise not_implemented()


async def create_role(payload):
    raise not_implemented()


async def list_access_rights():
    raise not_implemented()


async def create_access_right(payload):
    raise not_implemented()
