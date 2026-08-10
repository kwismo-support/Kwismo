"""RBAC : dependances require_roles(...). / RBAC: require_roles(...) dependencies.

FR — Roles : user / partner / admin. Chaque route protegee declare le(s)
role(s) requis via `Depends(require_roles("admin"))`.
EN — Roles: user / partner / admin. Every protected route declares its
required role(s) via `Depends(require_roles("admin"))`.
"""

from fastapi import Depends, HTTPException, status

from app.core.security import CurrentUser, get_current_user


def require_roles(*roles: str):
    """Retourne une dependance qui exige un des roles donnes. / Returns a dependency requiring one of the given roles."""

    async def _dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role requis: {', '.join(roles)} / Required role: {', '.join(roles)}."
                ),
            )
        return user

    return _dependency
