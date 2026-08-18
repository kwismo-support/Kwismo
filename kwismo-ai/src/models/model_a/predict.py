"""Inférence du Modèle A (scoring de réputation comportemental et temporel).

Le modèle A renvoie uniquement (score_risque, explications, modele_utilise).
Le statut (securise | a_signaler | frauduleux) est géré exclusivement par le backend.

Règle de sécurité absolue : Si le numéro a 1 seul signalement (ou 0),
le score_risque ne peut JAMAIS dépasser 0.69 (cap strictly < 0.70).
"""

from typing import Any
import pandas as pd

from src.api.loader import load_model_a
from src.data.features import FEATURE_COLUMNS, compute_temporal_features
from src.models.model_a.rules import calculate_expert_score


def predict(data: dict[str, Any]) -> tuple[float, list[str], str]:
    """Inférence du Modèle A (Score de réputation 0.0 - 1.0 + Explications)."""
    features = compute_temporal_features(data)
    num_sig = features["nombre_signalements"]
    statut_admin = features.get("statut_communautaire", "aucun")

    model = load_model_a()
    if model is not None:
        try:
            df_feat = pd.DataFrame([features])[FEATURE_COLUMNS]
            prob = float(model.predict_proba(df_feat)[0][1])
            score_final = round(prob, 2)
            modele_utilise = "lightgbm_v1"

            # Génération d'explications d'explicabilité
            explications = []
            if features["ratio_verif_signalement"] >= 15.0 and features["vitesse_verifications"] >= 3.0:
                explications.append(f"Alerte Risque Émergent : Pic soudain de {features['nombre_verifications']} vérifications récurrentes.")
            elif features["nombre_verifications"] >= 10:
                explications.append(f"Forte hausse des recherches d'utilisateurs ({features['nombre_verifications']} vérifications).")

            if num_sig > features["diversite_devices"] and features["diversite_devices"] > 0:
                explications.append(f"Anti-Vengeance activé ({num_sig} signalements issus de {features['diversite_devices']} appareil(s)).")

            if num_sig >= 2:
                explications.append(f"Numéro signalé par {features['diversite_signaleurs']} personnes distinctes ({features['signalements_effectifs_ponderes']} signalements récents).")
            elif num_sig == 1:
                explications.append("Signalement unique enregistré sur ce numéro.")

            if features["gravite_categories"] >= 0.7:
                explications.append("Détection de manœuvres d'escroquerie par l'analyse NLP.")
        except Exception:
            score_final, explications = calculate_expert_score(features)
            modele_utilise = "regles_expertes"
    else:
        score_final, explications = calculate_expert_score(features)
        modele_utilise = "regles_expertes"

    # Réduction si marchand/officiel
    if statut_admin in ("verifie_officiel", "marchand_agrée"):
        score_final = round(score_final * 0.5, 2)
        if "Réduction de score appliquée (Marchand / Compte Officiel vérifié)." not in explications:
            explications.append("Réduction de score appliquée (Marchand / Compte Officiel vérifié).")

    # 🔒 RÈGLE DE SÉCURITÉ ABSOLUE :
    # Quel que soit le modèle ou le contexte, 1 seul signalement (ou 0) => score <= 0.69
    if num_sig <= 1:
        if score_final > 0.69:
            score_final = 0.69
            if "Plafonnement de sécurité appliqué (signalement unique <= 0.69)." not in explications:
                explications.append("Plafonnement de sécurité appliqué (signalement unique <= 0.69).")

    if not explications:
        explications.append("Analyse comportementale effectuée avec succès.")

    return score_final, explications, modele_utilise
