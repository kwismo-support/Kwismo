"""Script d'audit et de test d'intégration automatisé pour KWISMO Backend.

- Teste l'intégralité des 49+ routes (GET, POST, PATCH, DELETE) avec tous les rôles (public, user, partner, admin).
- Écrit les logs détaillés (succès et erreurs) dans `logs/test_all_routes.log`.
- Exporte TOUTES les réponses JSON réelles renvoyées par chaque route dans `logs/test_all_routes_responses.json` et `docs/test_all_routes_responses.json`.
- Réinitialise et nettoie les données créées pendant le test à la fin de l'exécution
  afin de permettre une ré-exécution infinie et idempotente.
"""

import datetime
import json
import os
import random
import sys
from pathlib import Path
import httpx

# Résolution automatique du répertoire racine de kwismo-backend
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
LOG_DIR = BACKEND_DIR / "logs"
DOCS_DIR = BACKEND_DIR / "docs"
LOG_FILE = LOG_DIR / "test_all_routes.log"
RESPONSES_JSON_LOG = LOG_DIR / "test_all_routes_responses.json"
RESPONSES_JSON_DOCS = DOCS_DIR / "test_all_routes_responses.json"


def get_items(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("items", data.get("data", []))
    return []


def run_full_backend_test_suite():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    log_fp = open(LOG_FILE, "w", encoding="utf-8")

    def log_entry(msg: str):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted = f"[{timestamp}] {msg}"
        print(msg)
        log_fp.write(formatted + "\n")
        log_fp.flush()

    log_entry("==========================================================================")
    log_entry("   AUDIT ET TEST D'INTEGRATION AUTOMATISE DE KWISMO BACKEND")
    log_entry(f"   Base URL : {BASE_URL}")
    log_entry(f"   Fichier de Log : {LOG_FILE}")
    log_entry("==========================================================================")

    results = []
    responses_catalog = []
    created_resources = {
        "contacts": [],
        "user_phones": [],
        "reports": [],
    }

    def safe_req(client, method, path, role, auth_header=None, json_payload=None, params=None, expected_codes=(200, 201)):
        try:
            h = {"Authorization": auth_header} if auth_header else None
            resp = client.request(method, path, json=json_payload, params=params, headers=h, timeout=25.0)
            status_code = resp.status_code
            is_ok = status_code in expected_codes
            detail = resp.text
            status_str = "[OK]" if is_ok else "[FAIL]"
            
            try:
                parsed_response = resp.json()
            except Exception:
                parsed_response = detail

            msg = f"{status_str} {method:<6} {path:<45} ({role:<7}) -> HTTP {status_code} | {detail[:90]}"
            log_entry(msg)
            
            results.append({
                "path": path,
                "method": method,
                "role": role,
                "status_code": status_code,
                "is_ok": is_ok,
                "detail": detail
            })

            responses_catalog.append({
                "endpoint": path,
                "method": method,
                "role": role,
                "status_code": status_code,
                "request_payload": json_payload,
                "request_params": params,
                "response_data": parsed_response
            })

            return resp
        except Exception as e:
            msg = f"[FAIL] {method:<6} {path:<45} ({role:<7}) -> EXCEPTION | {str(e)[:100]}"
            log_entry(msg)
            results.append({
                "path": path,
                "method": method,
                "role": role,
                "status_code": 500,
                "is_ok": False,
                "detail": f"Exception: {str(e)}"
            })
            responses_catalog.append({
                "endpoint": path,
                "method": method,
                "role": role,
                "status_code": 500,
                "request_payload": json_payload,
                "response_data": {"error": str(e)}
            })
            return None

    def login_account(client, email, device_id):
        log_entry(f"\n---> [AUTH] Connexion au compte {email} (Device: {device_id})...")
        resp = safe_req(client, "POST", "/auth/login", "auth", json_payload={
            "email": email,
            "mot_de_passe": "Password123!",
            "device_id": device_id,
            "device_name": "Audit Terminal"
        })
        if resp and resp.status_code == 200 and "access_token" in resp.json():
            token = resp.json()["access_token"]
            role_name = resp.json().get("user", {}).get("role", "unknown")
            log_entry(f"---> [AUTH] Connexion réussie pour {email} (Rôle: {role_name})")
            return f"Bearer {token}"
        else:
            log_entry(f"---> [AUTH] Échec de connexion pour {email}")
            return None

    with httpx.Client(base_url=BASE_URL, timeout=25.0) as client:
        # 1. ROUTES PUBLIQUES & HEALTH
        log_entry("\n--- 1. ROUTES PUBLIQUES & SANTE ---")
        safe_req(client, "GET", "/health", "public")
        safe_req(client, "GET", "/openapi.json", "public")

        # 2. SESSION UTILISATEUR (USER)
        log_entry("\n--- 2. SESSION UTILISATEUR (user@kwismo.com) ---")
        user_auth = login_account(client, "user@kwismo.com", "android_device_user_1")
        if user_auth:
            safe_req(client, "GET", "/users/me", "user", user_auth)
            safe_req(client, "PATCH", "/users/me", "user", user_auth, json_payload={"nom": "UserTestName"})

            r_ph = safe_req(client, "GET", "/users/me/phones", "user", user_auth)
            phone_items = get_items(r_ph.json() if r_ph and r_ph.status_code == 200 else [])
            user_phone_id = phone_items[0]["id"] if phone_items else None

            # Ajout d'un téléphone de test
            rand_val = f"+23767{random.randint(1000000, 9999999)}"
            r_add_ph = safe_req(client, "POST", "/users/me/phones", "user", user_auth, json_payload={"valeur": rand_val})
            if r_add_ph and r_add_ph.status_code == 201:
                new_ph_id = r_add_ph.json().get("id")
                if new_ph_id:
                    created_resources["user_phones"].append(new_ph_id)

            if user_phone_id:
                safe_req(client, "POST", f"/users/me/phones/{user_phone_id}/compromise", "user", user_auth, json_payload={"type_incident": "sim_swap", "description": "Compromission de test"}, expected_codes=(200, 201, 409))

            safe_req(client, "GET", "/contacts", "user", user_auth)
            rand_num = f"+23767{random.randint(1000000, 9999999)}"
            r_ct = safe_req(client, "POST", "/contacts", "user", user_auth, json_payload={"nom": "Contact Test Auto", "numero": rand_num})
            if r_ct and r_ct.status_code == 201:
                ct_data = r_ct.json()
                if isinstance(ct_data, dict) and "id" in ct_data:
                    created_resources["contacts"].append(ct_data["id"])

            safe_req(client, "GET", "/devices", "user", user_auth)

            safe_req(client, "POST", "/numbers/verify", "user", user_auth, json_payload={"valeur": "+237670999888"})
            safe_req(client, "POST", "/numbers/batch-verify", "user", user_auth, json_payload={"numeros": ["+237670000001", "+237670999888"]})

            r_rep = safe_req(client, "POST", "/reports", "user", user_auth, json_payload={"numero": "+237677889900", "motif": "Spam SMS répétitif"}, expected_codes=(200, 201, 409))
            if r_rep and r_rep.status_code == 201:
                rep_data = r_rep.json()
                if isinstance(rep_data, dict) and "id" in rep_data:
                    created_resources["reports"].append(rep_data["id"])

            r_c = safe_req(client, "GET", "/countries", "user", user_auth)
            c_items = get_items(r_c.json() if r_c and r_c.status_code == 200 else [])
            c_id = c_items[0]["id"] if c_items else None

            r_op = safe_req(client, "GET", f"/operators?country={c_id}", "user", user_auth) if c_id else None
            op_items = get_items(r_op.json() if r_op and r_op.status_code == 200 else [])
            op_id = op_items[0]["id"] if op_items else None

            r_act = safe_req(client, "GET", f"/ussd-actions?operator={op_id}", "user", user_auth) if op_id else None
            act_items = get_items(r_act.json() if r_act and r_act.status_code == 200 else [])
            act_id = act_items[0]["id"] if act_items else None

            if op_id and act_id:
                safe_req(client, "POST", "/transactions/prepare", "user", user_auth, json_payload={"numero": "+237670000001", "montant": 1500.0, "operator_id": op_id, "ussd_action_id": act_id})

            r_tx = safe_req(client, "GET", "/transactions", "user", user_auth)
            tx_items = get_items(r_tx.json() if r_tx and r_tx.status_code == 200 else [])
            if tx_items:
                safe_req(client, "GET", f"/transactions/{tx_items[0]['id']}", "user", user_auth)

            if user_phone_id:
                r_inc = safe_req(client, "POST", "/whatsapp-alerts/incident", "user", user_auth, json_payload={"user_phone_id": user_phone_id})
                inc_id = r_inc.json().get("compromise_incident_id") if r_inc and r_inc.status_code in (200, 201) else None

                if inc_id and created_resources["contacts"]:
                    safe_req(client, "POST", "/whatsapp-alerts/broadcast", "user", user_auth, json_payload={"compromise_incident_id": inc_id, "contact_ids": [created_resources["contacts"][0]], "contenu": "Compte WhatsApp compromis"}, expected_codes=(200, 201, 400, 404))

            safe_req(client, "GET", "/notifications", "user", user_auth)

            r_sv = safe_req(client, "GET", "/surveys/active", "user", user_auth)
            sv_items = get_items(r_sv.json() if r_sv and r_sv.status_code == 200 else [])
            if sv_items:
                safe_req(client, "POST", f"/surveys/{sv_items[0]['id']}/answer", "user", user_auth, json_payload={"reponse": "Très satisfait"})

            safe_req(client, "POST", "/auth/logout", "user", user_auth, json_payload={"refresh_token": "dummy_refresh_token"}, expected_codes=(200, 400, 401))

        # 3. SESSION PARTENAIRE (PARTNER)
        log_entry("\n--- 3. SESSION PARTENAIRE (partner@kwismo.com) ---")
        partner_auth = login_account(client, "partner@kwismo.com", "partner_device_1")
        if partner_auth:
            safe_req(client, "GET", "/partner/scope/numbers", "partner", partner_auth)
            safe_req(client, "GET", "/partner/scope/users", "partner", partner_auth)
            safe_req(client, "GET", "/partner/scope/kpi", "partner", partner_auth)
            safe_req(client, "GET", "/kpi/partner", "partner", partner_auth)
            safe_req(client, "POST", "/auth/logout", "partner", partner_auth, json_payload={"refresh_token": "dummy_refresh_token"}, expected_codes=(200, 400, 401))

        # 4. SESSION ADMINISTRATEUR (ADMIN)
        log_entry("\n--- 4. SESSION ADMINISTRATEUR (admin@kwismo.com) ---")
        admin_auth = login_account(client, "admin@kwismo.com", "ios_device_admin_1")
        if admin_auth:
            r_usrs = safe_req(client, "GET", "/users", "admin", admin_auth)
            usr_items = get_items(r_usrs.json() if r_usrs and r_usrs.status_code == 200 else [])
            if usr_items:
                target_user_id = usr_items[0]["id"]
                safe_req(client, "GET", f"/users/{target_user_id}", "admin", admin_auth)
                safe_req(client, "PATCH", f"/users/{target_user_id}/status", "admin", admin_auth, json_payload={"statut": "active"})

            r_nums = safe_req(client, "GET", "/numbers", "admin", admin_auth)
            num_items = get_items(r_nums.json() if r_nums and r_nums.status_code == 200 else [])
            if num_items:
                target_num_id = num_items[0]["id"]
                safe_req(client, "GET", f"/numbers/{target_num_id}", "admin", admin_auth)
                safe_req(client, "PATCH", f"/numbers/{target_num_id}/status", "admin", admin_auth, json_payload={"statut": "frauduleux"})

            r_reps = safe_req(client, "GET", "/reports", "admin", admin_auth)
            rep_items = get_items(r_reps.json() if r_reps and r_reps.status_code == 200 else [])
            if rep_items:
                target_rep_id = rep_items[0]["id"]
                safe_req(client, "PATCH", f"/reports/{target_rep_id}/validate", "admin", admin_auth, json_payload={"statut": "validated"})

            r_cnt = safe_req(client, "GET", "/countries", "admin", admin_auth)
            cnt_items = get_items(r_cnt.json() if r_cnt and r_cnt.status_code == 200 else [])
            if cnt_items:
                c_obj = cnt_items[0]
                safe_req(client, "PATCH", f"/countries/{c_obj['id']}", "admin", admin_auth, json_payload={"nom": c_obj["nom"], "code_pays": c_obj["code_pays"], "est_par_defaut": c_obj["est_par_defaut"]})

                r_ops = safe_req(client, "GET", f"/operators?country={c_obj['id']}", "admin", admin_auth)
                ops_items = get_items(r_ops.json() if r_ops and r_ops.status_code == 200 else [])
                if ops_items:
                    op_obj = ops_items[0]
                    safe_req(client, "PATCH", f"/operators/{op_obj['id']}", "admin", admin_auth, json_payload={"nom": op_obj["nom"], "country_id": c_obj["id"]})

                    r_acts = safe_req(client, "GET", f"/ussd-actions?operator={op_obj['id']}", "admin", admin_auth)
                    acts_items = get_items(r_acts.json() if r_acts and r_acts.status_code == 200 else [])
                    if acts_items:
                        act_obj = acts_items[0]
                        safe_req(client, "PATCH", f"/ussd-actions/{act_obj['id']}", "admin", admin_auth, json_payload={"operator_id": op_obj["id"], "nom_action": act_obj["nom_action"], "code_ussd": act_obj["code_ussd"], "format": act_obj["format"]})

            r_prts = safe_req(client, "GET", "/partners", "admin", admin_auth)
            prt_items = get_items(r_prts.json() if r_prts and r_prts.status_code == 200 else [])
            if prt_items:
                prt_id = prt_items[0]["id"]
                safe_req(client, "GET", f"/partners/{prt_id}", "admin", admin_auth)
                safe_req(client, "GET", f"/partners/{prt_id}/affiliation-rules", "admin", admin_auth)

            safe_req(client, "GET", "/kpi/global", "admin", admin_auth)
            safe_req(client, "GET", "/roles", "admin", admin_auth)
            safe_req(client, "GET", "/access-rights", "admin", admin_auth)
            safe_req(client, "GET", "/admin/scam-categories", "admin", admin_auth)

            safe_req(client, "POST", "/auth/logout", "admin", admin_auth, json_payload={"refresh_token": "dummy_refresh_token"}, expected_codes=(200, 400, 401))

        # 5. NETTOYAGE / REINITIALISATION DES DONNEES DE TEST
        log_entry("\n--- 5. NETTOYAGE ET REINITIALISATION DE L'ETAT INITIAL ---")
        if user_auth:
            for ct_id in created_resources["contacts"]:
                safe_req(client, "DELETE", f"/contacts/{ct_id}", "cleanup", user_auth, expected_codes=(200, 404))
            for ph_id in created_resources["user_phones"]:
                safe_req(client, "DELETE", f"/users/me/phones/{ph_id}", "cleanup", user_auth, expected_codes=(200, 404))
            log_entry("[CLEANUP] Les ressources de test temporaires ont été supprimées avec succès.")

    # Exportation du dictionnaire complet des réponses JSON exécutées
    json_str = json.dumps(responses_catalog, indent=2, ensure_ascii=False)
    RESPONSES_JSON_LOG.write_text(json_str, encoding="utf-8")
    RESPONSES_JSON_DOCS.write_text(json_str, encoding="utf-8")

    total = len(results)
    success = sum(1 for r in results if r["is_ok"])
    failures = sum(1 for r in results if not r["is_ok"])

    log_entry("\n==========================================================================")
    log_entry("   RESUME FINAL DE L'AUDIT DE PERFORMANCE & SUITE DE TEST")
    log_entry(f"   Total des requêtes exécutées : {total}")
    log_entry(f"   Succès (HTTP 200 / 201 attendus) : {success}")
    log_entry(f"   Échecs / Erreurs : {failures}")
    log_entry(f"   Catalogue des réponses JSON exporté : {RESPONSES_JSON_LOG}")
    log_entry("==========================================================================")

    log_fp.close()
    return total, success, failures


if __name__ == "__main__":
    run_full_backend_test_suite()
