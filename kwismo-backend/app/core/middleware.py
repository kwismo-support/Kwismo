"""Middlewares de securite. / Security middlewares.

FR — En-tetes HTTP de securite et limite de taille de requete. Le CORS est
configure a part dans app/main.py.
EN — Security HTTP headers and a request-size cap. CORS is configured
separately in app/main.py.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from app.core.config import get_settings
from app.core.schemas import ErrorResponse

settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Ajoute les en-tetes HTTP de securite recommandes. / Adds the recommended HTTP security headers."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        if request.url.path in ("/docs", "/redoc"):
            # Relax CSP so Swagger/ReDoc can load assets from unpkg
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://unpkg.com; "
                "style-src 'self' 'unsafe-inline' https://unpkg.com; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "frame-ancestors 'none'"
            )
        # API routes: no CSP — CSP is for HTML pages, not JSON API responses.
        # Applying default-src 'none' to API routes blocks Swagger UI fetch calls.
        return response


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    """FR — Rejette (413) toute requete dont le corps depasse MAX_REQUEST_BODY_MB.
    EN — Rejects (413) any request whose body exceeds MAX_REQUEST_BODY_MB."""

    def __init__(self, app: ASGIApp, max_body_mb: int | None = None) -> None:
        super().__init__(app)
        self.max_bytes = (max_body_mb or settings.max_request_body_mb) * 1024 * 1024

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length is not None and content_length.isdigit() and int(content_length) > self.max_bytes:
            body = ErrorResponse(
                code="payload_too_large",
                message_fr=f"Corps de requête trop volumineux (max {settings.max_request_body_mb} Mo).",
                message_en=f"Request body too large (max {settings.max_request_body_mb} MB).",
            )
            return JSONResponse(status_code=413, content=body.model_dump())
        return await call_next(request)
