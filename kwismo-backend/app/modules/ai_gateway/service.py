"""Service de gestion et modération des catégories d'arnaques découvertes par l'IA (kwismo-backend).
"""

from typing import Any
from app.db.prisma import prisma


async def list_scam_categories() -> list[dict[str, Any]]:
    """Liste toutes les catégories d'arnaques enregistrées en BD avec leur nombre de signalements."""
    categories = await prisma.scamcategory.find_many(
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

    updated = await prisma.scamcategory.update(
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
