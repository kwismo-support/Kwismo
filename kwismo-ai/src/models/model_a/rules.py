"""Règles expertes — Démarrage à froid & Filet de sécurité du Modèle A.

Règle absolue : Quel que soit le contexte, un numéro avec 1 seul signalement (ou moins)
ne peut JAMAIS dépasser un score de risque de 0.69 (cap strictly < 0.70).
"""

from typing import Any


def calculate_expert_score(features: dict[str, Any]) -> tuple[float, list[str]]:
    """Retourne (score_risque, explications). Le statut est géré par le backend."""
    num_sig = int(features.get("nombre_signalements", 0))
    num_verif = int(features.get("nombre_verifications", 0))
    vitesse_verif = float(features.get("vitesse_verifications", 0.0))
    vitesse_sig = float(features.get("vitesse_signalements", 0.0))
    gravite = float(features.get("gravite_categories", 0.0))
    diversite = int(features.get("diversite_signaleurs", num_sig))

    explications = []
    base_score = 0.05

    # 1. Analyse des vérifications récentes (utilisateurs inquiets / paresseux)
    if num_verif >= 15 or vitesse_verif >= 5.0:
        base_score += 0.35
        explications.append(f"Pic élevé de vérifications d'utilisateurs ({num_verif} recherches révisées).")
    elif num_verif >= 5 or vitesse_verif >= 2.0:
        base_score += 0.20
        explications.append(f"Volume de vérifications communautaires en hausse ({num_verif} recherches).")

    # 2. Analyse des signalements & diversité des signaleurs
    if num_sig >= 5:
        base_score += 0.40
        explications.append(f"Numéro signalé par {diversite} personnes distinctes ({num_sig} plaintes).")
    elif num_sig >= 2:
        base_score += 0.25
        explications.append(f"Signalements multiples enregistrés ({num_sig} plaintes).")
    elif num_sig == 1:
        base_score += 0.15
        explications.append("Premier signalement enregistré sur ce numéro.")

    # 3. Prise en compte de la gravité des catégories du Modèle B
    if gravite >= 0.9:
        base_score += 0.25
        explications.append("Détection de tentative de fraude à haut risque (vol de code PIN / SIM Swap).")
    elif gravite >= 0.7:
        base_score += 0.15
        explications.append("Détection de manœuvres d'escroquerie (loterie / faux emploi / faux transfert).")

    score_final = min(max(base_score, 0.05), 1.0)

    # 🔒 RÈGLE DE SÉCURITÉ ABSOLUE :
    # Si le numéro n'a qu'un seul signalement (ou 0), le score NE PEUT PAS dépasser 0.69.
    if num_sig <= 1:
        score_final = min(score_final, 0.69)
        if score_final == 0.69:
            explications.append("Plafonnement de sécurité appliqué (signalement unique <= 0.69).")

    if not explications:
        explications.append("Aucun indice de risque détecté sur ce numéro.")

    return round(score_final, 2), explications
