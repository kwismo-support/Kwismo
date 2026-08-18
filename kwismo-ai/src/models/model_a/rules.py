"""Règles expertes — Démarrage à froid & Filet de sécurité du Modèle A.

Implémente :
- Anti-Vengeance (Déduplication Device Fingerprint).
- Décroissance Temporelle Exponentielle.
- Risque Émergent (Ratio de paresse Vérification / Signalement).
- Reduction Admin (-50%).
- Plafonnement absolu de sécurité (<= 0.69 en cas de signalement unique).
"""

from typing import Any


def calculate_expert_score(features: dict[str, Any]) -> tuple[float, list[str]]:
    """Retourne (score_risque, explications). Le statut est géré par le backend."""
    num_sig = int(features.get("nombre_signalements", 0))
    sig_eff = float(features.get("signalements_effectifs_ponderes", num_sig))
    num_verif = int(features.get("nombre_verifications", 0))
    verif_pond = float(features.get("verifications_ponderees", num_verif))
    vitesse_verif = float(features.get("vitesse_verifications", 0.0))
    vitesse_sig = float(features.get("vitesse_signalements", 0.0))
    ratio_paresse = float(features.get("ratio_verif_signalement", 0.0))
    gravite = float(features.get("gravite_categories", 0.0))
    diversite_devices = int(features.get("diversite_devices", num_sig))
    statut_admin = str(features.get("statut_communautaire", "aucun"))

    explications = []
    base_score = 0.05

    # 1. Anti-Vengeance & Déduplication d'appareils
    if num_sig > diversite_devices and diversite_devices > 0:
        explications.append(f"Anti-Vengeance activé : {num_sig} signalements regroupés sur {diversite_devices} appareil(s) distinct(s).")

    # 2. Analyse des vérifications récentes (paresse & pic récent)
    if ratio_paresse >= 15.0 and vitesse_verif >= 3.0:
        base_score += 0.25
        explications.append(f"Alerte Risque Émergent : Pic soudain de {num_verif} vérifications sans signalements rédigés.")
    elif verif_pond >= 10.0 or vitesse_verif >= 4.0:
        base_score += 0.20
        explications.append(f"Volume élevé de vérifications d'utilisateurs ({num_verif} recherches).")
    elif verif_pond >= 3.0:
        base_score += 0.10
        explications.append("Vérifications récurrentes enregistrées sur ce numéro.")

    # 3. Signalements pondérés & Décroissance temporelle
    if sig_eff >= 4.0:
        base_score += 0.40
        explications.append(f"Numéro confirmé suspect par des signalements récents ({sig_eff:.1f} signalements pondérés).")
    elif sig_eff >= 1.5:
        base_score += 0.25
        explications.append(f"Signalements multiples récents enregistrés ({sig_eff:.1f} signalements pondérés).")
    elif num_sig == 1:
        base_score += 0.15
        explications.append("Premier signalement enregistré sur ce numéro.")

    # 4. Prise en compte de la gravité des catégories du Modèle B
    if gravite >= 0.9:
        base_score += 0.25
        explications.append("Tentative de fraude critique détectée par l'IA (vol de PIN OTP / SIM Swap).")
    elif gravite >= 0.7:
        base_score += 0.15
        explications.append("Manœuvre d'escroquerie détectée par l'analyse NLP.")

    score_final = min(max(base_score, 0.05), 1.0)

    # 5. Réduction si statut administrateur / marchand vérifié
    if statut_admin in ("verifie_officiel", "marchand_agrée"):
        score_final = score_final * 0.5
        explications.append("Réduction de score appliquée (Marchand / Compte Officiel vérifié).")

    # 🔒 RÈGLE DE SÉCURITÉ ABSOLUE :
    # Si le numéro n'a qu'un seul signalement (ou 0), le score NE PEUT PAS dépasser 0.69.
    if num_sig <= 1:
        if score_final > 0.69:
            score_final = 0.69
            explications.append("Plafonnement de sécurité appliqué (signalement unique <= 0.69).")

    if not explications:
        explications.append("Aucun indice de risque détecté sur ce numéro.")

    return round(score_final, 2), explications
