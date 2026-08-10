"""Logique metier du module whatsapp_alert. / Business logic for the whatsapp_alert module."""

from app.core.exceptions import not_implemented


async def declare_whatsapp_incident(user_id: str, payload):
    raise not_implemented()


async def broadcast_whatsapp_alert(user_id: str, payload):
    raise not_implemented()
