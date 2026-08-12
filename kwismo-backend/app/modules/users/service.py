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

logger = logging.getLogger("kwismo.backend")
_users = UserRepository()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _build_me(user) -> UserMeOut:
    """Construit le schema UserMeOut a partir d'un objet Prisma User complet."""
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compte introuvable / Account not found.")
    return await _build_me(user)


# ---------------------------------------------------------------------------
# update_me
# ---------------------------------------------------------------------------

async def update_me(user_id: str, payload: UserUpdateIn) -> UserMeOut:
    data: dict = {}
    if payload.nom is not None:
        data["nom"] = payload.nom
    if payload.prenom is not None:
        data["prenom"] = payload.prenom
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucune donnee a mettre a jour / No data to update.")

    user = await db.user.update(
        where={"id": user_id},
        data=data,
        include={"role": True, "devices": True},
    )
    return await _build_me(user)


# ---------------------------------------------------------------------------
# list_users
# ---------------------------------------------------------------------------

async def list_users(page: int, page_size: int):
    from app.core.schemas import Page
    skip = (page - 1) * page_size
    total = await db.user.count()
    users = await db.user.find_many(
        skip=skip,
        take=page_size,
        include={"role": True, "_count": {"select": {"phones": True}}},
        order={"dateInscription": "desc"},
    )
    items = []
    for u in users:
        phones_count = u._count.phones if hasattr(u, "_count") and u._count else 0
        items.append(
            UserListItemOut(
                id=u.id,
                nom=u.nom,
                prenom=u.prenom,
                email=u.email,
                statut=u.statut,
                nombre_numeros=phones_count,
            )
        )
    return Page(items=items, total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# get_user
# ---------------------------------------------------------------------------

async def get_user(user_id: str) -> UserDetailOut:
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"role": True, "phones": True},
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")
    phones_count = len(user.phones or [])
    numeros = [
        UserPhoneSummaryOut(id=p.id, valeur=p.valeur, est_verifie=p.estVerifie, est_compromis=p.estCompromis)
        for p in (user.phones or [])
    ]
    return UserDetailOut(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        statut=user.statut,
        nombre_numeros=phones_count,
        date_inscription=user.dateInscription,
        numeros=numeros,
    )


# ---------------------------------------------------------------------------
# set_user_status
# ---------------------------------------------------------------------------

async def set_user_status(user_id: str, payload: UserStatusIn) -> UserDetailOut:
    if payload.statut not in ("active", "suspended"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statut invalide. Valeurs acceptees : active, suspended / Invalid status. Accepted: active, suspended.",
        )
    user = await db.user.find_unique(where={"id": user_id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable / User not found.")

    await db.user.update(where={"id": user_id}, data={"statut": payload.statut})
    return await get_user(user_id)
