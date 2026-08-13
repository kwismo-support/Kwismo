"""Rappel, precision, F1, matrice de confusion. / Recall, precision, F1, confusion matrix.

FR — En fraude, le rappel prime (rater une fraude coute plus cher qu'une
fausse alerte) ; voir les seuils reglables dans src/config.py.
EN — In fraud detection, recall matters most (missing a fraud costs more
than a false alert); see the tunable thresholds in src/config.py.
"""

from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score


def evaluate(y_true, y_pred) -> dict:
    return {
        "recall": recall_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }
