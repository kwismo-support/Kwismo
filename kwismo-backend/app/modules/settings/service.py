"""Logique métier du module settings / SuperAdmin risk thresholds."""

import json
import logging
from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.settings.schemas import RiskThresholdRule, SettingsThresholdsIn, SettingsThresholdsOut

logger = logging.getLogger("kwismo.backend")

SETTINGS_KEY_THRESHOLDS = "risk_threshold_rules"

DEFAULT_RULES = [
    RiskThresholdRule(
        zone="securise",
        min_value=0.0,
        min_operator=">=",
        max_value=0.3,
        max_operator="<",
        label_fr="Sécurisé",
        label_en="Safe",
    ),
    RiskThresholdRule(
        zone="suspect",
        min_value=0.3,
        min_operator=">=",
        max_value=0.7,
        max_operator="<",
        label_fr="A vérifier / Suspect",
        label_en="Warning / Suspect",
    ),
    RiskThresholdRule(
        zone="frauduleux",
        min_value=0.7,
        min_operator=">=",
        max_value=1.0,
        max_operator="<=",
        label_fr="Frauduleux / Arnaque",
        label_en="Fraudulent / Scam",
    ),
]

_cached_rules: list[RiskThresholdRule] | None = None


def evaluate_risk_status_with_rules(score: float, rules: list[RiskThresholdRule]) -> str:
    """Évalue un score entre 0.0 et 1.0 selon une liste de règles de seuils."""
    score = min(1.0, max(0.0, float(score)))
    for rule in rules:
        min_ok = False
        if rule.min_operator == ">=":
            min_ok = score >= rule.min_value
        elif rule.min_operator == ">":
            min_ok = score > rule.min_value
        elif rule.min_operator == "=":
            min_ok = abs(score - rule.min_value) < 1e-5

        max_ok = False
        if rule.max_operator == "<=":
            max_ok = score <= rule.max_value
        elif rule.max_operator == "<":
            max_ok = score < rule.max_value
        elif rule.max_operator == "=":
            max_ok = abs(score - rule.max_value) < 1e-5

        if min_ok and max_ok:
            return rule.zone

    # Fallback si hors plage
    if score >= 0.7:
        return "frauduleux"
    elif score >= 0.3:
        return "suspect"
    return "securise"


async def get_threshold_rules() -> list[RiskThresholdRule]:
    """Récupère les règles de seuils actives (en cache, en BD ou par défaut)."""
    global _cached_rules
    if _cached_rules is not None:
        return _cached_rules

    try:
        setting = await db.systemsetting.find_unique(where={"key": SETTINGS_KEY_THRESHOLDS})
        if setting and setting.value:
            raw_list = json.loads(setting.value)
            _cached_rules = [RiskThresholdRule(**item) for item in raw_list]
            return _cached_rules
    except Exception as exc:
        logger.warning("Erreur lors de la lecture des seuils en BD (utilisation par défaut) : %s", exc)

    _cached_rules = DEFAULT_RULES
    return _cached_rules


def validate_coverage(rules: list[RiskThresholdRule]) -> None:
    """Valide que la liste de règles couvre l'intégralité de l'intervalle [0.0, 1.0] sans trous."""
    if not rules:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Au moins une règle doit être définie.")

    # Tester l'échantillonnage de 0.0 à 1.0 par pas de 0.05
    test_points = [round(i * 0.01, 2) for i in range(101)]
    for point in test_points:
        matched = False
        for rule in rules:
            min_ok = (point >= rule.min_value) if rule.min_operator in (">=", "=") else (point > rule.min_value)
            max_ok = (point <= rule.max_value) if rule.max_operator in ("<=", "=") else (point < rule.max_value)
            if min_ok and max_ok:
                matched = True
                break
        if not matched:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Zone creuse détectée : le score {point} n'est couvert par aucune règle (plage 0.0 à 1.0 incomplète).",
            )


async def update_threshold_rules(payload: SettingsThresholdsIn) -> SettingsThresholdsOut:
    """Met à jour les règles de seuil SuperAdmin après validation de la couverture 0.0 - 1.0."""
    global _cached_rules
    validate_coverage(payload.rules)

    serialized = json.dumps([r.model_dump() for r in payload.rules])
    now_str = datetime.now(timezone.utc).isoformat()

    try:
        existing = await db.systemsetting.find_unique(where={"key": SETTINGS_KEY_THRESHOLDS})
        if existing:
            await db.systemsetting.update(
                where={"key": SETTINGS_KEY_THRESHOLDS},
                data={"value": serialized},
            )
        else:
            await db.systemsetting.create(
                data={
                    "key": SETTINGS_KEY_THRESHOLDS,
                    "value": serialized,
                    "description": "Seuils de risque configurés par le SuperAdmin (0.0 à 1.0)",
                }
            )
    except Exception as exc:
        logger.warning("Sauvegarde BD des seuils impossible (fallback en mémoire) : %s", exc)

    _cached_rules = payload.rules
    return SettingsThresholdsOut(rules=payload.rules, updated_at=now_str)


async def evaluate_risk_status(score: float) -> str:
    """Évalue le statut d'un score de risque en utilisant la configuration active."""
    rules = await get_threshold_rules()
    return evaluate_risk_status_with_rules(score, rules)
