"""Logique d'affiliation par prefixes. / Prefix-based affiliation logic.

FR — Determine si un numero (ou son prefixe) correspond au perimetre d'un
partenaire (ex. "69", "651-654"). Seule cette fonction doit decider du
cloisonnement ; jamais un filtre ad hoc dans une route.
EN — Determines whether a number (or its prefix) falls within a partner's
scope (e.g. "69", "651-654"). Only this function should decide scoping;
never an ad hoc filter in a route.
"""


def prefix_matches(numero_prefix: str, regle_prefix: str) -> bool:
    """`regle_prefix` peut etre un prefixe exact ("69") ou une plage ("651-654")."""

    if "-" in regle_prefix:
        start, end = regle_prefix.split("-", 1)
        return start <= numero_prefix <= end
    return numero_prefix.startswith(regle_prefix)


def is_number_in_partner_scope(numero_prefix: str, regles_prefixes: list[str]) -> bool:
    return any(prefix_matches(numero_prefix, regle) for regle in regles_prefixes)
