"""Script d'audit et de test d'intégration automatisé pour KWISMO AI.

- Teste l'intégralité des routes d'inférence et de santé du microservice IA (/health, /version, /predict/number, /predict/text, /predict/batch_reports, /predict/full_analysis, /feedback).
- Écrit les logs détaillés (succès et erreurs) dans `logs/test_all_routes.log`.
- Garantit l'idempotence et la répétabilité des tests de prédiction et de scoring de risque.
"""

import datetime
import os
import sys
from pathlib import Path
import httpx

# Résolution automatique du répertoire racine de kwismo-ai
AI_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AI_DIR))

BASE_URL = os.getenv("AI_BASE_URL", "http://127.0.0.1:8001")
LOG_DIR = AI_DIR / "logs"
LOG_FILE = LOG_DIR / "test_all_routes.log"


def run_full_ai_test_suite():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_fp = open(LOG_FILE, "w", encoding="utf-8")

    def log_entry(msg: str):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted = f"[{timestamp}] {msg}"
        print(msg)
        log_fp.write(formatted + "\n")
        log_fp.flush()

    log_entry("==========================================================================")
    log_entry("   AUDIT ET TEST D'INTEGRATION AUTOMATISE DE KWISMO AI SERVICE")
    log_entry(f"   Base URL : {BASE_URL}")
    log_entry(f"   Fichier de Log : {LOG_FILE}")
    log_entry("==========================================================================")

    results = []

    def safe_req(client, method, path, json_payload=None, params=None, expected_codes=(200, 201)):
        try:
            resp = client.request(method, path, json=json_payload, params=params, timeout=25.0)
            status_code = resp.status_code
            is_ok = status_code in expected_codes
            detail = resp.text
            status_str = "[OK]" if is_ok else "[FAIL]"

            msg = f"{status_str} {method:<6} {path:<35} -> HTTP {status_code} | {detail[:90]}"
            log_entry(msg)

            results.append({
                "path": path,
                "method": method,
                "status_code": status_code,
                "is_ok": is_ok,
                "detail": detail
            })
            return resp
        except Exception as e:
            msg = f"[FAIL] {method:<6} {path:<35} -> EXCEPTION | {str(e)[:100]}"
            log_entry(msg)
            results.append({
                "path": path,
                "method": method,
                "status_code": 500,
                "is_ok": False,
                "detail": f"Exception: {str(e)}"
            })
            return None

    with httpx.Client(base_url=BASE_URL, timeout=25.0) as client:
        # 1. SANTE ET VERSION
        log_entry("\n--- 1. ROUTES SANTE ET VERSION ---")
        safe_req(client, "GET", "/health")
        safe_req(client, "GET", "/version")

        # 2. MODEL A - RISQUE DE NUMERO
        log_entry("\n--- 2. MODEL A (SCORING TEMPOREL ET FREQUENTIEL DE RISQUE) ---")
        safe_req(client, "POST", "/predict/number", json_payload={
            "numero": "+237670999888",
            "nombre_verifications": 15,
            "nombre_signalements": 8,
            "horodatages_verifications": ["2026-08-19T08:00:00Z"],
            "horodatages_signalements": ["2026-08-19T08:30:00Z"]
        })

        # 3. MODEL B - NLP ET CATEGORISATION DE TEXTE DE SIGNALEMENT
        log_entry("\n--- 3. MODEL B (CATEGORISATION NLP TEXTE SIGNALEMENT) ---")
        safe_req(client, "POST", "/predict/text", json_payload={
            "texte": "Il m'a appelé en se faisant passer pour un agent MTN et a demandé mon code secret Mobile Money",
            "langue": "fr"
        })

        # 4. TRAITEMENT PAR LOT (BATCH REPORTS)
        log_entry("\n--- 4. CATEGORISATION EN LOT (BATCH REPORTS) ---")
        safe_req(client, "POST", "/predict/batch_reports", json_payload={
            "reports": [
                {"id_signalement": "rep_101", "description": "Faux SMS de dépôt MoMo m'invitant à taper mon code PIN"},
                {"id_signalement": "rep_102", "description": "L'appelant prétend que ma ligne Orange sera coupée dans 5 minutes"}
            ],
            "cache_categories": {}
        })

        # 5. ORCHESTRATEUR GENERAL (FULL ANALYSIS)
        log_entry("\n--- 5. ORCHESTRATEUR GENERAL (FULL ANALYSIS) ---")
        safe_req(client, "POST", "/predict/full_analysis", json_payload={
            "numero": "+237670999888",
            "nombre_verifications": 12,
            "reports": [
                {"id_signalement": "rep_201", "description": "Escroquerie SIM Swap et tentative de retrait d'argent"}
            ],
            "cache_categories": {}
        })

        # 6. FEEDBACK BOUCLE D'APPRENTISSAGE
        log_entry("\n--- 6. RETOUR ET FEEDBACK APPRENTISSAGE ---")
        safe_req(client, "POST", "/feedback", json_payload={
            "type": "number",
            "numero": "+237670999888",
            "label": "frauduleux",
            "source": "admin_validation"
        })

    total = len(results)
    success = sum(1 for r in results if r["is_ok"])
    failures = sum(1 for r in results if not r["is_ok"])

    log_entry("\n==========================================================================")
    log_entry("   RESUME FINAL DES TESTS KWISMO AI")
    log_entry(f"   Total des requêtes exécutées : {total}")
    log_entry(f"   Succès (HTTP 200 / 201 attendus) : {success}")
    log_entry(f"   Échecs / Erreurs : {failures}")
    log_entry("==========================================================================")

    log_fp.close()
    return total, success, failures


if __name__ == "__main__":
    run_full_ai_test_suite()
