"""Point d'entree FastAPI. / FastAPI entry point.

FR — Assemble toutes les routes, la securite (limitation de debit,
gestionnaires d'erreurs, en-tetes HTTP) et la connexion a la base. Les
routes repondent 501 tant que leur logique n'est pas ecrite (voir
app/core/exceptions.not_implemented).
EN — Wires up all routes, security (rate limiting, error handlers, HTTP
headers) and the database connection. Routes return 501 until their logic
is written (see app/core/exceptions.not_implemented).
"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.core.audit_log import AuditLogMiddleware
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import MaxBodySizeMiddleware, SecurityHeadersMiddleware
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from app.core.schemas import HealthOut
from app.db.prisma_client import connect_db, disconnect_db
from app.modules.access_control.router import router as access_control_router
from app.modules.ai_gateway.router import router as ai_gateway_router
from app.modules.auth.router import router as auth_router
from app.modules.contacts.router import router as contacts_router
from app.modules.devices.router import router as devices_router
from app.modules.kpi.router import router as kpi_router
from app.modules.notifications.router import router as notifications_router
from app.modules.numbers.router import router as numbers_router
from app.modules.partners.router import router as partners_router
from app.modules.reports.router import router as reports_router
from app.modules.settings.router import router as settings_router
from app.modules.surveys.router import router as surveys_router
from app.modules.transactions.router import router as transactions_router
from app.modules.user_phones.router import router as user_phones_router
from app.modules.users.router import router as users_router
from app.modules.ussd.router import router as ussd_router
from app.modules.whatsapp_alert.router import router as whatsapp_alert_router

DESCRIPTION = """
**FR** — API centrale hybride de KWISMO : authentification, gestion des
comptes et de leurs numéros, vérification de réputation (via le service IA),
signalements, transferts protégés par code USSD, partenaires, alertes
WhatsApp, enquêtes, KPI et administration des rôles.

**EN** — KWISMO's hybrid central API: authentication, accounts and their
phone numbers, reputation checks (via the AI service), reports, USSD-code
protected transfers, partners, WhatsApp alerts, surveys, KPIs and role
administration.
"""

TAGS_METADATA = [
    {"name": "Auth", "description": "FR — Inscription, connexion, OTP, jetons. / EN — Registration, login, OTP, tokens."},
    {"name": "Users", "description": "FR — Comptes utilisateurs. / EN — User accounts."},
    {"name": "My Numbers", "description": "FR — Numéros possédés par le compte (multi-SIM). / EN — Numbers owned by the account (multi-SIM)."},
    {"name": "Contacts", "description": "FR — Carnet de contacts à insignes de réputation. / EN — Contact list with reputation badges."},
    {"name": "Numbers", "description": "FR — Registre de réputation de tout numéro analysé. / EN — Reputation ledger for any analyzed number."},
    {"name": "Reports", "description": "FR — Signalements de numéros frauduleux. / EN — Fraudulent number reports."},
    {"name": "Transactions", "description": "FR — Préparation de transferts protégés (métadonnées seulement). / EN — Protected transfer preparation (metadata only)."},
    {"name": "USSD", "description": "FR — Pays, opérateurs, actions USSD. / EN — Countries, operators, USSD actions."},
    {"name": "Partners", "description": "FR — Partenaires et règles d'affiliation (cloisonnement serveur). / EN — Partners and affiliation rules (server-side scoping)."},
    {"name": "WhatsApp Alert", "description": "FR — Incident de piratage et diffusion d'alerte. / EN — Hijack incident and alert broadcast."},
    {"name": "Surveys", "description": "FR — Enquêtes utilisateur. / EN — User surveys."},
    {"name": "KPI", "description": "FR — Indicateurs globaux et par partenaire. / EN — Global and per-partner indicators."},
    {"name": "Access Control", "description": "FR — Rôles et droits d'accès (RBAC). / EN — Roles and access rights (RBAC)."},
    {"name": "Notifications", "description": "FR — Notifications utilisateur FR/EN. / EN — User notifications, FR/EN."},
    {"name": "Devices", "description": "FR — Appareils connectés. / EN — Connected devices."},
    {"name": "System", "description": "FR — Supervision (santé). / EN — Supervision (health)."},
]

settings = get_settings()
configure_logging()

_logger = logging.getLogger("kwismo.backend")


def _check_startup_config() -> None:
    """Valide la configuration au demarrage — bloque si secrets par defaut hors dev."""
    settings.validate_secrets()

    memory_rl = settings.rate_limit_storage_uri == "memory://"
    hosts_open = settings.allowed_hosts == "*"
    if memory_rl and not hosts_open:
        _logger.warning(
            "SECURITE — RATE_LIMIT_STORAGE_URI='memory://' avec des hotes restreints : "
            "en multi-workers les limites de debit ne sont pas partagees. "
            "Passez RATE_LIMIT_STORAGE_URI a l'URL Redis pour la production."
        )
    if hosts_open and settings.cors_origins != settings.frontend_url:
        _logger.warning(
            "SECURITE — ALLOWED_HOSTS='*' avec des origines CORS non locales : "
            "restreignez ALLOWED_HOSTS en production."
        )


async def _seed_defaults() -> None:
    """Insere les donnees minimales au premier demarrage. / Inserts minimal data on first startup.

    Idempotent — ne fait rien si les donnees existent deja.
    Idempotent — does nothing if data already exists.
    """
    from app.db.prisma_client import db as _db

    from scripts.seed import (
        seed_roles_and_permissions,
        seed_partners,
        seed_users,
        seed_countries,
        seed_operators,
        seed_ussd_actions,
        seed_numeros,
        seed_user_phones,
        seed_devices,
        seed_contacts,
        seed_scam_categories,
        seed_reports,
        seed_transactions,
        seed_notifications_and_kpis,
        seed_audit_logs,
    )
    role_ids = await seed_roles_and_permissions()
    partner_ids = await seed_partners()
    user_ids = await seed_users(role_ids, partner_ids)
    country_ids = await seed_countries()
    operator_ids = await seed_operators(country_ids)
    await seed_ussd_actions(operator_ids)
    numero_ids = await seed_numeros(country_ids, operator_ids)
    await seed_user_phones(user_ids, country_ids, operator_ids, numero_ids)
    await seed_devices(user_ids)
    await seed_contacts(user_ids, numero_ids)
    scam_cat_ids = await seed_scam_categories()
    await seed_reports(user_ids, numero_ids, scam_cat_ids)
    await seed_transactions(user_ids, numero_ids)
    await seed_notifications_and_kpis(user_ids, partner_ids)
    await seed_audit_logs(user_ids)

    _logger.info("Seed par defaut applique avec succes (comptes, pays, operateurs, signalements, contacts, etc.).")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _check_startup_config()
    await connect_db()
    from app.db.prisma_client import db as _db
    try:
        if not await _db.role.find_first():
            await _seed_defaults()
    except Exception as exc:
        _logger.warning("Seed par défaut non appliqué au démarrage: %s", exc)
    yield
    await disconnect_db()


app = FastAPI(
    title="KWISMO Backend API",
    description=DESCRIPTION,
    version="0.1.0",
    openapi_tags=TAGS_METADATA,
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

# --- Securite ---------------------------------------------------------
# Ordre : le dernier middleware ajoute est le plus "exterieur" (execute en
# premier sur la requete). On rejette d'abord les hotes/tailles suspects,
# puis CORS, puis on habille la reponse (en-tetes, compression).
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
register_exception_handlers(app)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(AuditLogMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MaxBodySizeMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts_list)

for router in (
    auth_router,
    users_router,
    user_phones_router,
    contacts_router,
    numbers_router,
    reports_router,
    transactions_router,
    ussd_router,
    partners_router,
    whatsapp_alert_router,
    surveys_router,
    kpi_router,
    access_control_router,
    notifications_router,
    devices_router,
    settings_router,
    ai_gateway_router,
):
    app.include_router(router)


@app.get("/health",
    response_model=HealthOut,
    tags=["System"],
    summary="Health check / Vérification de santé",
    description="**FR** — Point de contrôle pour la supervision.\n\n**EN** — Health check for supervision/orchestration.",
)
async def health() -> HealthOut:
    from app.db.prisma_client import db
    try:
        await db.query_raw("SELECT 1")
        return HealthOut(status="ok")
    except Exception as exc:
        _logger.error("Healthcheck DB failure: %s", exc)
        return HealthOut(status="degraded")


@app.get("/docs", include_in_schema=False)
async def swagger_ui() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="KWISMO API",
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
    )


@app.get("/redoc", include_in_schema=False)
async def redoc_ui() -> HTMLResponse:
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="KWISMO API",
        redoc_js_url="https://unpkg.com/redoc@latest/bundles/redoc.standalone.js",
    )
