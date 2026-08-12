"""Middleware et helpers pour l'audit log."""

import logging
from datetime import datetime

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.db.prisma_client import db

logger = logging.getLogger("kwismo.backend")

SENSITIVE_ACTIONS = {
    "POST /api/v1/auth/register",
    "POST /api/v1/auth/login",
    "POST /api/v1/auth/logout",
    "POST /api/v1/auth/refresh",
    "POST /api/v1/auth/forgot-password",
    "POST /api/v1/auth/reset-password",
    "PATCH /api/v1/users/me/status",
    "DELETE /api/v1/user-phones",
    "POST /api/v1/user-phones/compromise",
    "POST /api/v1/reports",
    "POST /api/v1/reports/validate",
    "POST /api/v1/transactions",
    "PATCH /api/v1/whatsapp-alert/incidents",
    "POST /api/v1/whatsapp-alert/broadcast",
    "DELETE /api/v1/access-control/roles",
    "DELETE /api/v1/access-control/access-rights",
}


def _should_audit(method: str, path: str) -> bool:
    route = f"{method} {path}"
    return route in SENSITIVE_ACTIONS


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
    except Exception as e:
        logger.warning(f"Audit log failed: {e}", exc_info=True)


class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method
        path = request.url.path

        if not _should_audit(method, path):
            return await call_next(request)

        user_id = getattr(request.state, "user_id", None)
        ip = request.client.host if request.client else None
        action = f"{method} {path}"

        response: Response = await call_next(request)

        if 200 <= response.status_code < 300:
            await log_audit(user_id, action, cible=None, ip=ip)

        return response
