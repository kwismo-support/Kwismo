"""Logique metier du module kpi. / Business logic for the kpi module."""

from app.core.exceptions import not_implemented


async def get_global_kpi():
    raise not_implemented()


async def get_partner_kpi(partner_id: str):
    raise not_implemented()
