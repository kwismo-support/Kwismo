"""Logique metier du module contacts. / Business logic for the contacts module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.contacts.schemas import ContactAddIn, ContactOut
from app.utils.i18n import t
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _to_out(c) -> ContactOut:
    return ContactOut(
        id=c.id,
        nom=c.nom,
        numero=c.numero,
        statut=c.statut,
        created_at=c.createdAt,
    )


async def _resolve_badge(numero_valeur: str) -> str | None:
    """Recupere le statut du registre Numero si ce numero a deja ete analyse."""
    entry = await db.numero.find_unique(where={"valeur": numero_valeur})
    if entry is None:
        return None
    if entry.statut == "unknown":
        return None
    return entry.statut


# ---------------------------------------------------------------------------
# list_contacts
# ---------------------------------------------------------------------------

async def list_contacts(user_id: str) -> list[ContactOut]:
    contacts = await db.contact.find_many(
        where={"userId": user_id},
        order={"createdAt": "asc"},
    )
    return [_to_out(c) for c in contacts]


# ---------------------------------------------------------------------------
# add_contact
# ---------------------------------------------------------------------------

async def add_contact(user_id: str, payload: ContactAddIn, lang: str = "fr") -> ContactOut:
    valeur = normalize_phone(payload.numero)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("invalid_phone_format", lang),
        )

    existing = await db.contact.find_first(where={"userId": user_id, "numero": valeur})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("contact_already_exists", lang),
        )

    badge = await _resolve_badge(valeur)
    numero_ref = await db.numero.find_unique(where={"valeur": valeur})
    numero_id = numero_ref.id if numero_ref else None

    contact = await db.contact.create(
        data={
            "userId": user_id,
            "nom": payload.nom,
            "numero": valeur,
            "statut": badge,
            "numeroId": numero_id,
        }
    )
    return _to_out(contact)


# ---------------------------------------------------------------------------
# refresh_contact
# ---------------------------------------------------------------------------

async def refresh_contact(user_id: str, contact_id: str, lang: str = "fr") -> ContactOut:
    contact = await db.contact.find_unique(where={"id": contact_id})
    if contact is None or contact.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("contact_not_found", lang))

    badge = await _resolve_badge(contact.numero)
    numero_ref = await db.numero.find_unique(where={"valeur": contact.numero})
    numero_id = numero_ref.id if numero_ref else None

    contact = await db.contact.update(
        where={"id": contact_id},
        data={"statut": badge, "numeroId": numero_id},
    )
    return _to_out(contact)


# ---------------------------------------------------------------------------
# remove_contact
# ---------------------------------------------------------------------------

async def remove_contact(user_id: str, contact_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    contact = await db.contact.find_unique(where={"id": contact_id})
    if contact is None or contact.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("contact_not_found", lang))

    await db.contact.delete(where={"id": contact_id})
    return Message(
        message_fr=t("contact_removed", "fr"),
        message_en=t("contact_removed", "en"),
    )
