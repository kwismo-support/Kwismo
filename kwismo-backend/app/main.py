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
from app.modules.auth.router import router as auth_router
from app.modules.contacts.router import router as contacts_router
from app.modules.devices.router import router as devices_router
from app.modules.kpi.router import router as kpi_router
from app.modules.notifications.router import router as notifications_router
from app.modules.numbers.router import router as numbers_router
from app.modules.partners.router import router as partners_router
from app.modules.reports.router import router as reports_router
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
WhatsApp, enquêtes, KPI et administration des rôles. Le backend est la seule
porte d'accès à la base de données. La plupart des routes ci-dessous
répondent **501** tant que leur logique métier n'est pas encore écrite —
c'est un squelette d'API délibéré, pas un bug.

**EN** — KWISMO's hybrid central API: authentication, accounts and their
phone numbers, reputation checks (via the AI service), reports, USSD-code
protected transfers, partners, WhatsApp alerts, surveys, KPIs and role
administration. The backend is the only door to the database. Most routes
below return **501** until their business logic is written — this is a
deliberate API skeleton, not a bug.
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
    """Refuse de demarrer silencieusement avec une config dangereuse en prod.
    / Refuses to start silently with a dangerous config in production."""
    memory_rl = settings.rate_limit_storage_uri == "memory://"
    hosts_open = settings.allowed_hosts == "*"
    if memory_rl and not hosts_open:
        _logger.warning(
            "SECURITE — RATE_LIMIT_STORAGE_URI='memory://' avec des hotes restreints : "
            "en multi-workers les limites de debit ne sont pas partagees. "
            "Passez RATE_LIMIT_STORAGE_URI a l'URL Redis pour la production."
        )
    if hosts_open and settings.cors_origins != "http://localhost:5173":
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

    # Roles
    for nom_role in ("user", "partner", "admin"):
        await _db.role.upsert(
            where={"nomRole": nom_role},
            data={"create": {"nomRole": nom_role}, "update": {}},
        )

    # Cameroun par defaut — seul pays amorce au demarrage.
    # Cameroon by default — only country seeded at startup.
    await _db.country.upsert(
        where={"codePays": "+237"},
        data={
            "create": {
                "nom": "Cameroun",
                "codePays": "+237",
                "estParDefaut": True,
            },
            "update": {},
        },
    )
    _logger.info("Seed par defaut applique (roles + Cameroun).")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _check_startup_config()
    await connect_db()
    await _seed_defaults()
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
):
    app.include_router(router)


@app.get("/health",
    response_model=HealthOut,
    tags=["System"],
    summary="Health check / Vérification de santé",
    description="**FR** — Point de contrôle pour la supervision.\n\n**EN** — Health check for supervision/orchestration.",
)
async def health() -> HealthOut:
    return HealthOut(status="ok")


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
