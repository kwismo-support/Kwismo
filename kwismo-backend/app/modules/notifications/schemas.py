"""Schemas Pydantic du module notifications. / Pydantic schemas for the notifications module."""

from datetime import datetime

from pydantic import BaseModel, Field


class NotificationOut(BaseModel):
    id: str
    texte: str = Field(..., examples=["Appel suspect détecté de +237690000005."])
    lu: bool = False
    date: datetime
