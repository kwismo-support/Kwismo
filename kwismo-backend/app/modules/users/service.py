"""Logique metier du module users. / Business logic for the users module."""

import logging

from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.db.repositories.user_repository import UserRepository
from app.modules.users.schemas import (
    DeviceSummaryOut,
    UserDetailOut,
    UserKpiOut,
    UserListItemOut,
    UserMeOut,
    UserPhoneSummaryOut,
    UserStatusIn,
    UserUpdateIn,
)
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")
_users = UserRepository()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _build_me(user) -> UserMeOut:
    phones_count = await db.userphone.count(where={"userId": user.id})
    reports_count = await db.report.count(where={"userId": user.id})
    transactions_count = await db.transaction.count(where={"userId": user.id})

    devices = [
        DeviceSummaryOut(
            id=d.id,
            nom=d.nom,
            premiere_connexion=d.datePremiereConnexion,
            derniere_connexion=d.dateDerniereConnexion,
        )
        for d in (user.devices or [])
    ]

    return UserMeOut(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        email_verifie=user.emailVerifie,
        statut=user.statut,
        role=user.role.nomRole,
        langue=getattr(user, "langue", "fr") or "fr",
        date_inscription=user.dateInscription,
        kpi=UserKpiOut(
            numeros_verifies=phones_count,
            signalements_effectues=reports_count,
            transferts_proteges=transactions_count,
        ),
        devices=devices,
    )


# ---------------------------------------------------------------------------
# get_me
# ---------------------------------------------------------------------------

async def get_me(user_id: str) -> UserMeOut:
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"role": True, "devices": True},
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("account_not_found"))
    return await _build_me(user)


# ---------------------------------------------------------------------------
# update_me
# ---------------------------------------------------------------------------

async def update_me(user_id: str, payload: UserUpdateIn, lang: str = "fr") -> UserMeOut:
    data: dict = {}
    if payload.nom is not None:
        data["nom"] = payload.nom
    if payload.prenom is not None:
        data["prenom"] = payload.prenom
    if payload.langue is not None and payload.langue in ("fr", "en"):
        data["langue"] = payload.langue
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("no_data_to_update", lang),
        )

    user = await db.user.update(
        where={"id": user_id},
        data=data,
        include={"role": True, "devices": True},
    )
    return await _build_me(user)


# ---------------------------------------------------------------------------
# list_users
# ---------------------------------------------------------------------------

async def list_users(page: int, page_size: int, partner_id: str | None = None):
    from app.core.schemas import Page
    skip = (page - 1) * page_size
    where = {}
    if partner_id:
        where["partnerId"] = partner_id

    total = await db.user.count(where=where)
    users = await db.user.find_many(
        where=where,
        skip=skip,
        take=page_size,
        include={"role": True, "partner": True, "phones": True},
        order={"dateInscription": "desc"},
    )
    items = []
    for u in users:
        phones_count = len(u.phones or [])
        role_nom = u.role.nomRole if u.role else "user"
        p_name = u.partner.nomEntreprise if u.partner else None
        items.append(
            UserListItemOut(
                id=u.id,
                nom=u.nom,
                prenom=u.prenom,
                email=u.email,
                statut=u.statut,
                role=role_nom,
                role_id=u.roleId,
                partner_id=u.partnerId,
                partner_name=p_name,
                nombre_numeros=phones_count,
            )
        )
    return Page(items=items, total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_user
# ---------------------------------------------------------------------------

async def get_user(user_id: str, lang: str = "fr") -> UserDetailOut:
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"role": True, "partner": True, "phones": True},
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("user_not_found", lang),
        )
    phones_count = len(user.phones or [])
    numeros = [
        UserPhoneSummaryOut(id=p.id, valeur=p.valeur, est_verifie=p.estVerifie, est_compromis=p.estCompromis)
        for p in (user.phones or [])
    ]
    role_nom = user.role.nomRole if user.role else "user"
    p_name = user.partner.nomEntreprise if user.partner else None

    return UserDetailOut(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        statut=user.statut,
        role=role_nom,
        role_id=user.roleId,
        partner_id=user.partnerId,
        partner_name=p_name,
        nombre_numeros=phones_count,
        date_inscription=user.dateInscription,
        numeros=numeros,
        custom_permissions=[],
    )


# ---------------------------------------------------------------------------
# set_user_status
# ---------------------------------------------------------------------------

async def set_user_status(user_id: str, payload: UserStatusIn, lang: str = "fr") -> UserDetailOut:
    if payload.statut not in ("active", "suspended"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("status_invalid_user", lang),
        )
    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("user_not_found", lang),
        )

    await db.user.update(where={"id": user_id}, data={"statut": payload.statut})
    return await get_user(user_id, lang)

