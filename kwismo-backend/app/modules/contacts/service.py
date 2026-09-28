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

def _to_out(c, has_kwismo: bool = False) -> ContactOut:
    is_on_kwismo = has_kwismo or (c.statut is not None and c.statut != 'unknown')
    return ContactOut(
        id=c.id,
        nom=c.nom,
        numero=c.numero,
        statut=c.statut or ("securise" if is_on_kwismo else None),
        has_kwismo=is_on_kwismo,
        created_at=c.createdAt,
    )


async def _resolve_contact_kwismo_info(numero_valeur: str) -> tuple[str | None, bool]:
    """Vérifie si le numéro appartient à un utilisateur Kwismo et détermine le badge."""
    user_phone = await db.userphone.find_first(where={"valeur": numero_valeur})
    is_kwismo_user = user_phone is not None

    entry = await db.numero.find_unique(where={"valeur": numero_valeur})
    badge = None
    if entry and entry.statut and entry.statut != "unknown":
        badge = entry.statut
    elif is_kwismo_user:
        badge = "securise"

    return badge, is_kwismo_user


# ---------------------------------------------------------------------------
# list_contacts
# ---------------------------------------------------------------------------

async def list_contacts(user_id: str) -> list[ContactOut]:
    contacts = await db.contact.find_many(
        where={"userId": user_id},
        order={"createdAt": "asc"},
    )
    result = []
    for c in contacts:
        badge, is_kwismo = await _resolve_contact_kwismo_info(c.numero)
        if badge and c.statut != badge:
            await db.contact.update(where={"id": c.id}, data={"statut": badge})
            c.statut = badge
        result.append(_to_out(c, has_kwismo=is_kwismo))
    return result


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

    badge, is_kwismo = await _resolve_contact_kwismo_info(valeur)
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
    return _to_out(contact, has_kwismo=is_kwismo)


# ---------------------------------------------------------------------------
# refresh_contact
# ---------------------------------------------------------------------------

async def refresh_contact(user_id: str, contact_id: str, lang: str = "fr") -> ContactOut:
    contact = await db.contact.find_unique(where={"id": contact_id})
    if contact is None or contact.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("contact_not_found", lang))

    badge, is_kwismo = await _resolve_contact_kwismo_info(contact.numero)
    numero_ref = await db.numero.find_unique(where={"valeur": contact.numero})
    numero_id = numero_ref.id if numero_ref else None

    updated = await db.contact.update(
        where={"id": contact_id},
        data={"statut": badge, "numeroId": numero_id},
    )
    return _to_out(updated, has_kwismo=is_kwismo)


# ---------------------------------------------------------------------------
# sync_contacts
# ---------------------------------------------------------------------------

async def sync_contacts(user_id: str, payload) -> list[ContactOut]:
    for item in payload.contacts:
        valeur = normalize_phone(item.numero)
        if not is_valid_phone(valeur):
            continue
        existing = await db.contact.find_first(where={"userId": user_id, "numero": valeur})
        nom_complet = f"{item.prenom or ''} {item.nom}".strip() or item.nom or valeur
        badge, _ = await _resolve_contact_kwismo_info(valeur)
        numero_ref = await db.numero.find_unique(where={"valeur": valeur})
        numero_id = numero_ref.id if numero_ref else None

        if existing is None:
            await db.contact.create(
                data={
                    "userId": user_id,
                    "nom": nom_complet,
                    "numero": valeur,
                    "statut": badge,
                    "numeroId": numero_id,
                }
            )
        else:
            update_data = {}
            if nom_complet and existing.nom != nom_complet:
                update_data["nom"] = nom_complet
            if badge and existing.statut != badge:
                update_data["statut"] = badge
            if update_data:
                await db.contact.update(
                    where={"id": existing.id},
                    data=update_data,
                )

    return await list_contacts(user_id)


async def remove_contact(user_id: str, contact_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    contact = await db.contact.find_unique(where={"id": contact_id})
    if contact is None or contact.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("contact_not_found", lang))

    await db.whatsappalertrecipient.delete_many(where={"contactId": contact_id})
    await db.contact.delete(where={"id": contact_id})
    return Message(
        message_fr=t("contact_removed", "fr"),
        message_en=t("contact_removed", "en"),
    )
