"""Middlewares de securite. / Security middlewares.

FR — cf. cahier des charges Backend §8.4 (en-tetes de securite HTTP) et §8.5
(limitation de la charge reseau). CORS est configure separement dans
app/main.py (FastAPI CORSMiddleware natif).
EN — see Backend spec §8.4 (HTTP security headers) and §8.5 (network load
limiting). CORS is configured separately in app/main.py (native FastAPI
CORSMiddleware).
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from app.core.config import get_settings
from app.core.schemas import ErrorResponse

settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Ajoute les en-tetes HTTP de securite recommandes (§8.4). / Adds the recommended HTTP security headers (§8.4)."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        # HSTS n'a de sens que derriere HTTPS (reverse proxy en prod) ; inoffensif en dev HTTP.
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        response.headers.setdefault(
            "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
        )
        return response


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    """FR — Rejette (413) toute requete dont le corps depasse MAX_REQUEST_BODY_MB,
    avant que le corps ne soit lu — protection anti-surcharge (§8.5).
    EN — Rejects (413) any request whose body exceeds MAX_REQUEST_BODY_MB,
    before the body is read — anti-overload protection (§8.5)."""

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
