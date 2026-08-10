"""Middleware de charge. / Load-guarding middleware.

FR — Rejette (413) tout corps de requete depassant MAX_REQUEST_BODY_MB avant
de le lire, pour qu'un texte demesure envoye a /predict/text ne sature jamais
le service.
EN — Rejects (413) any request body exceeding MAX_REQUEST_BODY_MB before
reading it, so an oversized text sent to /predict/text never overloads the
service.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from src.api.errors import AiErrorResponse
from src.config import get_settings

settings = get_settings()


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, max_body_mb: int | None = None) -> None:
        super().__init__(app)
        self.max_bytes = (max_body_mb or settings.max_request_body_mb) * 1024 * 1024

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length is not None and content_length.isdigit() and int(content_length) > self.max_bytes:
            body = AiErrorResponse(
                code="payload_too_large",
                message_fr=f"Corps de requête trop volumineux (max {settings.max_request_body_mb} Mo).",
                message_en=f"Request body too large (max {settings.max_request_body_mb} MB).",
            )
            return JSONResponse(status_code=413, content=body.model_dump())
        return await call_next(request)
