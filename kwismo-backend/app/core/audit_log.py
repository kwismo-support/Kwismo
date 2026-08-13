"""Middleware et helpers pour l'audit log."""

import logging
from datetime import datetime

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.db.prisma_client import db

logger = logging.getLogger("kwismo.backend")

SENSITIVE_PATHS = {
    ("POST", "/auth/register"),
    ("POST", "/auth/login"),
    ("POST", "/auth/logout"),
    ("POST", "/auth/refresh"),
    ("POST", "/auth/password/forgot"),
    ("POST", "/auth/password/reset"),
    ("PATCH", "/users/me"),
    ("DELETE", "/users/me/phones"),
    ("POST", "/users/me/phones"),
    ("PATCH", "/users/me/phones"),
    ("POST", "/reports"),
    ("PATCH", "/reports"),
    ("POST", "/transactions/prepare"),
    ("PATCH", "/whatsapp-alerts/incident"),
    ("POST", "/whatsapp-alerts/broadcast"),
    ("DELETE", "/roles"),
    ("DELETE", "/access-rights"),
    ("DELETE", "/devices"),
}


def _should_audit(method: str, path: str) -> bool:
    """Verifie si la route est sensible par prefixe de chemin."""
    for m, p in SENSITIVE_PATHS:
        if method == m and path.startswith(p):
            return True
    return False


def _extract_user_id_from_bearer(request: Request) -> str | None:
    """Extrait user_id depuis le JWT Bearer sans lever d'exception."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.removeprefix("Bearer ").strip()
    if not token:
        return None
    try:
        from app.core.security import decode_token
        payload = decode_token(token, expected_type="access")
        return payload.get("sub")
    except Exception:
        return None


async def log_audit(
    user_id: str | None,
    action: str,
    cible: str | None = None,
    ip: str | None = None,
) -> None:
    try:
        await db.auditlog.create(
            data={
                "userId": user_id,
                "action": action,
                "cible": cible,
                "ip": ip,
                "date": datetime.utcnow(),
            }
        )
    except Exception as exc:
        logger.warning("Audit log failed: %s", exc, exc_info=True)


class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method
        path = request.url.path

        if not _should_audit(method, path):
            return await call_next(request)

        user_id = _extract_user_id_from_bearer(request)
        ip = request.client.host if request.client else None
        action = f"{method} {path}"

        response: Response = await call_next(request)

        if 200 <= response.status_code < 300:
            await log_audit(user_id, action, ip=ip)

        return response
