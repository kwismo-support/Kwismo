"""Logique metier du module surveys. / Business logic for the surveys module."""

from app.core.exceptions import not_implemented


async def get_active_surveys(user_id: str):
    raise not_implemented()


async def answer_survey(user_id: str, survey_id: str, payload):
    raise not_implemented()
