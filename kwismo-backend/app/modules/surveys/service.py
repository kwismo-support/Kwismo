"""Logique metier du module surveys. / Business logic for the surveys module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.surveys.schemas import SurveyAnswerIn, SurveyOut, SurveyResponseOut
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# get_active_surveys
# ---------------------------------------------------------------------------

async def get_active_surveys(user_id: str) -> list[SurveyOut]:
    """Retourne les enquetes actives auxquelles l'utilisateur n'a pas encore repondu.

    Filtre les reponses existantes cote DB (WHERE NOT IN) pour eviter de
    charger toutes les reponses de l'utilisateur en memoire.
    """
    # IDs des enquetes deja repondues par cet utilisateur — requete unique.
    answered = await db.surveyresponse.find_many(
        where={"userId": user_id},
        include={"survey": False},
    )
    answered_ids = {r.surveyId for r in answered}

    surveys = await db.survey.find_many(
        where={"actif": True},
        order={"dateCreation": "desc"},
    )

    return [
        SurveyOut(id=s.id, question=s.question, actif=s.actif)
        for s in surveys
        if s.id not in answered_ids
    ]


# ---------------------------------------------------------------------------
# answer_survey
# ---------------------------------------------------------------------------

async def answer_survey(user_id: str, survey_id: str, payload: SurveyAnswerIn, lang: str = "fr") -> SurveyResponseOut:
    survey = await db.survey.find_unique(where={"id": survey_id})
    if survey is None or not survey.actif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("survey_not_found", lang),
        )

    # Une seule reponse par utilisateur par enquete (contrainte @@unique en base).
    existing = await db.surveyresponse.find_first(
        where={"userId": user_id, "surveyId": survey_id}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("survey_already_answered", lang),
        )

    response = await db.surveyresponse.create(
        data={
            "userId": user_id,
            "surveyId": survey_id,
            "reponse": payload.reponse,
        }
    )
    return SurveyResponseOut(
        id=response.id,
        survey_id=response.surveyId,
        reponse=response.reponse,
        date_reponse=response.dateReponse,
    )
