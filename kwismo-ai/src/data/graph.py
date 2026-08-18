"""Analyse de Graphes de Réseau & Détection de Complicité d'Escrocs (Scam Ring Link Analysis).

Gère un registre de connexions orientées entre numéros sans jamais mélanger les données.
Fournit un bonus de risque contrôlé (+0.0 à +0.15 max) en cas de liaison directe avec un numéro confirmé suspect.
"""

import json
from pathlib import Path
from typing import Any

GRAPH_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interim" / "scam_graph.json"


def _load_graph() -> dict[str, Any]:
    if GRAPH_FILE_PATH.exists():
        try:
            return json.loads(GRAPH_FILE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"edges": {}, "known_scammers": []}


def _save_graph(graph_data: dict[str, Any]) -> None:
    GRAPH_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    GRAPH_FILE_PATH.write_text(json.dumps(graph_data, indent=2), encoding="utf-8")


def record_number_link(source_number: str, target_number: str) -> None:
    """Enregistre un lien directionnel entre un numéro source et un numéro récepteur."""
    if not source_number or not target_number or source_number == target_number:
        return

    graph = _load_graph()
    edges = graph.get("edges", {})

    if source_number not in edges:
        edges[source_number] = []
    if target_number not in edges[source_number]:
        edges[source_number].append(target_number)

    graph["edges"] = edges
    _save_graph(graph)


def register_known_scammer(number: str) -> None:
    """Enregistre un numéro confirmé comme frauduleux dans le registre de graphe."""
    if not number:
        return
    graph = _load_graph()
    known = set(graph.get("known_scammers", []))
    known.add(number)
    graph["known_scammers"] = list(known)
    _save_graph(graph)


def get_network_risk_bonus(number: str) -> tuple[float, str | None]:
    """Analyse les connexions orientées et renvoie un bonus de risque contrôlé (0.0 à 0.15 max)."""
    if not number:
        return 0.0, None

    graph = _load_graph()
    edges = graph.get("edges", {})
    known_scammers = set(graph.get("known_scammers", []))

    # Si le numéro lui-même est dans les connus
    if number in known_scammers:
        return 0.15, "Lien direct identifié avec un numéro récepteur confirmé comme arnaqueur."

    # Si le numéro a envoyé vers un numéro arnaqueur connu
    linked_targets = edges.get(number, [])
    for target in linked_targets:
        if target in known_scammers:
            return 0.15, f"Lien réseau détecté vers le numéro récepteur suspect ({target})."

    return 0.0, None
