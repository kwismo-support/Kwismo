"""Nettoyage des donnees. / Data cleaning."""

import pandas as pd


def drop_duplicates_and_empty(df: pd.DataFrame, subset: list[str]) -> pd.DataFrame:
    return df.dropna(subset=subset).drop_duplicates(subset=subset).reset_index(drop=True)


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip().lower() for c in df.columns]
    return df
