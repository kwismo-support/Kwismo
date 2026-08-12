"""Logique metier du module devices. / Business logic for the devices module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.devices.schemas import DeviceOut

logger = logging.getLogger("kwismo.backend")


def _to_out(d) -> DeviceOut:
    return DeviceOut(
        id=d.id,
        identifiant=d.identifiant,
        nom=d.nom,
        date_premiere_connexion=d.datePremiereConnexion,
        date_derniere_connexion=d.dateDerniereConnexion,
    )


async def list_my_devices(user_id: str) -> list[DeviceOut]:
    """Liste les appareils de l'utilisateur."""
    devices = await db.device.find_many(
        where={"userId": user_id},
        order={"dateDerniereConnexion": "desc"},
    )
    return [_to_out(d) for d in devices]


async def delete_my_device(user_id: str, device_id: str):
    """Supprime un appareil de l'utilisateur."""
    from app.core.schemas import Message
    
    device = await db.device.find_unique(where={"id": device_id})
    if device is None or device.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appareil introuvable / Device not found.",
        )
    
    await db.device.delete(where={"id": device_id})
    return Message(
        message_fr="Appareil supprimé de votre compte.",
        message_en="Device removed from your account.",
    )