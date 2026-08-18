"""Générateur de dataset comportemental et temporel réaliste et continu pour le Modèle A.

Utilise une fonction de risque logistique continue avec bruit réaliste (Platt-style)
pour éviter les sur-ajustements binationaux déterministes (0.0 / 1.0) et produire des probabilités douces.
"""

import random
import math
from pathlib import Path
import pandas as pd

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_a_dataset.csv"


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(min(x, 15.0), -15.0)))


def generate_dataset(num_samples: int = 1200) -> pd.DataFrame:
    """Génère num_samples exemples comportementaux avec distribution logistique continue."""
    random.seed(42)
    rows = []

    for idx in range(num_samples):
        # Génération variée des variables indépendantes
        num_sig = random.choice([0, 0, 0, 1, 1, 2, 3, 4, 5, 8, 12, 20])
        num_verif = random.choice([0, 1, 2, 3, 5, 10, 15, 25, 40, 60])
        anciennete = random.randint(1, 365)
        
        # Diversité des appareils & signaleurs
        if num_sig > 0:
            diversite_devices = max(1, num_sig - random.randint(0, min(num_sig - 1, 3)))
            diversite_sig = max(1, num_sig - random.randint(0, min(num_sig - 1, 2)))
        else:
            diversite_devices = 0
            diversite_sig = 0

        sig_eff = min(float(num_sig), float(diversite_devices)) if diversite_devices > 0 else float(num_sig)
        verif_pond = float(num_verif) * random.uniform(0.6, 1.0)
        
        vitesse_sig = float(num_sig) / max(float(anciennete) / 30.0, 1.0)
        vitesse_verif = float(num_verif) / max(float(anciennete) / 30.0, 1.0)
        ratio_verif_sig = verif_pond / max(sig_eff, 1.0)

        # Gravité selon le nombre de signalements
        if num_sig > 0:
            gravite = random.choice([0.0, 0.5, 0.7, 0.75, 0.8, 1.0])
        else:
            gravite = 0.0

        # Fonction Logistique de Risque Réel avec Bruit Gaussien
        logit = (
            -2.5
            + 0.75 * sig_eff
            + 0.06 * verif_pond
            + 0.15 * vitesse_verif
            + 0.20 * vitesse_sig
            + 1.8 * gravite
            + random.gauss(0, 0.8)  # Bruit aléatoire de variabilité humaine
        )
        
        prob_scam = sigmoid(logit)
        label = 1 if prob_scam >= 0.50 else 0

        rows.append({
            "numero": f"2376{random.randint(5, 9)}{random.randint(1000000, 9999999)}",
            "nombre_signalements": num_sig,
            "signalements_effectifs_ponderes": round(sig_eff, 2),
            "vitesse_signalements": round(vitesse_sig, 2),
            "anciennete_jours": anciennete,
            "diversite_signaleurs": diversite_sig,
            "diversite_devices": diversite_devices,
            "nombre_verifications": num_verif,
            "verifications_ponderees": round(verif_pond, 2),
            "vitesse_verifications": round(vitesse_verif, 2),
            "ratio_verif_signalement": round(ratio_verif_sig, 2),
            "gravite_categories": gravite,
            "label": label,
        })

    df = pd.DataFrame(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    print(f"Dataset Modèle A calibré généré ({len(df)} numéros) : {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate_dataset()
