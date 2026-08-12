"""Logique metier du module user_phones. / Business logic for the user_phones module."""

import logging

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.db.prisma_client import db
from app.modules.user_phones.schemas import (
    CompromiseIncidentOut,
    UserPhoneAddIn,
    UserPhoneOut,
    UserPhoneVerifyIn,
)
from app.utils.dates import is_expired, minutes_from_now, utcnow
from app.utils.i18n import t
from app.utils.otp import generate_otp, send_sms_otp
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")
settings = get_settings()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_out(p) -> UserPhoneOut:
    return UserPhoneOut(
        id=p.id,
        valeur=p.valeur,
        country_id=p.countryId,
        operator_id=p.operatorId,
        est_verifie=p.estVerifie,
        date_verification=p.dateVerification,
        est_compromis=p.estCompromis,
        created_at=p.createdAt,
    )


async def _detect_operator(valeur: str, country_id: str) -> str | None:
    operators = await db.operator.find_many(
        where={"countryId": country_id},
        include={"prefixes": True},
    )
    country = await db.country.find_unique(where={"id": country_id})
    if country is None:
        return None
    country_code = country.codePays
    local = valeur[len(country_code):] if valeur.startswith(country_code) else valeur
    for op in operators:
        for prefix in (op.prefixes or []):
            if local.startswith(prefix.prefixe):
                return op.id
    return None


async def _create_sms_otp(user_id: str, user_phone_id: str, phone_valeur: str) -> str:
    await db.otpcode.update_many(
        where={"userPhoneId": user_phone_id, "canal": "sms", "estUtilise": False},
        data={"estUtilise": True},
    )
    code = generate_otp()
    await db.otpcode.create(
        data={
            "userId": user_id,
            "userPhoneId": user_phone_id,
            "canal": "sms",
            "cible": phone_valeur,
            "code": code,
            "dateExpiration": minutes_from_now(settings.otp_expire_min),
        }
    )
    return code


# ---------------------------------------------------------------------------
# list_my_phones
# ---------------------------------------------------------------------------

async def list_my_phones(user_id: str) -> list[UserPhoneOut]:
    phones = await db.userphone.find_many(
        where={"userId": user_id},
        order={"createdAt": "asc"},
    )
    return [_to_out(p) for p in phones]


# ---------------------------------------------------------------------------
# add_my_phone
# ---------------------------------------------------------------------------

async def add_my_phone(user_id: str, payload: UserPhoneAddIn, lang: str = "fr") -> UserPhoneOut:
    valeur = normalize_phone(payload.valeur)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("invalid_phone_format", lang),
        )

    existing = await db.userphone.find_unique(where={"valeur": valeur})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("phone_already_attached", lang),
        )

    country = await db.country.find_unique(where={"id": payload.country_id})
    if country is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("country_not_found", lang),
        )

    operator_id = await _detect_operator(valeur, payload.country_id)
    phone = await db.userphone.create(
        data={
            "userId": user_id,
            "valeur": valeur,
            "countryId": payload.country_id,
            "operatorId": operator_id,
        }
    )

    code = await _create_sms_otp(user_id, phone.id, valeur)
    await send_sms_otp(valeur, code)
    return _to_out(phone)


# ---------------------------------------------------------------------------
# verify_my_phone
# ---------------------------------------------------------------------------

async def verify_my_phone(user_id: str, phone_id: str, payload: UserPhoneVerifyIn, lang: str = "fr") -> UserPhoneOut:
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))

    otp = await db.otpcode.find_first(
        where={
            "userPhoneId": phone_id,
            "canal": "sms",
            "code": payload.code,
            "estUtilise": False,
        }
    )
    if otp is None or is_expired(otp.dateExpiration):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("otp_invalid_or_expired", lang),
        )

    now = utcnow()
    await db.otpcode.update(where={"id": otp.id}, data={"estUtilise": True})
    phone = await db.userphone.update(
        where={"id": phone_id},
        data={"estVerifie": True, "dateVerification": now},
    )
    return _to_out(phone)


# ---------------------------------------------------------------------------
# resend_my_phone_otp
# ---------------------------------------------------------------------------

async def resend_my_phone_otp(user_id: str, phone_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))
    if phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("phone_already_verified", lang),
        )

    code = await _create_sms_otp(user_id, phone.id, phone.valeur)
    await send_sms_otp(phone.valeur, code)
    return Message(
        message_fr=t("otp_sms_resent", "fr"),
        message_en=t("otp_sms_resent", "en"),
    )


# ---------------------------------------------------------------------------
# remove_my_phone
# ---------------------------------------------------------------------------

async def remove_my_phone(user_id: str, phone_id: str, lang: str = "fr"):
    from app.core.schemas import Message
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))

    await db.otpcode.update_many(
        where={"userPhoneId": phone_id, "estUtilise": False},
        data={"estUtilise": True},
    )
    await db.userphone.delete(where={"id": phone_id})
    return Message(
        message_fr=t("phone_removed", "fr"),
        message_en=t("phone_removed", "en"),
    )


# ---------------------------------------------------------------------------
# declare_my_phone_compromised
# ---------------------------------------------------------------------------

async def declare_my_phone_compromised(user_id: str, phone_id: str, lang: str = "fr") -> CompromiseIncidentOut:
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))
    if not phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("phone_not_verified_for_compromise", lang),
        )
    if phone.estCompromis:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=t("phone_already_compromised", lang),
        )

    await db.userphone.update(where={"id": phone_id}, data={"estCompromis": True})
    incident = await db.compromiseincident.create(
        data={"userId": user_id, "userPhoneId": phone_id}
    )

    from app.core.audit_log import log_audit
    await log_audit(user_id, "compromise_phone", cible=phone_id)

    return CompromiseIncidentOut(
        id=incident.id,
        user_phone_id=incident.userPhoneId,
        date_declaration=incident.dateDeclaration,
        statut=incident.statut,
    )
