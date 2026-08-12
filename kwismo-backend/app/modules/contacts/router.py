"""Routes /contacts/*. / Contact routes.

FR — Carnet de contacts avec insigne de reputation ; utilise notamment par
`POST /whatsapp-alerts/broadcast` pour choisir les destinataires.
EN — Contact list with a reputation badge; used in particular by
`POST /whatsapp-alerts/broadcast` to pick recipients.
"""

from fastapi import APIRouter, Depends, status

from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
from app.modules.contacts import service
from app.modules.contacts.schemas import ContactAddIn, ContactOut

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.get(
    "",
    response_model=list[ContactOut],
    responses=AUTH_RESPONSES,
    summary="List my contacts / Lister mes contacts",
    description=(
        "**FR** — Liste des contacts du compte avec leur insigne de réputation.\n\n"
        "**EN** — The account's contacts with their reputation badge."
    ),
)
async def list_contacts(user=Depends(require_roles("user"))) -> list[ContactOut]:
    return await service.list_contacts(user.id)


@router.post(
    "",
    response_model=ContactOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Add a contact / Ajouter un contact",
    description=(
        "**FR** — Ajoute un contact (nom + numéro) ; déclenche une vérification de réputation.\n\n"
        "**EN** — Adds a contact (name + number); triggers a reputation check."
    ),
)
async def add_contact(payload: ContactAddIn, user=Depends(require_roles("user"))) -> ContactOut:
    return await service.add_contact(user.id, payload)


@router.post(
    "/{contact_id}/refresh",
    response_model=ContactOut,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Refresh a contact's badge / Rafraîchir l'insigne d'un contact",
    description=(
        "**FR** — Relance la vérification de réputation du numéro du contact.\n\n"
        "**EN** — Re-runs the reputation check for the contact's number."
    ),
)
async def refresh_contact(contact_id: str, user=Depends(require_roles("user"))) -> ContactOut:
    return await service.refresh_contact(user.id, contact_id)


@router.delete(
    "/{contact_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Remove a contact / Retirer un contact",
)
async def remove_contact(contact_id: str, user=Depends(require_roles("user"))) -> Message:
    return await service.remove_contact(user.id, contact_id)
