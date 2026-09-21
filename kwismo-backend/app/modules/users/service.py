import base64
import logging
import os
import uuid

from fastapi import HTTPException, status

from app.db.prisma_client import connect_db, db
from app.db.repositories.user_repository import UserRepository
from app.modules.users.schemas import (
    DeviceSummaryOut,
    UserDetailOut,
    UserKpiOut,
    UserListItemOut,
    UserMeOut,
    UserPasswordChangeIn,
    UserPhoneSummaryOut,
    UserStatusIn,
    UserUpdateIn,
)
from app.utils.i18n import t

logger = logging.getLogger("kwismo.backend")
_users = UserRepository()


async def _build_me(user) -> UserMeOut:
    await connect_db()
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
        photo_url=getattr(user, "photo_url", None),
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


async def get_me(user_id: str) -> UserMeOut:
    await connect_db()
    user = await db.user.find_unique(
        where={"id": user_id},
        include={"role": True, "devices": True},
    )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("account_not_found"))
    return await _build_me(user)


async def update_me(user_id: str, payload: UserUpdateIn, lang: str = "fr") -> UserMeOut:
    await connect_db()
    data: dict = {}
    if payload.nom is not None:
        data["nom"] = payload.nom
    if payload.prenom is not None:
        data["prenom"] = payload.prenom
    if payload.langue is not None and payload.langue in ("fr", "en"):
        data["langue"] = payload.langue

    if payload.photo_url is not None and payload.photo_url.strip():
        current_user = await db.user.find_unique(where={"id": user_id})
        if current_user and getattr(current_user, "photo_url", None):
            old_photo = current_user.photo_url
            if old_photo and "/uploads/avatars/" in old_photo:
                old_filename = old_photo.split("/uploads/avatars/")[-1]
                old_path = os.path.join("uploads", "avatars", old_filename)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except Exception as e:
                        logger.warning(f"Could not remove old photo {old_path}: {e}")

        image_uuid = str(uuid.uuid4())
        ext = "jpg"
        photo_str = payload.photo_url
        if "data:image/" in photo_str and ";base64," in photo_str:
            header, base64_data = photo_str.split(";base64,", 1)
            if "png" in header:
                ext = "png"
            elif "webp" in header:
                ext = "webp"
            img_bytes = base64.b64decode(base64_data)
            os.makedirs("uploads/avatars", exist_ok=True)
            file_name = f"{image_uuid}.{ext}"
            file_path = os.path.join("uploads", "avatars", file_name)
            with open(file_path, "wb") as f:
                f.write(img_bytes)
            data["photo_url"] = f"/uploads/avatars/{file_name}"
        else:
            data["photo_url"] = payload.photo_url

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


async def change_password(user_id: str, payload: UserPasswordChangeIn, lang: str = "fr") -> Message:
    from app.core.schemas import Message
    from app.core.security import hash_password, verify_password
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=t("user_not_found", lang),
        )
    if not verify_password(payload.ancien_mot_de_passe, user.motDePasse):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("invalid_current_password", lang),
        )
    new_hashed = hash_password(payload.nouveau_mot_de_passe)
    await db.user.update(
        where={"id": user_id},
        data={"motDePasse": new_hashed},
    )
    return Message(message=t("password_changed_success", lang))


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
                date_inscription=u.dateInscription,
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

