"""Schemas Pydantic du module auth. / Pydantic schemas for the auth module."""

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    nom: str = Field(..., examples=["Nguemo"])
    prenom: str = Field(..., examples=["Aicha"])
    email: EmailStr
    mot_de_passe: str = Field(..., min_length=8, examples=["MotDePasse!123"])
    lang: str = Field(default="fr", description="Language preference: fr or en")


class EmailVerifyIn(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=8)


class EmailResendIn(BaseModel):
    email: EmailStr
    lang: str = Field(default="fr", description="Language preference: fr or en")


class LoginIn(BaseModel):
    email: EmailStr
    mot_de_passe: str
    device_id: str = Field(..., description="Identifiant stable de l'appareil / Stable device identifier.")
    device_name: str = Field(..., examples=["iPhone 13 de Aicha"])
    lang: str = Field(default="fr", description="Language preference: fr or en")


class DeviceVerifyIn(BaseModel):
    email: EmailStr
    code: str
    device_id: str


class RefreshIn(BaseModel):
    refresh_token: str


class PasswordForgotIn(BaseModel):
    email: EmailStr
    lang: str = Field(default="fr", description="Language preference: fr or en")


class PasswordResetIn(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class LogoutIn(BaseModel):
    refresh_token: str


class AuthUserOut(BaseModel):
    """Resume utilisateur inclus dans la reponse d'authentification. / User summary embedded in the auth response."""

    id: str
    nom: str
    prenom: str
    email: EmailStr
    role: str = Field(..., examples=["user"])


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserOut


class DeviceVerificationRequiredOut(BaseModel):
    """FR — Appareil inconnu : un OTP email a ete envoye, jetons non emis.
    EN — Unknown device: an email OTP was sent, no tokens issued yet."""

    requires_device_verification: bool = True
    message_fr: str = "Nouvel appareil détecté : code envoyé par email."
    message_en: str = "New device detected: code sent by email."


class FirebasePhoneVerifyIn(BaseModel):
    """FR — Schema pour la vérification OTP via Firebase Phone Auth.
    EN — Schema for OTP verification via Firebase Phone Auth."""

    phone: str = Field(..., examples=["+237690000000"])
    code: str = Field(..., min_length=4, max_length=8)
    session_info: str | None = Field(default=None, description="Session Firebase (optionnel)")

