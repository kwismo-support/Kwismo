"""Regles expertes — demarrage a froid. / Expert rules — cold start.

FR — Utilisees tant que le Modele A n'a pas assez de donnees pour etre
fiable ; restent ensuite en filet de securite (cf. cahier §5).
EN — Used while Model A doesn't have enough data to be reliable yet; stay
on afterwards as a safety net.
"""

SIGNALEMENTS_THRESHOLD = 3


def score(nombre_signalements: int, coherence_pays_operateur: bool) -> tuple[float, str]:
    if nombre_signalements >= SIGNALEMENTS_THRESHOLD or not coherence_pays_operateur:
        return 0.7, "a_signaler"
    return 0.1, "securise"
