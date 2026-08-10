"""Logique metier du module contacts. / Business logic for the contacts module."""

from app.core.exceptions import not_implemented


async def list_contacts(user_id: str):
    raise not_implemented()


async def add_contact(user_id: str, payload):
    raise not_implemented()


async def refresh_contact(user_id: str, contact_id: str):
    raise not_implemented()


async def remove_contact(user_id: str, contact_id: str):
    raise not_implemented()
