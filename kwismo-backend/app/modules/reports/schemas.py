"""Schemas Pydantic du module reports. / Pydantic schemas for the reports module.

Table Prisma : Report. / Prisma table: Report.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreateIn(BaseModel):
    numero: str = Field(..., examples=["+237690000003"])
    motif: str = Field(..., examples=["Demande de code OTP par téléphone"])


class ReportOut(BaseModel):
    """Table Report. / Report table."""

    id: str
    user_id: str
    numero_id: str
    motif: str
    date_signalement: datetime
    statut: str = Field(..., examples=["pending"], description="pending | validated | rejected")


class ReportValidateIn(BaseModel):
    statut: str = Field(..., examples=["validated"], description="validated | rejected")
