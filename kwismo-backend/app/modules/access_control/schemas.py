"""Schemas Pydantic du module access_control. / Pydantic schemas for the access_control module.

Tables Prisma : Role, AccessRight. / Prisma tables: Role, AccessRight.
"""

from pydantic import BaseModel, Field


class RoleOut(BaseModel):
    """Table Role. / Role table."""

    id: str
    nom_role: str = Field(..., examples=["partner"])


class RoleIn(BaseModel):
    nom_role: str


class AccessRightOut(BaseModel):
    """Table AccessRight. / AccessRight table."""

    id: str
    role_id: str
    permission: str = Field(..., examples=["reports:validate"])
    description: str | None = None


class AccessRightIn(BaseModel):
    role_id: str
    permission: str
    description: str | None = None
