"""Schemas Pydantic du module settings. / Pydantic schemas for settings module."""

from typing import Literal
from pydantic import BaseModel, Field


class RiskThresholdRule(BaseModel):
    zone: Literal["securise", "suspect", "frauduleux"] = Field(..., description="Risk zone classification")
    min_value: float = Field(0.0, ge=0.0, le=1.0, description="Minimum threshold score (0.0 to 1.0)")
    min_operator: Literal[">=", ">", "="] = Field(">=", description="Comparison operator for min_value")
    max_value: float = Field(1.0, ge=0.0, le=1.0, description="Maximum threshold score (0.0 to 1.0)")
    max_operator: Literal["<=", "<", "="] = Field("<=", description="Comparison operator for max_value")
    label_fr: str = Field("Nom de la zone", description="Libellé FR")
    label_en: str = Field("Zone name", description="Label EN")


class SettingsThresholdsIn(BaseModel):
    rules: list[RiskThresholdRule]


class SettingsThresholdsOut(BaseModel):
    rules: list[RiskThresholdRule]
    updated_at: str | None = None
