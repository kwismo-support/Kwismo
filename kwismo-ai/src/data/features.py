"""Construction des caractéristiques comportementales, temporelles et anti-fraude du Modèle A.

Implémente :
1. Analyse fine des séquences complètes d'horodatages et calcul des intervalles (en secondes).
2. Décroissance temporelle exponentielle (Exponential Time Decay, demi-vie = 30 jours).
3. Anti-vengeance & déduplication d'appareils (Device Fingerprints & IP hashes).
4. Trust Rank des signaleurs.
5. Ratio de paresse & Spikes de vérifications récentes resserrées.
6. Pondération par gravité des catégories du Modèle B.
"""

import ast
import json
import math
from datetime import datetime, timezone
from typing import Any
import pandas as pd

FEATURE_COLUMNS = [
    "nombre_signalements",
    "signalements_effectifs_ponderes",
    "vitesse_signalements",
    "anciennete_jours",
    "diversite_signaleurs",
    "diversite_devices",
    "nombre_verifications",
    "verifications_ponderees",
    "vitesse_verifications",
    "ratio_verif_signalement",
    "gravite_categories",
]

CATEGORY_SEVERITY_WEIGHTS = {
    "fake_agent_otp": 1.0,
    "sim_swap_scam": 1.0,
    "fake_transfer_sms": 0.8,
    "lotto_winner_scam": 0.75,
    "recruitment_fee_scam": 0.7,
    "identity_theft_social": 0.75,
    "unknown_scam_pattern": 0.5,
    "legitimate_transaction": 0.0,
    "legitimate_chat": 0.0,
    "legitimate_info": 0.0,
}

HALF_LIFE_DAYS = 30.0  # Demi-vie de 30 jours pour la décroissance temporelle


def build_features(reports: pd.DataFrame) -> pd.DataFrame:
    """`reports` : une ligne par signalement, colonnes numero/date/signaleur."""
    grouped = reports.groupby("numero").agg(
        nombre_signalements=("numero", "count"),
        diversite_signaleurs=("signaleur", "nunique"),
    )
    return grouped.reset_index()


def parse_timestamps(ts_input: Any) -> list[datetime]:
    """Parse une liste ou une chaîne JSON de chaînes horodatées ISO8601 en objets datetime UTC triés chronologiquement."""
    if not ts_input:
        return []

    if isinstance(ts_input, str):
        try:
            ts_input = json.loads(ts_input)
        except Exception:
            try:
                ts_input = ast.literal_eval(ts_input)
            except Exception:
                ts_input = [ts_input]

    if not isinstance(ts_input, list):
        return []

    parsed = []
    for ts in ts_input:
        try:
            dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            parsed.append(dt)
        except Exception:
            continue
    return sorted(parsed)


def compute_time_decay(dt: datetime, now: datetime) -> float:
    """Calcule la décroissance temporelle exponentielle (exp(-ln(2) * delta_jours / 30))."""
    delta_seconds = max((now - dt).total_seconds(), 0.0)
    delta_days = delta_seconds / 86400.0
    return math.exp(-math.log(2) * delta_days / HALF_LIFE_DAYS)


def compute_temporal_features(data: dict[str, Any]) -> dict[str, Any]:
    """Calcule l'ensemble des caractéristiques avancées du Modèle A (incluant les métriques d'intervalles)."""
    now = datetime.now(timezone.utc)

    num_signalements = int(data.get("nombre_signalements", 0))
    num_verifications = int(data.get("nombre_verifications", 0))
    anciennete = max(int(data.get("anciennete_jours", 1)), 1)
    statut_admin = str(data.get("statut_communautaire", "aucun"))

    # 1. Parsing et tri chronologique des horodatages complets
    verif_ts = parse_timestamps(data.get("horodatages_verifications", []))
    sig_ts = parse_timestamps(data.get("horodatages_signalements", []))

    # Si les listes d'horodatages n'étaient pas fournies mais que des nombres existent, on conserve les nombres
    if not verif_ts and num_verifications > 0:
        verifs_ponderees = float(num_verifications)
        recent_verifs_24h = num_verifications
        intervalle_moyen_verif_sec = 86400.0
    elif verif_ts:
        num_verifications = len(verif_ts)
        verifs_ponderees = sum(compute_time_decay(dt, now) for dt in verif_ts)
        recent_verifs_24h = sum(1 for dt in verif_ts if (now - dt).total_seconds() <= 86400)
        
        # Calcul de l'intervalle moyen entre vérifications consécutives (en secondes)
        if len(verif_ts) >= 2:
            intervals = [(verif_ts[i+1] - verif_ts[i]).total_seconds() for i in range(len(verif_ts) - 1)]
            intervalle_moyen_verif_sec = sum(intervals) / float(len(intervals))
        else:
            intervalle_moyen_verif_sec = 86400.0
    else:
        verifs_ponderees = 0.0
        recent_verifs_24h = 0
        intervalle_moyen_verif_sec = 86400.0

    vitesse_verifs = float(recent_verifs_24h) if recent_verifs_24h > 0 else float(num_verifications) / float(anciennete)

    # 2. Décroissance temporelle exponentielle des signalements & Trust Rank
    reports_meta = data.get("reports_meta", [])
    if not sig_ts and num_signalements > 0:
        sig_ponderes = float(num_signalements)
        recent_sigs_24h = num_signalements
        intervalle_min_verif_sig_sec = 86400.0
    elif sig_ts:
        num_signalements = len(sig_ts)
        sig_ponderes = 0.0
        for idx, dt in enumerate(sig_ts):
            time_w = compute_time_decay(dt, now)
            trust_w = 1.0
            if idx < len(reports_meta) and isinstance(reports_meta[idx], dict):
                trust_w = float(reports_meta[idx].get("reporter_trust_rank", 1.0))
            sig_ponderes += time_w * trust_w
        recent_sigs_24h = sum(1 for dt in sig_ts if (now - dt).total_seconds() <= 86400)

        # Calcul du délai minimum entre la dernière vérification et le signalement le plus proche
        if verif_ts:
            diffs = [abs((vt - st).total_seconds()) for vt in verif_ts for st in sig_ts]
            intervalle_min_verif_sig_sec = min(diffs) if diffs else 86400.0
        else:
            intervalle_min_verif_sig_sec = 86400.0
    else:
        sig_ponderes = 0.0
        recent_sigs_24h = 0
        intervalle_min_verif_sig_sec = 86400.0

    vitesse_sigs = float(recent_sigs_24h) if recent_sigs_24h > 0 else float(num_signalements) / float(anciennete)

    # 3. Anti-vengeance : Déduplication par Device Fingerprint / IP Hash
    device_fingerprints = data.get("device_fingerprints", [])
    if device_fingerprints and isinstance(device_fingerprints, list):
        unique_devices = len(set(device_fingerprints))
    else:
        unique_devices = int(data.get("diversite_devices", num_signalements))

    diversite_sig = int(data.get("diversite_signaleurs", num_signalements))

    if num_signalements > 1 and unique_devices == 1:
        sig_ponderes = min(sig_ponderes, 1.0)
        is_anti_vengeance = True
    else:
        is_anti_vengeance = False

    # 4. Pondération par la gravité des catégories du Modèle B
    cat_dict = data.get("categories", {})
    if isinstance(cat_dict, dict) and cat_dict:
        weights = [CATEGORY_SEVERITY_WEIGHTS.get(cat, 0.5) for cat in cat_dict.values()]
        gravite_max = max(weights) if weights else 0.0
    else:
        gravite_max = float(data.get("gravite_categories", 0.0))

    ratio_verif_sig = verifs_ponderees / max(sig_ponderes, 1.0)

    # Réduction si le numéro est un marchand / service officiel vérifié
    if statut_admin == "verifie_officiel":
        sig_ponderes *= 0.5
        gravite_max *= 0.5

    return {
        "numero": str(data.get("numero", "")),
        "nombre_signalements": num_signalements,
        "signalements_effectifs_ponderes": round(sig_ponderes, 2),
        "vitesse_signalements": round(vitesse_sigs, 2),
        "anciennete_jours": anciennete,
        "diversite_signaleurs": diversite_sig,
        "diversite_devices": unique_devices,
        "nombre_verifications": num_verifications,
        "verifications_ponderees": round(verifs_ponderees, 2),
        "vitesse_verifications": round(vitesse_verifs, 2),
        "ratio_verif_signalement": round(ratio_verif_sig, 2),
        "gravite_categories": round(gravite_max, 2),
        "intervalle_moyen_verif_sec": round(intervalle_moyen_verif_sec, 1),
        "intervalle_min_verif_sig_sec": round(intervalle_min_verif_sig_sec, 1),
        "is_anti_vengeance": is_anti_vengeance,
        "statut_communautaire": statut_admin,
    }
