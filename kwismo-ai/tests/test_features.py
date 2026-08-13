"""Tests du pipeline de features. / Feature pipeline tests."""

import pandas as pd

from src.data.features import build_features


def test_build_features_counts_reports_per_number() -> None:
    reports = pd.DataFrame(
        {
            "numero": ["+237690000000", "+237690000000", "+237651111111"],
            "signaleur": ["u1", "u2", "u3"],
        }
    )
    features = build_features(reports)
    row = features[features["numero"] == "+237690000000"].iloc[0]
    assert row["nombre_signalements"] == 2
