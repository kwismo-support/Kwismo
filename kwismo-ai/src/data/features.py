"""Construction des caracteristiques du Modele A. / Model A feature engineering.

FR — Les colonnes produites doivent correspondre aux champs de
NumberFeaturesIn (contrat partage avec le backend, src/api/schemas.py).
EN — The produced columns must match NumberFeaturesIn's fields (contract
shared with the backend, src/api/schemas.py).
"""

import pandas as pd

FEATURE_COLUMNS = [
    "nombre_signalements",
    "vitesse_signalements",
    "anciennete_jours",
    "diversite_signaleurs",
    "nombre_verifications",
]


def build_features(reports: pd.DataFrame) -> pd.DataFrame:
    """`reports` : une ligne par signalement, colonnes numero/date/signaleur."""

    grouped = reports.groupby("numero").agg(
        nombre_signalements=("numero", "count"),
        diversite_signaleurs=("signaleur", "nunique"),
    )
    return grouped.reset_index()
