import logging

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.schemas import Message
from app.db.prisma_client import connect_db, db
from app.modules.user_phones.schemas import (
    CompromiseIncidentOut,
    UserPhoneAddIn,
    UserPhoneOut,
    UserPhoneVerifyIn,
)
from app.utils.dates import is_expired, minutes_from_now, utcnow
from app.utils.i18n import t
from app.utils.otp import check_sms_otp, generate_otp, send_sms_otp
from app.utils.phone import is_valid_phone, normalize_phone

logger = logging.getLogger("kwismo.backend")
settings = get_settings()


def _to_out(p) -> UserPhoneOut:
    c_code = p.country.codePays if getattr(p, "country", None) else None
    c_nom = p.country.nom if getattr(p, "country", None) else None
    op_nom = p.operator.nom if getattr(p, "operator", None) else None
    return UserPhoneOut(
        id=p.id,
        valeur=p.valeur,
        country_id=p.countryId,
        country_code=c_code,
        country_name=c_nom,
        operator_id=p.operatorId,
        operator_name=op_nom,
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


async def list_my_phones(user_id: str) -> list[UserPhoneOut]:
    await connect_db()
    phones = await db.userphone.find_many(
        where={"userId": user_id},
        include={"country": True, "operator": True},
        order={"createdAt": "asc"},
    )
    return [_to_out(p) for p in phones]


async def _resolve_country_id(valeur: str, lang: str = "fr") -> str:
    countries = await db.country.find_many()
    for c in countries:
        if valeur.startswith(c.codePays):
            return c.id

    default_country = await db.country.find_first(where={"estParDefaut": True})
    if default_country is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("country_not_found", lang),
        )
    return default_country.id


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

    country_id = await _resolve_country_id(valeur, lang)
    operator_id = await _detect_operator(valeur, country_id)

    phone = await db.userphone.create(
        data={
            "userId": user_id,
            "valeur": valeur,
            "countryId": country_id,
            "operatorId": operator_id,
            "estVerifie": False,
        }
    )

    code = await _create_sms_otp(user_id, phone.id, valeur)
    user = await db.user.find_unique(where={"id": user_id})
    user_email = user.email if user else None

    try:
        await send_sms_otp(valeur, code=code, email=user_email)
    except Exception as exc:
        logger.warning("Notification OTP SMS/Email non envoyee pour %s : %s", valeur, exc)

    return _to_out(phone)


async def verify_my_phone(user_id: str, phone_id: str, payload: UserPhoneVerifyIn, lang: str = "fr") -> Message:
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))
    if phone.estVerifie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=t("phone_already_verified", lang))

    stored_otp = await db.otpcode.find_first(
        where={"userPhoneId": phone_id, "canal": "sms", "code": payload.code, "estUtilise": False}
    )

    if stored_otp is not None and not is_expired(stored_otp.dateExpiration):
        await db.otpcode.update(where={"id": stored_otp.id}, data={"estUtilise": True})
        valid = True
    else:
        valid = await check_sms_otp(phone.valeur, payload.code)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("otp_invalid_or_expired", lang),
        )

    now = utcnow()
    await db.userphone.update(
        where={"id": phone_id},
        data={"estVerifie": True, "dateVerification": now},
    )
    return Message(
        message_fr=t("phone_verified", "fr"),
        message_en=t("phone_verified", "en"),
    )


async def resend_my_phone_otp(user_id: str, phone_id: str, lang: str = "fr"):
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=t("phone_not_found", lang))
    if phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=t("phone_already_verified", lang),
        )
    user = await db.user.find_unique(where={"id": user_id})
    user_email = user.email if user else None

    code = await _create_sms_otp(user_id, phone_id, phone.valeur)
    await send_sms_otp(phone.valeur, code=code, email=user_email)

    return Message(
        message_fr=t("otp_sms_resent", "fr"),
        message_en=t("otp_sms_resent", "en"),
    )


async def remove_my_phone(user_id: str, phone_id: str, lang: str = "fr"):
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
