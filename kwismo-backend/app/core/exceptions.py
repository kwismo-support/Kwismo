"""Exceptions metier + gestionnaires globaux (protection anti-crash). / Business exceptions + global handlers (crash protection).

FR — Capture toute exception non geree pour ne jamais renvoyer de trace
technique au client (juste un message bilingue propre + un log serveur), et
uniformise les erreurs de validation Pydantic.
EN — Catches every unhandled exception so the client never sees a technical
traceback (just a clean bilingual message + a server log), and normalizes
Pydantic validation errors.
"""

import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.schemas import ErrorResponse

logger = logging.getLogger("kwismo.backend")


def not_implemented() -> HTTPException:
    """FR — Marqueur explicite pour une route deja documentee mais dont la
    logique metier n'est pas encore ecrite (squelette Swagger-first).
    EN — Explicit marker for a route that is already documented but whose
    business logic isn't written yet (Swagger-first skeleton)."""

    return HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Pas encore implemente / Not implemented yet.",
    )


async def _validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    body = ErrorResponse(
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
    body = ErrorResponse(
        code="internal_error",
        message_fr="Une erreur interne est survenue. Réessayez plus tard.",
        message_en="An internal error occurred. Please try again later.",
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=body.model_dump())


def register_exception_handlers(app: FastAPI) -> None:
    """A appeler une fois depuis app/main.py. / Call once from app/main.py."""

    app.add_exception_handler(RequestValidationError, _validation_exception_handler)
    app.add_exception_handler(Exception, _unhandled_exception_handler)
