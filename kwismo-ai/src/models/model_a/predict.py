"""Inférence du Modèle A (scoring de réputation comportemental, temporel & analyse de graphe).

Le modèle A renvoie uniquement (score_risque, explications, modele_utilise).
Le statut (securise | a_signaler | frauduleux) est géré exclusivement par le backend.

Règle de sécurité absolue : Si le numéro a 1 seul signalement (ou 0),
le score_risque ne peut JAMAIS dépasser 0.69 (cap strictly < 0.70).
"""

from typing import Any
import pandas as pd

from src.api.loader import load_model_a
from src.data.features import FEATURE_COLUMNS, compute_temporal_features
from src.data.graph import get_network_risk_bonus
from src.models.model_a.rules import calculate_expert_score


def predict(data: dict[str, Any]) -> tuple[float, list[str], str]:
    """Inférence du Modèle A (Score de réputation 0.0 - 1.0 + Explications)."""
    numero = str(data.get("numero", ""))
    features = compute_temporal_features(data)
    num_sig = features["nombre_signalements"]
    statut_admin = features.get("statut_communautaire", "aucun")

    expert_score, explications = calculate_expert_score(features)

    model = load_model_a()
    if model is not None:
        try:
            df_feat = pd.DataFrame([features])[FEATURE_COLUMNS]
            prob_lgb = float(model.predict_proba(df_feat)[0][1])
            
            # Équilibrage d'ensemble (65% ML calibré + 35% Heuristiques comportementales)
            blended_score = 0.65 * prob_lgb + 0.35 * expert_score
            score_final = round(min(max(blended_score, 0.05), 0.95), 2)
            modele_utilise = "lightgbm_v1"

            # Enrichissement des explications
            if features["ratio_verif_signalement"] >= 15.0 and features["vitesse_verifications"] >= 3.0:
                if "Alerte Risque Émergent" not in " ".join(explications):
                    explications.append(f"Alerte Risque Émergent : Pic de {features['nombre_verifications']} vérifications récurrentes.")
        except Exception:
            score_final = expert_score
            modele_utilise = "regles_expertes"
    else:
        score_final = expert_score
        modele_utilise = "regles_expertes"

    # Analyse de Graphe (Bonus réseau contrôlé +0.0 à +0.15)
    net_bonus, net_expl = get_network_risk_bonus(numero)
    if net_bonus > 0.0:
        score_final = round(min(score_final + net_bonus, 0.95), 2)
        if net_expl and net_expl not in explications:
            explications.append(net_expl)

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
