"""Gestion des erreurs et limitation de debit du service d'inference. / Error handling and rate limiting for the inference service.

FR — Garantit que ni une exception d'inference (modele non charge, entree
inattendue...) ni une charge excessive ne rendent le service indisponible :
le backend en depend pour scorer chaque numero/message.
EN — Guarantees that neither an inference exception (model not loaded,
unexpected input...) nor excessive load ever take the service down: the
backend depends on it to score every number/message.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.config import get_settings

logger = logging.getLogger("kwismo.ai")
settings = get_settings()

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.rate_limit_storage_uri,
    default_limits=[settings.rate_limit_default],
    headers_enabled=True,
)


class AiErrorResponse(BaseModel):
    code: str = Field(..., examples=["internal_error"])
    message_fr: str
    message_en: str


async def _validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    body = AiErrorResponse(
        code="validation_error",
        message_fr="Les données envoyées sont invalides.",
        message_en="The submitted data is invalid.",
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={**body.model_dump(), "errors": exc.errors()},
    )


async def _unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Erreur non geree sur %s %s", request.method, request.url.path)
    body = AiErrorResponse(
        code="internal_error",
        message_fr="Une erreur interne est survenue côté service IA.",
        message_en="An internal error occurred in the AI service.",
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=body.model_dump())


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    body = AiErrorResponse(
        code="rate_limited",
        message_fr="Trop de requêtes. Réessayez plus tard.",
        message_en="Too many requests. Try again later.",
    )
    return JSONResponse(status_code=429, content=body.model_dump())


def register_error_handlers(app: FastAPI) -> None:
    """A appeler une fois depuis src/api/main.py. / Call once from src/api/main.py."""

    app.add_exception_handler(RequestValidationError, _validation_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_exception_handler(Exception, _unhandled_exception_handler)
