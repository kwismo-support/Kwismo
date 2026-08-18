"""Construction des caractéristiques comportementales, temporelles et anti-fraude du Modèle A.

Implémente :
1. Analyse fine des séquences complètes d'horodatages et calcul des intervallies (en secondes).
2. Décroissance temporelle exponentielle (Exponential Time Decay, demi-vie = 30 jours).
3. Anti-vengeance & déduplication d'appareils (Device Fingerprints & IP hashes).
4. Trust Rank des signaleurs.
5. Ratio de paresse & Spikes de vérifications récentes resserrées.
6. Pondération par gravité des catégories du Modèle B.
"""

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


def parse_timestamps(ts_list: list[str]) -> list[datetime]:
    """Parse une liste de chaînes horodatées ISO8601 en objets datetime UTC triés chronologiquement."""
    parsed = []
    if not ts_list or not isinstance(ts_list, list):
        return []

    for ts in ts_list:
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

    # 3. Anti-Vengeance & Déduplication par Device ID / Fingerprint
    devices = data.get("device_fingerprints", [])
    if devices and isinstance(devices, list):
        diversite_devices = len(set(devices))
    else:
        diversite_devices = num_signalements

    sig_effectifs_ponderes = min(sig_ponderes, float(diversite_devices)) if diversite_devices > 0 else sig_ponderes

    # 4. Ratio de Paresse (Vérifications nombreuses sans signalement rédigé)
    ratio_verif_sig = verifs_ponderees / max(sig_effectifs_ponderes, 1.0)

    # 5. Diversité des signaleurs
    diversite_signaleurs = int(data.get("diversite_signaleurs", num_signalements))

    # 6. Gravité des catégories attribuées par le Modèle B
    categories = data.get("categories", {})
    if isinstance(categories, dict):
        cat_list = list(categories.values())
    elif isinstance(categories, list):
        cat_list = categories
    else:
        cat_list = []

    if cat_list:
        max_severity = max([CATEGORY_SEVERITY_WEIGHTS.get(cat, 0.5) for cat in cat_list], default=0.0)
    else:
        max_severity = 0.5 if num_signalements > 0 else 0.0

    return {
        "nombre_signalements": num_signalements,
        "signalements_effectifs_ponderes": round(sig_effectifs_ponderes, 2),
        "vitesse_signalements": round(vitesse_sigs, 2),
        "anciennete_jours": anciennete,
        "diversite_signaleurs": diversite_signaleurs,
        "diversite_devices": diversite_devices,
        "nombre_verifications": num_verifications,
        "verifications_ponderees": round(verifs_ponderees, 2),
        "vitesse_verifications": round(vitesse_verifs, 2),
        "ratio_verif_signalement": round(ratio_verif_sig, 2),
        "intervalle_moyen_verif_sec": round(intervalle_moyen_verif_sec, 1),
        "intervalle_min_verif_sig_sec": round(intervalle_min_verif_sig_sec, 1),
        "gravite_categories": max_severity,
        "statut_communautaire": statut_admin,
    }
