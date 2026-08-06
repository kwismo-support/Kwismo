"""Routes /contacts/*. / /contacts/* routes.

FR — Non listees explicitement au cahier §5 (voir note dans schemas.py) mais
necessaires pour que la table Contact et la "liste de contacts a insignes"
soient utilisables, notamment par `POST /whatsapp-alerts/broadcast`.
EN — Not explicitly listed in spec §5 (see note in schemas.py) but required
for the Contact table and the "badge contact list" to be usable, in
particular by `POST /whatsapp-alerts/broadcast`.
"""

from fastapi import APIRouter, Depends, status

from app.core.exceptions import not_implemented
from app.core.permissions import require_roles
from app.core.schemas import AUTH_RESPONSES, Message, NOT_FOUND_RESPONSE
from app.modules.contacts.schemas import ContactAddIn, ContactOut

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.get(
    "",
    response_model=list[ContactOut],
    responses=AUTH_RESPONSES,
    summary="List my contacts / Lister mes contacts",
    description=(
        "**FR** — Liste des contacts du compte avec leur insigne de réputation "
        "(alimenté par le Modèle A côté IA).\n\n"
        "**EN** — The account's contacts with their reputation badge (fed by the "
        "AI's Model A)."
    ),
)
async def list_contacts(user=Depends(require_roles("user"))) -> list[ContactOut]:
    raise not_implemented()


@router.post(
    "",
    response_model=ContactOut,
    status_code=status.HTTP_201_CREATED,
    responses=AUTH_RESPONSES,
    summary="Add a contact / Ajouter un contact",
    description=(
        "**FR** — Ajoute un contact (nom + numéro) ; déclenche une vérification "
        "de réputation.\n\n"
        "**EN** — Adds a contact (name + number); triggers a reputation check."
    ),
)
async def add_contact(payload: ContactAddIn, user=Depends(require_roles("user"))) -> ContactOut:
    raise not_implemented()


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
    raise not_implemented()


@router.delete(
    "/{contact_id}",
    response_model=Message,
    responses={**AUTH_RESPONSES, **NOT_FOUND_RESPONSE},
    summary="Remove a contact / Retirer un contact",
    description="**FR** — Retire un contact du compte.\n\n**EN** — Removes a contact from the account.",
)
async def remove_contact(contact_id: str, user=Depends(require_roles("user"))) -> Message:
    raise not_implemented()
