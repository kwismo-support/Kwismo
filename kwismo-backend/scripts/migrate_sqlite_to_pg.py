"""Script d'export et de migration des donnees de dev.db (SQLite) vers PostgreSQL.
Formate parfaitement les timestamps, booleens et contraintes pour PostgreSQL.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone

SQLITE_PATH = Path(__file__).resolve().parent.parent / "prisma" / "dev.db"
OUTPUT_SQL_PATH = Path(__file__).resolve().parent.parent / "prisma" / "data_seed_pg.sql"

TABLE_ORDER = [
    "Role",
    "Country",
    "Partner",
    "User",
    "AccessRight",
    "UserPhone",
    "Device",
    "OtpCode",
    "Operator",
    "OperatorPrefix",
    "UssdAction",
    "Numero",
    "Contact",
    "ScamCategory",
    "ReportCategory",
    "Report",
    "CompromiseIncident",
    "Transaction",
    "WhatsAppAlert",
    "WhatsAppAlertRecipient",
    "Survey",
    "SurveyResponse",
    "Kpi",
    "AuditLog",
    "Notification",
    "Feedback"
]

DATETIME_FIELDS = {
    'createdat', 'date', 'dateadhesion', 'datecreation', 'datedeclaration',
    'datederniereconnexion', 'datederniereverification', 'dateenvoi',
    'dateexpiration', 'dateinscription', 'datepremiereconnexion',
    'datereponse', 'datesignalement', 'datetransaction', 'dateverification',
    'updatedat'
}

BOOLEAN_FIELDS = {
    'actif', 'emailverifie', 'estcompromis', 'estpardefaut',
    'estutilise', 'estverifie', 'lu'
}

def format_value(col_name, val):
    if val is None:
        return "NULL"
    
    col_lower = col_name.lower()
    
    # Handle Booleans
    if col_lower in BOOLEAN_FIELDS or isinstance(val, bool):
        return "TRUE" if val in (1, True, "1", "true", "True") else "FALSE"
        
    # Handle DateTimes
    if col_lower in DATETIME_FIELDS:
        if isinstance(val, (int, float)):
            # Millisecond integer timestamp
            try:
                dt = datetime.fromtimestamp(val / 1000.0, timezone.utc)
                return f"'{dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}+00'"
            except:
                return f"to_timestamp({val} / 1000.0)"
        elif isinstance(val, str):
            if val.isdigit():
                try:
                    dt = datetime.fromtimestamp(int(val) / 1000.0, timezone.utc)
                    return f"'{dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}+00'"
                except:
                    return f"to_timestamp({val} / 1000.0)"
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
            
    if isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, str):
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    elif isinstance(val, bytes):
        escaped = val.decode('utf-8', errors='ignore').replace("'", "''")
        return f"'{escaped}'"
    else:
        escaped = str(val).replace("'", "''")
        return f"'{escaped}'"

def dump_sqlite_to_pg():
    if not SQLITE_PATH.exists():
        print(f"Erreur : {SQLITE_PATH} introuvable.")
        return False

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    sql_lines = [
        "-- Export automatique de Kwismo dev.db vers PostgreSQL",
        f"-- Genere le : {datetime.now().isoformat()}",
        "BEGIN;",
        "SET CONSTRAINTS ALL DEFERRED;"
    ]

    total_exported = 0

    for table in TABLE_ORDER:
        try:
            cursor.execute(f"SELECT * FROM \"{table}\"")
            rows = cursor.fetchall()
            if not rows:
                continue

            col_names = [f'"{col}"' for col in rows[0].keys()]
            cols_str = ", ".join(col_names)

            sql_lines.append(f"\n-- Table {table} ({len(rows)} lignes)")
            for row in rows:
                vals = [format_value(k, row[k]) for k in row.keys()]
                vals_str = ", ".join(vals)
                sql_lines.append(f'INSERT INTO "{table}" ({cols_str}) VALUES ({vals_str}) ON CONFLICT DO NOTHING;')
                total_exported += 1

        except Exception as e:
            print(f"Table {table}: ignoree ou erreur ({e})")

    sql_lines.append("\nCOMMIT;")

    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"Export termine avec succes : {total_exported} lignes exportees dans {OUTPUT_SQL_PATH}")
    return True

if __name__ == "__main__":
    dump_sqlite_to_pg()
