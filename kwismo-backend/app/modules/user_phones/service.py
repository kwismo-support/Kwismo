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
    """Tente de detecter l'operateur a partir des prefixes connus pour ce pays."""
    operators = await db.operator.find_many(
        where={"countryId": country_id},
        include={"prefixes": True},
    )
    country = await db.country.find_unique(where={"id": country_id})
    if country is None:
        return None
    country_code = country.codePays  # ex. "+237"
    local = valeur
    if local.startswith(country_code):
        local = local[len(country_code):]
    for op in operators:
        for prefix in (op.prefixes or []):
            if local.startswith(prefix.prefixe):
                return op.id
    return None


async def _create_sms_otp(user_id: str, user_phone_id: str, phone_valeur: str) -> str:
    """Invalide les OTP SMS precedents pour ce UserPhone, cree un nouveau code."""
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

async def add_my_phone(user_id: str, payload: UserPhoneAddIn) -> UserPhoneOut:
    valeur = normalize_phone(payload.valeur)
    if not is_valid_phone(valeur):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de numero invalide (E.164 attendu) / Invalid phone format (E.164 expected).",
        )

    # Unicite globale : un numero = un seul compte KWISMO.
    existing = await db.userphone.find_unique(where={"valeur": valeur})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce numero est deja rattache a un compte / This number is already attached to an account.",
        )

    # Verifier que le pays existe.
    country = await db.country.find_unique(where={"id": payload.country_id})
    if country is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pays introuvable / Country not found.",
        )

    # Detection automatique de l'operateur.
    operator_id = await _detect_operator(valeur, payload.country_id)

    # Creer le UserPhone (non verifie).
    phone = await db.userphone.create(
        data={
            "userId": user_id,
            "valeur": valeur,
            "countryId": payload.country_id,
            "operatorId": operator_id,
        }
    )

    # Envoyer l'OTP SMS.
    code = await _create_sms_otp(user_id, phone.id, valeur)
    await send_sms_otp(valeur, code)

    return _to_out(phone)


# ---------------------------------------------------------------------------
# verify_my_phone
# ---------------------------------------------------------------------------

async def verify_my_phone(user_id: str, phone_id: str, payload: UserPhoneVerifyIn) -> UserPhoneOut:
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Numero introuvable / Phone not found.")

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
            detail="Code OTP invalide ou expire / Invalid or expired OTP code.",
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

async def resend_my_phone_otp(user_id: str, phone_id: str):
    from app.core.schemas import Message
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Numero introuvable / Phone not found.")
    if phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce numero est deja verifie / This number is already verified.",
        )

    code = await _create_sms_otp(user_id, phone.id, phone.valeur)
    await send_sms_otp(phone.valeur, code)
    return Message(
        message_fr="Nouveau code OTP SMS envoyé.",
        message_en="New SMS OTP sent.",
    )


# ---------------------------------------------------------------------------
# remove_my_phone
# ---------------------------------------------------------------------------

async def remove_my_phone(user_id: str, phone_id: str):
    from app.core.schemas import Message
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Numero introuvable / Phone not found.")

    # Invalider les OTP associes avant suppression.
    await db.otpcode.update_many(
        where={"userPhoneId": phone_id, "estUtilise": False},
        data={"estUtilise": True},
    )
    await db.userphone.delete(where={"id": phone_id})
    return Message(
        message_fr="Numéro retiré du compte.",
        message_en="Number removed from account.",
    )


# ---------------------------------------------------------------------------
# declare_my_phone_compromised
# ---------------------------------------------------------------------------

async def declare_my_phone_compromised(user_id: str, phone_id: str) -> CompromiseIncidentOut:
    phone = await db.userphone.find_unique(where={"id": phone_id})
    if phone is None or phone.userId != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Numero introuvable / Phone not found.")
    if not phone.estVerifie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seul un numero verifie peut etre declare compromis / Only a verified number can be declared compromised.",
        )
    if phone.estCompromis:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce numero est deja marque comme compromis / This number is already marked as compromised.",
        )

    # Marquer le numero compromis.
    await db.userphone.update(where={"id": phone_id}, data={"estCompromis": True})

    # Creer l'incident.
    incident = await db.compromiseincident.create(
        data={
            "userId": user_id,
            "userPhoneId": phone_id,
        }
    )

    from app.core.audit_log import log_audit
    await log_audit(user_id, "compromise_phone", cible=phone_id)

    return CompromiseIncidentOut(
        id=incident.id,
        user_phone_id=incident.userPhoneId,
        date_declaration=incident.dateDeclaration,
        statut=incident.statut,
    )
