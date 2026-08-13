"""Metriques de scraping — historique + graphes d'evolution. / Scraping metrics — history + evolution charts.

FR — Chaque execution (notebook ou script, meme code) enregistre un resume
(duree, volume, erreurs par source) dans un historique persistant, pour
savoir si la collecte progresse d'un run a l'autre (une connexion coupee
qui fait rater des sites n'est pas grave si ca s'ameliore avec le temps).
`generate_report()` produit des graphes sauvegardes dans data/interim/metrics/plots/
(synchronisable sur Drive comme le reste des donnees lourdes).
EN — Every run (notebook or script, same code) records a summary
(duration, volume, errors per source) into a persistent history, to track
whether collection improves run over run (a dropped connection that
misses some sites is fine as long as it improves over time).
`generate_report()` produces charts saved to data/interim/metrics/plots/
(syncable to Drive like other heavy data).
"""

import json
import time
from datetime import UTC, datetime
from pathlib import Path

METRICS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "interim" / "metrics"
HISTORY_PATH = METRICS_DIR / "scraping_runs.jsonl"


class RunMetrics:
    """Collecte les stats d'une execution en cours. / Collects stats for the current run."""

    def __init__(self, run_type: str) -> None:
        self.run_type = run_type
        self._started_at = time.monotonic()
        self.sources: dict[str, dict] = {}

    def _source(self, source: str) -> dict:
        return self.sources.setdefault(
            source, {"start": time.monotonic(), "texte": 0, "image": 0, "erreurs": 0}
        )

    def record_success(self, source: str, kind: str) -> None:
        """`kind` : "texte" ou "image". / `kind`: "texte" or "image"."""

        entry = self._source(source)
        entry[kind] = entry.get(kind, 0) + 1

    def record_error(self, source: str) -> None:
        self._source(source)["erreurs"] += 1

    def finalize(self) -> dict:
        for entry in self.sources.values():
            entry["duree_s"] = round(time.monotonic() - entry.pop("start"), 1)

        record = {
            "date": datetime.now(UTC).isoformat(),
            "run_type": self.run_type,
            "duree_totale_s": round(time.monotonic() - self._started_at, 1),
            "total_texte": sum(s.get("texte", 0) for s in self.sources.values()),
            "total_image": sum(s.get("image", 0) for s in self.sources.values()),
            "total_erreurs": sum(s.get("erreurs", 0) for s in self.sources.values()),
            "sources": self.sources,
        }
        _append_history(record)
        return record


def _append_history(record: dict) -> None:
    METRICS_DIR.mkdir(parents=True, exist_ok=True)
    with HISTORY_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def load_history() -> list[dict]:
    if not HISTORY_PATH.exists():
        return []
    return [json.loads(line) for line in HISTORY_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]


def generate_report() -> Path:
    """Genere les graphes d'evolution et les sauvegarde. Retourne le dossier de sortie."""

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plots_dir = METRICS_DIR / "plots"
    plots_dir.mkdir(parents=True, exist_ok=True)

    history = load_history()
    if not history:
        return plots_dir

    runs = list(range(1, len(history) + 1))
    cumul_texte, cumul_image, total_t, total_i = [], [], 0, 0
    for h in history:
        total_t += h["total_texte"]
        total_i += h["total_image"]
        cumul_texte.append(total_t)
        cumul_image.append(total_i)

    fig, ax = plt.subplots()
    ax.plot(runs, cumul_texte, marker="o", label="Texte (cumule)")
    ax.plot(runs, cumul_image, marker="o", label="Image (cumule)")
    ax.set_xlabel("Execution #")
    ax.set_ylabel("Elements collectes (cumule)")
    ax.set_title("Evolution de la collecte")
    ax.legend()
    fig.savefig(plots_dir / "evolution_collecte.png")
    plt.close(fig)

    erreurs = [h["total_erreurs"] for h in history]
    fig, ax = plt.subplots()
    ax.bar(runs, erreurs)
    ax.set_xlabel("Execution #")
    ax.set_ylabel("Erreurs")
    ax.set_title("Erreurs par execution")
    fig.savefig(plots_dir / "erreurs_par_run.png")
    plt.close(fig)

    return plots_dir


if __name__ == "__main__":
    plots_dir = generate_report()
    print(f"{len(load_history())} execution(s) enregistree(s). Graphes -> {plots_dir}")
