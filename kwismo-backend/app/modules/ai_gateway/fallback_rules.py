"""Regles expertes de repli si le service IA est indisponible. / Expert fallback rules if the AI service is unavailable.

FR — Memes principes que le demarrage a froid du Modele A cote IA : un
numero tres signale ou avec une incoherence pays/operateur/prefixe est
mis en prudence sans attendre l'IA.
EN — Same principles as the AI's Model A cold-start: a heavily-reported
number, or one with a country/operator/prefix mismatch, is flagged
without waiting on the AI.
"""

from app.modules.ai_gateway.schemas import PredictNumberOut, PredictTextOut

SIGNALEMENTS_THRESHOLD = 3


def score_number_fallback(nombre_signalements: int, coherence_ok: bool) -> PredictNumberOut:
    if nombre_signalements >= SIGNALEMENTS_THRESHOLD or not coherence_ok:
        statut = "a_signaler"
        score = 0.7
    else:
        statut = "securise"
        score = 0.1
    return PredictNumberOut(
        score_risque=score,
        statut=statut,
        modele_utilise="regles_expertes",
        explications=["Repli sur les règles expertes (service IA indisponible)."],
    )


def score_text_fallback(texte: str) -> PredictTextOut:
    est_arnaque = any(mot in texte.lower() for mot in ("otp", "code", "gagné", "gagne", "urgent"))
    return PredictTextOut(
        probabilite_arnaque=0.6 if est_arnaque else 0.1,
        est_arnaque=est_arnaque,
        modele_utilise="regles_expertes",
    )
