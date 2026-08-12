"""Routes /surveys/*. / Survey routes."""

from fastapi import APIRouter, Depends, status

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, NOT_FOUND_RESPONSE
from app.modules.surveys import service
from app.modules.surveys.schemas import SurveyAnswerIn, SurveyOut, SurveyResponseOut

router = APIRouter(prefix="/surveys", tags=["Surveys"])


@router.get(
    "/active",
    response_model=list[SurveyOut],
    responses=AUTH_RESPONSES,
    summary="Get active surveys / Enquêtes actives",
    description="**FR** — Enquêtes actives non encore répondues par l'utilisateur.\n\n**EN** — Active surveys not yet answered by the user.",
)
async def get_active_surveys(user=Depends(require_roles("user"))) -> list[SurveyOut]:
    return await service.get_active_surveys(user.id)


@router.post(
    "/{survey_id}/answer",
    response_model=SurveyResponseOut,
    status_code=status.HTTP_201_CREATED,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Answer a survey / Répondre à une enquête",
    description="**FR** — Enregistre la réponse de l'utilisateur.\n\n**EN** — Records the user's answer.",
)
async def answer_survey(
    survey_id: str, payload: SurveyAnswerIn, user=Depends(require_roles("user"))
) -> SurveyResponseOut:
    return await service.answer_survey(user.id, survey_id, payload)
