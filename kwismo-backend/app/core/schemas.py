"""Schemas Pydantic partages (pagination, erreurs). / Shared Pydantic schemas (pagination, errors)."""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Reponse paginee generique. / Generic paginated response."""

    items: list[T]
    total: int = Field(..., description="Nombre total d'elements / Total number of items.")
    page: int = Field(..., ge=1, description="Page courante (1-indexee) / Current page (1-indexed).")
    page_size: int = Field(..., ge=1, description="Taille de page / Page size.")


class ErrorResponse(BaseModel):
    """Enveloppe d'erreur bilingue. / Bilingual error envelope."""

    code: str = Field(..., examples=["invalid_otp"], description="Code d'erreur stable / Stable error code.")
    message_fr: str = Field(..., examples=["Code OTP invalide."])
    message_en: str = Field(..., examples=["Invalid OTP code."])


class Message(BaseModel):
    """Reponse de confirmation simple. / Simple confirmation response."""

    message_fr: str
    message_en: str


class HealthOut(BaseModel):
    """Reponse de /health. / Health check response."""

    status: str = Field(..., examples=["ok"])


# Blocs de reponses reutilisables dans les decorateurs de route (`responses=`).
# Reusable response blocks for route decorators (`responses=`).
UNAUTHORIZED_RESPONSE = {401: {"model": ErrorResponse, "description": "Non authentifie / Not authenticated."}}
FORBIDDEN_RESPONSE = {403: {"model": ErrorResponse, "description": "Role insuffisant / Insufficient role."}}
NOT_FOUND_RESPONSE = {404: {"model": ErrorResponse, "description": "Ressource introuvable / Resource not found."}}
AUTH_RESPONSES = {**UNAUTHORIZED_RESPONSE, **FORBIDDEN_RESPONSE}
