"""Reception des donnees depuis le backend. / Receiving data from the backend.

FR — L'IA ne se connecte jamais a la base : les donnees d'entrainement
arrivent en fichiers (export du backend) deposes dans data/raw/.
EN — The AI never connects to the database: training data arrives as files
(backend export) dropped into data/raw/.
"""

from pathlib import Path

import pandas as pd


def load_raw_reports(path: Path) -> pd.DataFrame:
    """Charge un export de signalements (CSV/JSON) depuis data/raw/."""

    if path.suffix == ".json":
        return pd.read_json(path)
    return pd.read_csv(path)
