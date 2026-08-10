"""Logique metier du module ussd. / Business logic for the ussd module."""

from app.core.exceptions import not_implemented
from app.db.repositories.ussd_repository import (
    CountryRepository,
    OperatorRepository,
    UssdActionRepository,
)

_countries = CountryRepository()
_operators = OperatorRepository()
_actions = UssdActionRepository()


async def list_countries():
    raise not_implemented()


async def create_country(payload):
    raise not_implemented()


async def update_country(country_id: str, payload):
    raise not_implemented()


async def delete_country(country_id: str):
    raise not_implemented()


async def list_operators(country_id: str):
    raise not_implemented()


async def create_operator(payload):
    raise not_implemented()


async def update_operator(operator_id: str, payload):
    raise not_implemented()


async def delete_operator(operator_id: str):
    raise not_implemented()


async def list_ussd_actions(operator_id: str):
    raise not_implemented()


async def create_ussd_action(payload):
    raise not_implemented()


async def update_ussd_action(action_id: str, payload):
    raise not_implemented()


async def delete_ussd_action(action_id: str):
    raise not_implemented()
