"""Routes d'administration et de modération des catégories d'arnaques (kwismo-backend).
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.modules.ai_gateway import service

router = APIRouter(prefix="/admin/scam-categories", tags=["Admin Scam Categories"])


class ScamCategoryUpdateIn(BaseModel):
    libelle: str | None = Field(None, description="Libellé lisible pour l'application mobile")
    description: str | None = Field(None, description="Explication détaillée de cette forme d'arnaque")


@router.get("", summary="Lister toutes les catégories d'arnaques")
async def get_scam_categories():
    return await service.list_scam_categories()


@router.patch("/{category_id}", summary="Modérer / Renommer une catégorie d'arnaque")
async def patch_scam_category(category_id: str, payload: ScamCategoryUpdateIn):
    try:
        return await service.update_scam_category(
            category_id=category_id,
            libelle=payload.libelle,
            description=payload.description
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Catégorie introuvable ou erreur de mise à jour: {err}"
        )
