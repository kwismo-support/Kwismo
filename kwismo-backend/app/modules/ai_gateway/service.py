"""Service de gestion, modération et synchronisation dynamique des catégories d'arnaques découvertes par l'IA (kwismo-backend).
"""

from typing import Any
from app.db.prisma_client import db


async def sync_discovered_categories(assigned_categories: dict[str, str]) -> None:
    """Synchronise dynamiquement les catégories découvertes par l'IA avec la base de données.

    Si le Modèle B renvoie une nouvelle catégorie non enregistrée dans la table `ScamCategory`,
    celle-ci est créée automatiquement en base de données sans aucune interruption de service.
    """
    if not assigned_categories:
        return

    unique_codes = set(assigned_categories.values())

    for code in unique_codes:
        if not code or code in ("unknown_scam_pattern", "legitimate_info", "legitimate_chat"):
            continue

        existing = await db.scamcategory.find_unique(where={"nomCode": code})
        if not existing:
            libelle = code.replace("_", " ").title()
            existing = await db.scamcategory.create(
                data={
                    "nomCode": code,
                    "libelle": libelle,
                    "description": f"Catégorie d'escroquerie découverte automatiquement par le Modèle B IA ({code}).",
                }
            )

    # Association des catégories aux signalements en BD
    for report_id, cat_code in assigned_categories.items():
        if not cat_code or cat_code in ("unknown_scam_pattern", "legitimate_info", "legitimate_chat"):
            continue

        scam_cat = await db.scamcategory.find_unique(where={"nomCode": cat_code})
        if scam_cat:
            try:
                await db.reportcategory.upsert(
                    where={
                        "reportId_scamCategoryId": {
                            "reportId": report_id,
                            "scamCategoryId": scam_cat.id,
                        }
                    },
                    data={
                        "create": {
                            "reportId": report_id,
                            "scamCategoryId": scam_cat.id,
                        },
                        "update": {},
                    },
                )
            except Exception:
                pass


async def list_scam_categories() -> list[dict[str, Any]]:
    """Liste toutes les catégories d'arnaques enregistrées en BD avec leur nombre de signalements."""
    categories = await db.scamcategory.find_many(
        include={"reportCategories": True},
        order={"createdAt": "desc"}
    )
    
    result = []
    for cat in categories:
        count = len(cat.reportCategories) if cat.reportCategories else 0
        result.append({
            "id": cat.id,
            "nomCode": cat.nomCode,
            "libelle": cat.libelle,
            "description": cat.description,
            "nombreSignalements": count,
            "createdAt": cat.createdAt.isoformat() if cat.createdAt else None,
        })
    return result


async def update_scam_category(category_id: str, libelle: str | None = None, description: str | None = None) -> dict[str, Any]:
    """Permet à un administrateur de modérer/renommer le libellé et la description d'une catégorie."""
    update_data = {}
    if libelle is not None:
        update_data["libelle"] = libelle
    if description is not None:
        update_data["description"] = description

    updated = await db.scamcategory.update(
        where={"id": category_id},
        data=update_data
    )

    return {
        "id": updated.id,
        "nomCode": updated.nomCode,
        "libelle": updated.libelle,
        "description": updated.description,
        "updatedAt": updated.createdAt.isoformat() if updated.createdAt else None,
    }
