"""Construction des caractéristiques comportementales et temporelles du Modèle A.

Calcule la dynamique temporelle (pics de vérifications/signalements), la diversité des signaleurs,
et la gravité des catégories attribuées par le Modèle B.
"""

from datetime import datetime, timezone
import pandas as pd

FEATURE_COLUMNS = [
    "nombre_signalements",
    "vitesse_signalements",
    "anciennete_jours",
    "diversite_signaleurs",
    "nombre_verifications",
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


def build_features(reports: pd.DataFrame) -> pd.DataFrame:
    """`reports` : une ligne par signalement, colonnes numero/date/signaleur."""
    grouped = reports.groupby("numero").agg(
        nombre_signalements=("numero", "count"),
        diversite_signaleurs=("signaleur", "nunique"),
    )
    return grouped.reset_index()


def parse_timestamps(ts_list: list[str]) -> list[datetime]:
    """Parse une liste de chaînes horodatées ISO8601 en objets datetime UTC."""
    parsed = []
    for ts in ts_list:
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            parsed.append(dt)
        except Exception:
            continue
    return sorted(parsed)


def compute_temporal_features(data: dict) -> dict:
    """Calcule les métriques comportementales et temporelles d'un numéro."""
    num_signalements = int(data.get("nombre_signalements", 0))
    num_verifications = int(data.get("nombre_verifications", 0))
    anciennete = int(data.get("anciennete_jours", 1))
    if anciennete <= 0:
        anciennete = 1

    verif_ts = parse_timestamps(data.get("horodatages_verifications", []))
    sig_ts = parse_timestamps(data.get("horodatages_signalements", []))
    
    now = datetime.now(timezone.utc)

    # 1. Calcul des vérifications récentes (pics / spikes sur 24h)
    recent_verifs = sum(1 for dt in verif_ts if (now - dt).total_seconds() <= 86400)
    vitesse_verifs = float(recent_verifs) if recent_verifs > 0 else float(num_verifications) / float(anciennete)

    # 2. Calcul des signalements récents (pics sur 24h)
    recent_sigs = sum(1 for dt in sig_ts if (now - dt).total_seconds() <= 86400)
    vitesse_sigs = float(recent_sigs) if recent_sigs > 0 else float(num_signalements) / float(anciennete)

    # 3. Ratio vérifications / signalements (utilisateurs paresseux qui vérifient sans signaler)
    ratio_verif_sig = float(num_verifications) / float(max(num_signalements, 1))

    # 4. Diversité des signaleurs
    diversite = int(data.get("diversite_signaleurs", num_signalements))

    # 5. Gravité des catégories attribuées par le Modèle B
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
        "vitesse_signalements": vitesse_sigs,
        "anciennete_jours": anciennete,
        "diversite_signaleurs": diversite,
        "nombre_verifications": num_verifications,
        "vitesse_verifications": vitesse_verifs,
        "ratio_verif_signalement": ratio_verif_sig,
        "gravite_categories": max_severity,
    }
