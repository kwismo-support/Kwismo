"""Générateur de dataset comportemental et temporel complet et continu pour le Modèle A.

Génère 1 200 numéros avec :
1. Listes d'horodatages ISO8601 complètes (horodatages_verifications et horodatages_signalements).
2. Intervalles de temps calculés en secondes (intervalle_moyen_verif_sec, intervalle_min_verif_sig_sec).
3. Probabilités logistiques douces avec bruit gaussien réaliste (Platt Scaling).
"""

import math
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
import pandas as pd

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "model_a_dataset.csv"


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(min(x, 15.0), -15.0)))


def generate_timestamps(base_time: datetime, count: int, is_rapid_spike: bool, max_days: int) -> list[str]:
    """Génère une liste de count horodatages ISO 8601 triés chronologiquement."""
    if count <= 0:
        return []

    timestamps = []
    current_time = base_time - timedelta(days=random.uniform(0.1, max_days))

    for idx in range(count):
        if is_rapid_spike:
            # Vérifications très rapprochées (entre 10 et 120 secondes d'écart)
            gap_seconds = random.uniform(10.0, 120.0)
        else:
            # Vérifications ou signalements normaux étalés sur plusieurs jours
            gap_seconds = (max_days * 86400.0 / max(count, 1)) * random.uniform(0.5, 1.5)

        current_time += timedelta(seconds=gap_seconds)
        timestamps.append(current_time.strftime("%Y-%m-%dT%H:%M:%SZ"))

    return timestamps


def generate_dataset(num_samples: int = 1200) -> pd.DataFrame:
    """Génère num_samples exemples comportementaux avec horodatages complets et probabilités logistiques denses."""
    random.seed(42)
    rows = []
    now = datetime.now(timezone.utc)

    for idx in range(num_samples):
        # Génération variée des variables indépendantes
        num_sig = random.choice([0, 0, 0, 1, 1, 2, 3, 4, 5, 8, 12, 20])
        num_verif = random.choice([0, 1, 2, 3, 5, 10, 15, 25, 40, 60])
        anciennete = random.randint(1, 365)
        is_spike = (num_verif >= 10 and num_sig <= 1 and random.random() < 0.4)

        # Génération des séquences d'horodatages ISO 8601 précises
        verif_ts_list = generate_timestamps(now, num_verif, is_spike, anciennete)
        sig_ts_list = generate_timestamps(now, num_sig, False, anciennete)

        # Calcul des deltas temporels (en secondes)
        if len(verif_ts_list) >= 2:
            dts = [datetime.fromisoformat(ts.replace("Z", "+00:00")) for ts in verif_ts_list]
            intervals = [(dts[i+1] - dts[i]).total_seconds() for i in range(len(dts) - 1)]
            intervalle_moyen_verif_sec = sum(intervals) / len(intervals)
        else:
            intervalle_moyen_verif_sec = 86400.0

        if verif_ts_list and sig_ts_list:
            v_dts = [datetime.fromisoformat(ts.replace("Z", "+00:00")) for ts in verif_ts_list]
            s_dts = [datetime.fromisoformat(ts.replace("Z", "+00:00")) for ts in sig_ts_list]
            diffs = [abs((vt - st).total_seconds()) for vt in v_dts for st in s_dts]
            intervalle_min_verif_sig_sec = min(diffs) if diffs else 86400.0
        else:
            intervalle_min_verif_sig_sec = 86400.0

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
            + (1.2 if is_spike else 0.0)
            + random.gauss(0, 0.8)
        )

        prob_scam = sigmoid(logit)
        label = 1 if prob_scam >= 0.50 else 0

        rows.append({
            "numero": f"2376{random.randint(5, 9)}{random.randint(1000000, 9999999)}",
            "nombre_signalements": num_sig,
            "horodatages_signalements": json.dumps(sig_ts_list),
            "signalements_effectifs_ponderes": round(sig_eff, 2),
            "vitesse_signalements": round(vitesse_sig, 2),
            "anciennete_jours": anciennete,
            "diversite_signaleurs": diversite_sig,
            "diversite_devices": diversite_devices,
            "nombre_verifications": num_verif,
            "horodatages_verifications": json.dumps(verif_ts_list),
            "verifications_ponderees": round(verif_pond, 2),
            "vitesse_verifications": round(vitesse_verif, 2),
            "ratio_verif_signalement": round(ratio_verif_sig, 2),
            "intervalle_moyen_verif_sec": round(intervalle_moyen_verif_sec, 1),
            "intervalle_min_verif_sig_sec": round(intervalle_min_verif_sig_sec, 1),
            "gravite_categories": gravite,
            "label": label,
        })

    df = pd.DataFrame(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    print(f"Dataset Modèle A calibré avec horodatages généré ({len(df)} numéros) : {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate_dataset()
