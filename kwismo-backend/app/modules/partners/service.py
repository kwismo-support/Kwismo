"""Logique metier du module partners. / Business logic for the partners module.

FR — Le filtrage par perimetre (cloisonnement partenaire) passe par
affiliation.py, jamais par un filtre ad hoc dans une route.
EN — Scope filtering (partner data scoping) goes through affiliation.py,
never through an ad hoc filter in a route.
"""

from app.core.exceptions import not_implemented
from app.db.repositories.partner_repository import PartnerRepository

_partners = PartnerRepository()


async def list_partners():
    raise not_implemented()


async def create_partner(payload):
    raise not_implemented()


async def get_partner(partner_id: str):
    raise not_implemented()


async def list_affiliation_rules(partner_id: str):
    raise not_implemented()


async def add_affiliation_rule(partner_id: str, payload):
    raise not_implemented()


async def get_partner_scope_numbers(partner_id: str):
    raise not_implemented()


async def get_partner_scope_users(partner_id: str):
    raise not_implemented()


async def get_partner_scope_kpi(partner_id: str):
    raise not_implemented()
