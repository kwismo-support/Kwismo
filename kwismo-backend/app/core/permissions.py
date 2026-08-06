"""RBAC : dependances require_role(...). / RBAC: require_role(...) dependencies.

FR — user / partner / admin (cf. cahier des charges Backend §8.2). Chaque
route protegee declare explicitement le(s) role(s) requis via
`Depends(require_roles("admin"))`.

EN — user / partner / admin (see Backend spec §8.2). Every protected route
explicitly declares its required role(s) via `Depends(require_roles("admin"))`.
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
