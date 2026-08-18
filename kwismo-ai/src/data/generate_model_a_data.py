"""Générateur de dataset comportemental et temporel pour le Modèle A.

Produit un fichier data/processed/model_a_dataset.csv équilibré contenant 1000 numéros
avec métriques de vérifications, signalements récents, diversité et gravité.
"""

import random
from pathlib import Path
import pandas as pd

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_a_dataset.csv"


def generate_dataset(num_samples: int = 1000) -> pd.DataFrame:
    """Génère num_samples exemples comportementaux avec étiquettes de risque (label)."""
    random.seed(42)
    rows = []

    for idx in range(num_samples):
        # 50% Légitimes / 50% Suspects-Frauduleux
        is_scam = idx % 2 == 1

        if is_scam:
            num_sig = random.randint(2, 20)
            num_verif = random.randint(5, 50)
            vitesse_verif = random.uniform(2.0, 15.0)
            vitesse_sig = random.uniform(1.0, 8.0)
            anciennete = random.randint(1, 30)
            diversite = max(1, num_sig - random.randint(0, 2))
            gravite = random.choice([0.7, 0.75, 0.8, 1.0])
            label = 1
        else:
            num_sig = random.choice([0, 0, 0, 1])
            num_verif = random.randint(0, 4)
            vitesse_verif = random.uniform(0.0, 1.0)
            vitesse_sig = random.uniform(0.0, 0.5)
            anciennete = random.randint(10, 365)
            diversite = num_sig
            gravite = random.choice([0.0, 0.0, 0.0, 0.5])
            label = 0

        ratio_verif_sig = float(num_verif) / float(max(num_sig, 1))

        rows.append({
            "numero": f"2376{random.randint(5, 9)}{random.randint(1000000, 9999999)}",
            "nombre_signalements": num_sig,
            "vitesse_signalements": vitesse_sig,
            "anciennete_jours": anciennete,
            "diversite_signaleurs": diversite,
            "nombre_verifications": num_verif,
            "vitesse_verifications": vitesse_verif,
            "ratio_verif_signalement": ratio_verif_sig,
            "gravite_categories": gravite,
            "label": label,
        })

    df = pd.DataFrame(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    print(f"Dataset Modèle A généré ({len(df)} numéros) : {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate_dataset()
