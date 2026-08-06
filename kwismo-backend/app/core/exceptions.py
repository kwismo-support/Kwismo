"""Exceptions metier + gestionnaires globaux (protection anti-crash). / Business exceptions + global handlers (crash protection).

FR — cf. cahier des charges Backend §8.4 (validation stricte) et §10.1
(journaux structures). Ces gestionnaires garantissent que :
  1. aucune exception non geree ne fait fuiter une trace technique au client
     (juste un message bilingue propre + un log serveur complet) ;
  2. les erreurs de validation Pydantic renvoient un format bilingue coherent
     avec le reste de l'API plutot que le format brut de FastAPI.
Rien n'empeche jamais le process de continuer a servir les autres requetes :
c'est le comportement normal d'ASGI (une exception reste isolee a sa
requete), mais sans ces gestionnaires, le detail technique de l'exception
peut fuiter au client — ce que §8.4 interdit.

EN — see Backend spec §8.4 (strict validation) and §10.1 (structured logs).
These handlers guarantee that:
  1. no unhandled exception leaks a technical traceback to the client (just
     a clean bilingual message + a full server-side log);
  2. Pydantic validation errors return a bilingual shape consistent with the
     rest of the API instead of FastAPI's raw format.
Nothing here is what stops the process from continuing to serve other
requests — that's normal ASGI behaviour (an exception stays scoped to its
own request) — but without these handlers, the exception's technical detail
can leak to the client, which §8.4 forbids.
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
