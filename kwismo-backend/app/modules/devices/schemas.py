"""Schemas du module devices. / Device module schemas."""

from datetime import datetime

from pydantic import BaseModel


class DeviceOut(BaseModel):
    id: str
    identifiant: str
    nom: str
    date_premiere_connexion: datetime
    date_derniere_connexion: datetime