"""Routes /devices/*. / Device routes."""

from fastapi import APIRouter, Depends

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
from app.modules.devices import service
from app.modules.devices.schemas import DeviceOut

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get(
    "",
    response_model=list[DeviceOut],
    responses=AUTH_RESPONSES,
    summary="List my devices / Lister mes appareils",
    description=(
        "**FR** — Liste tous mes appareils connectés.\n\n"
        "**EN** — Lists all my connected devices."
    ),
)
async def list_my_devices(user=Depends(require_roles("user"))) -> list[DeviceOut]:
    return await service.list_my_devices(user.id)


@router.delete(
    "/{device_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Delete device / Supprimer un appareil",
    description=(
        "**FR** — Supprime un appareil de mon compte.\n\n"
        "**EN** — Removes a device from my account."
    ),
)
async def delete_my_device(device_id: str, user=Depends(require_roles("user"))) -> Message:
    return await service.delete_my_device(user.id, device_id)