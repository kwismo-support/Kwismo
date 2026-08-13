"""Repli TF-IDF + regression logistique, garanti sur n'importe quel PC. / TF-IDF + logistic regression fallback, guaranteed on any PC."""

import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

from src.models.model_b.preprocess import normalize_text


def build_pipeline() -> Pipeline:
    return Pipeline(
        [
            ("tfidf", TfidfVectorizer(preprocessor=normalize_text, ngram_range=(1, 2))),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )


def train_fallback(texts: list[str], labels: list[int]) -> Pipeline:
    pipeline = build_pipeline()
    pipeline.fit(texts, labels)
    return pipeline


def save_fallback(pipeline: Pipeline, path: str) -> None:
    joblib.dump(pipeline, path)


def load_fallback(path: str) -> Pipeline:
    return joblib.load(path)
