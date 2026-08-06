"""Schemas Pydantic du module surveys. / Pydantic schemas for the surveys module.

Tables Prisma : Survey, SurveyResponse. / Prisma tables: Survey, SurveyResponse.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class SurveyOut(BaseModel):
    """Table Survey. / Survey table."""

    id: str
    question: str
    actif: bool


class SurveyAnswerIn(BaseModel):
    reponse: str = Field(..., examples=["Oui, plusieurs fois par mois."])


class SurveyResponseOut(BaseModel):
    """Table SurveyResponse. / SurveyResponse table."""

    id: str
    survey_id: str
    reponse: str
    date_reponse: datetime
