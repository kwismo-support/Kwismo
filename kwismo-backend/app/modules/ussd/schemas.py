"""Schemas Pydantic du module ussd. / Pydantic schemas for the ussd module.

Tables Prisma : Country, Operator, OperatorPrefix, UssdAction.
Prisma tables: Country, Operator, OperatorPrefix, UssdAction.
"""

from pydantic import BaseModel, Field


class CountryOut(BaseModel):
    """Table Country. / Country table."""

    id: str
    nom: str = Field(..., examples=["Cameroun"])
    code_pays: str = Field(..., examples=["+237"])
    est_par_defaut: bool


class CountryIn(BaseModel):
    nom: str
    code_pays: str
    est_par_defaut: bool = False


class OperatorPrefixOut(BaseModel):
    """Table OperatorPrefix. / OperatorPrefix table."""

    id: str
    prefixe: str = Field(..., examples=["67"])


class OperatorOut(BaseModel):
    """Table Operator. / Operator table."""

    id: str
    nom: str = Field(..., examples=["MTN Cameroun"])
    country_id: str
    prefixes: list[OperatorPrefixOut] = []


class OperatorIn(BaseModel):
    nom: str
    country_id: str
    prefixes: list[str] = Field(default_factory=list, examples=[["67", "650", "651"]])


class UssdActionOut(BaseModel):
    """Table UssdAction. / UssdAction table."""

    id: str
    operator_id: str
    nom_action: str = Field(..., examples=["Transfert Mobile Money"])
    code_ussd: str = Field(..., examples=["*126#"])
    format: str = Field(..., examples=["*126*{montant}*{numero}#"])


class UssdActionIn(BaseModel):
    operator_id: str
    nom_action: str
    code_ussd: str
    format: str
