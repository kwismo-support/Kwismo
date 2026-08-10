"""Dependances specifiques a l'auth. / Auth-specific dependencies.

FR — Ex. resoudre l'utilisateur cible d'un jeton de rafraichissement ou
d'un jeton de reinitialisation de mot de passe (distinct de
`get_current_user`, qui lit le jeton d'acces Bearer).
EN — E.g. resolving the target user of a refresh token or a password-reset
token (distinct from `get_current_user`, which reads the Bearer access
token).
"""

from app.core.exceptions import not_implemented


async def get_user_from_refresh_token(refresh_token: str):
    raise not_implemented()


async def get_user_from_reset_token(token: str):
    raise not_implemented()
