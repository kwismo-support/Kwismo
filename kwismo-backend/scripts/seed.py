"""Peuple la base de donnees avec des donnees complètes et réalistes pour toutes les routes backend.

Usage: python scripts/seed.py
"""

import asyncio
import json
from pathlib import Path

from app.core.security import hash_password
from app.db.prisma_client import connect_db, db, disconnect_db

SEED_DIR = Path(__file__).resolve().parent.parent / "prisma" / "seed_data"
DEFAULT_ROLES = ["user", "partner", "admin"]


async def seed_roles_and_permissions() -> dict[str, str]:
    """Cree les roles et leurs droits d'acces (AccessRight)."""
    roles = {}
    for nom_role in DEFAULT_ROLES:
        role = await db.role.upsert(
            where={"nomRole": nom_role},
            data={"create": {"nomRole": nom_role}, "update": {}},
        )
        roles[nom_role] = role.id

    permissions = {
        "admin": [
            ("users:read", "Consulter tous les utilisateurs"),
            ("users:write", "Gerer les utilisateurs"),
            ("reports:read", "Consulter les signalements"),
            ("reports:verify", "Valider/Rejeter les signalements"),
            ("analytics:read", "Acceder aux tableau de bord"),
            ("system:configure", "Configurer le systeme"),
        ],
        "partner": [
            ("analytics:read", "Consulter ses statistiques"),
            ("reports:read", "Consulter les signalements lies"),
            ("affiliation:manage", "Gerer les regles d'affiliation"),
        ],
        "user": [
            ("reports:create", "Creer des signalements"),
            ("phones:manage", "Gerer ses numeros de telephone"),
            ("devices:manage", "Gerer ses appareils"),
        ],
    }

    for role_nom, perms in permissions.items():
        role_id = roles[role_nom]
        for perm_code, desc in perms:
            existing = await db.accessright.find_first(
                where={"roleId": role_id, "permission": perm_code}
            )
            if not existing:
                await db.accessright.create(
                    data={
                        "role": {"connect": {"id": role_id}},
                        "permission": perm_code,
                        "description": desc,
                    }
                )

    return roles


async def seed_partners() -> dict[str, str]:
    """Cree les partenaires de test."""
    partners = [
        ("KWISMO Partner Test", "Fintech"),
        ("MTN Mobile Money SAM", "Operator"),
    ]
    ids = {}
    for nom, typ in partners:
        p = await db.partner.find_first(where={"nomEntreprise": nom})
        if not p:
            p = await db.partner.create(data={"nomEntreprise": nom, "typePartenariat": typ})
        ids[nom] = p.id
    return ids


async def seed_users(role_ids: dict[str, str], partner_ids: dict[str, str]) -> dict[str, str]:
    """Cree les comptes utilisateurs de test pour chaque role."""
    pwd_hash = hash_password("Password123!")

    users_data = [
        ("user@kwismo.com", "User", "Test", "user", None),
        ("user2@kwismo.com", "Douala", "Paul", "user", None),
        ("partner@kwismo.com", "Partner", "Test", "partner", partner_ids.get("KWISMO Partner Test")),
        ("admin@kwismo.com", "KWISMO", "Admin", "admin", None),
    ]

    user_ids = {}
    for email, nom, prenom, role_nom, partner_id in users_data:
        existing = await db.user.find_unique(where={"email": email})
        if not existing:
            user_data = {
                "nom": nom,
                "prenom": prenom,
                "email": email,
                "motDePasse": pwd_hash,
                "emailVerifie": True,
                "statut": "active",
                "langue": "fr",
                "role": {"connect": {"id": role_ids[role_nom]}},
            }
            if partner_id:
                user_data["partner"] = {"connect": {"id": partner_id}}

            u = await db.user.create(data=user_data)
            user_ids[email] = u.id
            print(f"Compte cree : {email} ({role_nom})")
        else:
            user_ids[email] = existing.id

    return user_ids


async def seed_countries() -> dict[str, str]:
    """Cree les pays par defaut (Cameroun, Cote d'Ivoire, Senegal)."""
    countries = [
        {"nom": "Cameroun", "code_pays": "+237", "est_par_defaut": True},
        {"nom": "Cote d'Ivoire", "code_pays": "+225", "est_par_defaut": False},
        {"nom": "Senegal", "code_pays": "+221", "est_par_defaut": False},
    ]
    if (SEED_DIR / "countries.json").exists():
        countries = json.loads((SEED_DIR / "countries.json").read_text(encoding="utf-8"))

    ids: dict[str, str] = {}
    for c in countries:
        country = await db.country.upsert(
            where={"codePays": c["code_pays"]},
            data={
                "create": {
                    "nom": c["nom"],
                    "codePays": c["code_pays"],
                    "estParDefaut": c.get("est_par_defaut", False),
                },
                "update": {"nom": c["nom"], "estParDefaut": c.get("est_par_defaut", False)},
            },
        )
        ids[c["code_pays"]] = country.id
    return ids


async def seed_operators(country_ids: dict[str, str]) -> dict[str, str]:
    """Cree les operateurs et leurs prefixes."""
    operators = [
        {
            "nom": "MTN Cameroun",
            "country_code_pays": "+237",
            "prefixes": ["67", "68", "650", "651", "652", "653", "654"],
        },
        {
            "nom": "Orange Cameroun",
            "country_code_pays": "+237",
            "prefixes": ["69", "655", "656", "657", "658", "659"],
        },
        {
            "nom": "Moov Cote d'Ivoire",
            "country_code_pays": "+225",
            "prefixes": ["01", "02", "03"],
        },
    ]
    if (SEED_DIR / "operators.json").exists():
        operators = json.loads((SEED_DIR / "operators.json").read_text(encoding="utf-8"))

    ids: dict[str, str] = {}
    for o in operators:
        country_id = country_ids.get(o["country_code_pays"])
        if not country_id:
            continue
        operator = await db.operator.upsert(
            where={"nom_countryId": {"nom": o["nom"], "countryId": country_id}},
            data={
                "create": {"nom": o["nom"], "country": {"connect": {"id": country_id}}},
                "update": {},
            },
        )
        for prefixe in o["prefixes"]:
            await db.operatorprefix.upsert(
                where={"operatorId_prefixe": {"operatorId": operator.id, "prefixe": prefixe}},
                data={
                    "create": {"operator": {"connect": {"id": operator.id}}, "prefixe": prefixe},
                    "update": {},
                },
            )
        ids[o["nom"]] = operator.id
    return ids


async def seed_ussd_actions(operator_ids: dict[str, str]) -> None:
    """Cree les actions USSD de test."""
    actions = [
        {
            "operator_nom": "MTN Cameroun",
            "nom_action": "Solde",
            "code_ussd": "*123#",
            "format": "*123#",
        },
        {
            "operator_nom": "MTN Cameroun",
            "nom_action": "Transfert Mobile Money",
            "code_ussd": "*126#",
            "format": "*126*{montant}*{numero}#",
        },
        {
            "operator_nom": "Orange Cameroun",
            "nom_action": "Solde",
            "code_ussd": "#123#",
            "format": "#123#",
        },
    ]
    if (SEED_DIR / "ussd_actions.json").exists():
        actions = json.loads((SEED_DIR / "ussd_actions.json").read_text(encoding="utf-8"))

    for a in actions:
        operator_id = operator_ids.get(a["operator_nom"])
        if not operator_id:
            continue
        await db.ussdaction.upsert(
            where={"operatorId_nomAction": {"operatorId": operator_id, "nomAction": a["nom_action"]}},
            data={
                "create": {
                    "operator": {"connect": {"id": operator_id}},
                    "nomAction": a["nom_action"],
                    "codeUSSD": a["code_ussd"],
                    "format": a["format"],
                },
                "update": {"codeUSSD": a["code_ussd"], "format": a["format"]},
            },
        )


async def seed_numeros(country_ids: dict[str, str], operator_ids: dict[str, str]) -> dict[str, str]:
    """Cree des numeros sains et frauduleux."""
    cameroun_id = country_ids.get("+237")
    mtn_id = operator_ids.get("MTN Cameroun")
    orange_id = operator_ids.get("Orange Cameroun")

    numeros_list = [
        ("+237670000001", cameroun_id, mtn_id, 0.0, "securise"),
        ("+237690000002", cameroun_id, orange_id, 0.0, "securise"),
        ("+237677889900", cameroun_id, mtn_id, 0.0, "securise"),
        ("+237699001122", cameroun_id, orange_id, 0.0, "securise"),
        ("+237670999888", cameroun_id, mtn_id, 85.0, "frauduleux"),
        ("+237699111222", cameroun_id, orange_id, 65.0, "a_signaler"),
    ]

    numero_ids = {}
    for val, c_id, op_id, score, statut in numeros_list:
        existing = await db.numero.find_unique(where={"valeur": val})
        if not existing:
            data = {
                "valeur": val,
                "scoreRisque": score,
                "statut": statut,
            }
            if c_id:
                data["country"] = {"connect": {"id": c_id}}
            if op_id:
                data["operator"] = {"connect": {"id": op_id}}
            n = await db.numero.create(data=data)
            numero_ids[val] = n.id
        else:
            numero_ids[val] = existing.id
    return numero_ids


async def seed_user_phones(user_ids: dict[str, str], country_ids: dict[str, str], operator_ids: dict[str, str], numero_ids: dict[str, str]) -> None:
    """Lie les numeros principaux aux utilisateurs de test."""
    cameroun_id = country_ids.get("+237")

    phones = [
        ("user@kwismo.com", "+237670000001", operator_ids.get("MTN Cameroun")),
        ("partner@kwismo.com", "+237690000002", operator_ids.get("Orange Cameroun")),
    ]

    for email, val, op_id in phones:
        u_id = user_ids.get(email)
        num_id = numero_ids.get(val)
        if not u_id or not num_id or not cameroun_id:
            continue
        existing = await db.userphone.find_first(where={"userId": u_id, "valeur": val})
        if not existing:
            data = {
                "valeur": val,
                "estVerifie": True,
                "user": {"connect": {"id": u_id}},
                "country": {"connect": {"id": cameroun_id}},
                "numero": {"connect": {"id": num_id}},
            }
            if op_id:
                data["operator"] = {"connect": {"id": op_id}}
            await db.userphone.create(data=data)


async def seed_devices(user_ids: dict[str, str]) -> None:
    """Cree des appareils enregistres."""
    devs = [
        ("user@kwismo.com", "android_device_user_1", "Samsung Galaxy S22"),
        ("admin@kwismo.com", "ios_device_admin_1", "iPhone 15 Pro"),
    ]
    for email, ident, nom in devs:
        u_id = user_ids.get(email)
        if not u_id:
            continue
        existing = await db.device.find_unique(where={"userId_identifiant": {"userId": u_id, "identifiant": ident}})
        if not existing:
            await db.device.create(
                data={
                    "user": {"connect": {"id": u_id}},
                    "identifiant": ident,
                    "nom": nom,
                }
            )


async def seed_contacts(user_ids: dict[str, str], numero_ids: dict[str, str]) -> None:
    """Cree des contacts de repertoire."""
    u_id = user_ids.get("user@kwismo.com")
    if not u_id:
        return

    contacts = [
        ("Maman", "+237677889900", "securise"),
        ("Jean Paul", "+237699001122", "securise"),
    ]

    for nom, num_val, stat in contacts:
        n_id = numero_ids.get(num_val)
        existing = await db.contact.find_first(where={"userId": u_id, "numero": num_val})
        if not existing:
            data = {
                "user": {"connect": {"id": u_id}},
                "nom": nom,
                "numero": num_val,
                "statut": stat,
            }
            if n_id:
                data["numeroRef"] = {"connect": {"id": n_id}}
            await db.contact.create(data=data)


async def seed_scam_categories() -> dict[str, str]:
    """Cree les categories d'arnaques."""
    cats = [
        ("phishing", "Hameçonnage / Faux SMS Opérateur", "SMS piégé demandant le code secret MoMo ou Orange Money."),
        ("sim_swap", "Usurpation de Carte SIM", "Transfert frauduleux de ligne mobile vers une autre carte SIM."),
        ("fake_operator", "Faux Agent d'Assistance", "Appel se réclamant du service client pour soutirer des données."),
        ("social_engineering", "Faux Gain / Loterie", "Message annonçant un gain fictif conditionné par un transfert d'argent."),
    ]
    ids = {}
    for code, lib, desc in cats:
        existing = await db.scamcategory.find_unique(where={"nomCode": code})
        if not existing:
            sc = await db.scamcategory.create(
                data={"nomCode": code, "libelle": lib, "description": desc}
            )
            ids[code] = sc.id
        else:
            ids[code] = existing.id
    return ids


async def seed_reports(user_ids: dict[str, str], numero_ids: dict[str, str], scam_cat_ids: dict[str, str]) -> None:
    """Cree des signalements de fraude et leurs categories."""
    u_user_id = user_ids.get("user@kwismo.com")
    u_paul_id = user_ids.get("user2@kwismo.com")
    scam_num_id = numero_ids.get("+237670999888")
    suspect_num_id = numero_ids.get("+237699111222")

    if not u_user_id or not scam_num_id:
        return

    # Signalement 1
    r1 = await db.report.find_first(where={"userId": u_user_id, "numeroId": scam_num_id})
    if not r1:
        r1 = await db.report.create(
            data={
                "user": {"connect": {"id": u_user_id}},
                "numero": {"connect": {"id": scam_num_id}},
                "motif": "Ce numero m'a envoye un SMS pretendant que mon compte MoMo etait bloque et exigeant mon PIN.",
                "statut": "validated",
            }
        )
        if scam_cat_ids.get("phishing"):
            await db.reportcategory.create(
                data={
                    "report": {"connect": {"id": r1.id}},
                    "scamCategory": {"connect": {"id": scam_cat_ids["phishing"]}},
                }
            )

        # Feedback sur signalement 1 par Paul
        if u_paul_id:
            await db.feedback.create(
                data={
                    "report": {"connect": {"id": r1.id}},
                    "user": {"connect": {"id": u_paul_id}},
                    "typeRetour": "report",
                    "contenu": "Merci beaucoup pour ce signalement, ce numero a aussi tente de m'appeler !",
                }
            )

    # Signalement 2
    if u_paul_id and suspect_num_id:
        r2 = await db.report.find_first(where={"userId": u_paul_id, "numeroId": suspect_num_id})
        if not r2:
            r2 = await db.report.create(
                data={
                    "user": {"connect": {"id": u_paul_id}},
                    "numero": {"connect": {"id": suspect_num_id}},
                    "motif": "Appel suspect d'une personne se disant du support technique Orange Money.",
                    "statut": "pending",
                }
            )
            if scam_cat_ids.get("fake_operator"):
                await db.reportcategory.create(
                    data={
                        "report": {"connect": {"id": r2.id}},
                        "scamCategory": {"connect": {"id": scam_cat_ids["fake_operator"]}},
                    }
                )


async def seed_transactions(user_ids: dict[str, str], numero_ids: dict[str, str]) -> None:
    """Cree des transactions de test."""
    u_id = user_ids.get("user@kwismo.com")
    n1_id = numero_ids.get("+237670000001")
    n_scam_id = numero_ids.get("+237670999888")

    if not u_id or not n1_id:
        return

    txs = [
        (n1_id, 15000.0, "confirmed", "low", "*126*15000*670000001#"),
        (n_scam_id, 50000.0, "cancelled", "critical", None),
    ]

    for num_id, mont, stat, niv, code in txs:
        if not num_id:
            continue
        existing = await db.transaction.find_first(where={"userId": u_id, "numeroId": num_id, "montant": mont})
        if not existing:
            data = {
                "user": {"connect": {"id": u_id}},
                "numero": {"connect": {"id": num_id}},
                "montant": mont,
                "statut": stat,
                "niveauRisque": niv,
            }
            if code:
                data["codeUSSDGenere"] = code
            await db.transaction.create(data=data)


async def seed_notifications_and_kpis(user_ids: dict[str, str], partner_ids: dict[str, str]) -> None:
    """Cree les notifications et les indicateurs KPI."""
    u_id = user_ids.get("user@kwismo.com")
    if u_id:
        notifs = [
            ("Bienvenue sur KWISMO ! Votre compte est maintenant protege.", True),
            ("Alerte de securite : Un numero frauduleux a ete signale dans votre zone.", False),
        ]
        for txt, lu in notifs:
            existing = await db.notification.find_first(where={"userId": u_id, "texte": txt})
            if not existing:
                await db.notification.create(data={"user": {"connect": {"id": u_id}}, "texte": txt, "lu": lu})

    # KPIs
    kpis = [
        ("signalements_mensuels", 1240.0, "2026-08", "global", None),
        ("taux_resolution", 94.5, "2026-08", "global", None),
        ("partenaire_transactions", 850.0, "2026-08", "partner", partner_ids.get("KWISMO Partner Test")),
    ]
    for nom, val, per, port, p_id in kpis:
        existing = await db.kpi.find_first(where={"nomIndicateur": nom, "periode": per})
        if not existing:
            data = {"nomIndicateur": nom, "valeur": val, "periode": per, "portee": port}
            if p_id:
                data["partner"] = {"connect": {"id": p_id}}
            await db.kpi.create(data=data)


async def seed_audit_logs(user_ids: dict[str, str]) -> None:
    """Cree des journalisations d'audit."""
    admin_id = user_ids.get("admin@kwismo.com")
    if not admin_id:
        return

    logs = [
        ("LOGIN_SUCCESS", "auth/login", "127.0.0.1"),
        ("REPORT_VERIFIED", "reports/report-1", "127.0.0.1"),
    ]
    for act, cib, ip in logs:
        existing = await db.auditlog.find_first(where={"userId": admin_id, "action": act})
        if not existing:
            await db.auditlog.create(
                data={"user": {"connect": {"id": admin_id}}, "action": act, "cible": cib, "ip": ip}
            )


async def main() -> None:
    await connect_db()
    try:
        print("[SEED] Demarrage de l'ensemencement complet de la base de donnees...")
        role_ids = await seed_roles_and_permissions()
        partner_ids = await seed_partners()
        user_ids = await seed_users(role_ids, partner_ids)
        country_ids = await seed_countries()
        operator_ids = await seed_operators(country_ids)
        await seed_ussd_actions(operator_ids)
        numero_ids = await seed_numeros(country_ids, operator_ids)
        await seed_user_phones(user_ids, country_ids, operator_ids, numero_ids)
        await seed_devices(user_ids)
        await seed_contacts(user_ids, numero_ids)
        scam_cat_ids = await seed_scam_categories()
        await seed_reports(user_ids, numero_ids, scam_cat_ids)
        await seed_transactions(user_ids, numero_ids)
        await seed_notifications_and_kpis(user_ids, partner_ids)
        await seed_audit_logs(user_ids)
        print("[SEED] Base de donnees initialisee et chargee avec succes avec toutes les donnees de test.")
    finally:
        await disconnect_db()


if __name__ == "__main__":
    asyncio.run(main())
