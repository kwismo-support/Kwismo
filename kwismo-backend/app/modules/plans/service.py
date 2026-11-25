"""Service métier pour la gestion des formules d'abonnement / Plans."""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import HTTPException, status

from app.db.prisma_client import db
from app.modules.plans.schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanResponse,
    SubscriptionPlanUpdate,
)

logger = logging.getLogger("kwismo.backend")


def _format_plan_record(rec: Any) -> SubscriptionPlanResponse:
    """Normalise un enregistrement Prisma ou dict en SubscriptionPlanResponse."""
    if isinstance(rec, dict):
        d = rec
    else:
        d = rec.__dict__ if hasattr(rec, "__dict__") else dict(rec)

    options_fr_val = d.get("optionsFr") or d.get("options_fr")
    options_en_val = d.get("optionsEn") or d.get("options_en")

    if isinstance(options_fr_val, str):
        try:
            options_fr_val = json.loads(options_fr_val)
        except Exception:
            options_fr_val = [line.strip() for line in options_fr_val.split("\n") if line.strip()]
    elif not isinstance(options_fr_val, list):
        options_fr_val = []

    if isinstance(options_en_val, str):
        try:
            options_en_val = json.loads(options_en_val)
        except Exception:
            options_en_val = [line.strip() for line in options_en_val.split("\n") if line.strip()]
    elif not isinstance(options_en_val, list):
        options_en_val = []

    return SubscriptionPlanResponse(
        id=d.get("id", ""),
        code=d.get("code", ""),
        nom_fr=d.get("nomFr") or d.get("nom_fr", ""),
        nom_en=d.get("nomEn") or d.get("nom_en", ""),
        prix_fcfa=int(d.get("prixFcfa") or d.get("prix_fcfa", 0)),
        duree_jours=int(d.get("dureeJours") or d.get("duree_jours", 30)),
        max_numeros=int(d.get("maxNumeros") or d.get("max_numeros", 1)),
        max_membres=int(d.get("maxMembres") or d.get("max_membres", 1)),
        description_fr=d.get("descriptionFr") or d.get("description_fr"),
        description_en=d.get("descriptionEn") or d.get("description_en"),
        options_fr=options_fr_val,
        options_en=options_en_val,
        badge_fr=d.get("badgeFr") or d.get("badge_fr"),
        badge_en=d.get("badgeEn") or d.get("badge_en"),
        est_actif=bool(d.get("estActif") if "estActif" in d else d.get("est_actif", True)),
        ordre=int(d.get("ordre", 0)),
        created_at=d.get("createdAt") or d.get("created_at"),
        updated_at=d.get("updatedAt") or d.get("updated_at"),
    )


class PlansService:

    async def list_active_plans(self) -> list[SubscriptionPlanResponse]:
        """Retourne la liste des formules actives pour le public / utilisateurs."""
        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                plans = await db.subscriptionplan.find_many(
                    where={"estActif": True},
                    order=[{"ordre": "asc"}, {"prixFcfa": "asc"}],
                )
                return [_format_plan_record(p) for p in plans]
            except Exception as e:
                logger.warning("Prisma client subscriptionplan find_many error, falling back to raw SQL: %s", e)

        raw = await db.query_raw(
            'SELECT * FROM "SubscriptionPlan" WHERE "estActif" = true OR "estActif" = 1 ORDER BY "ordre" ASC, "prixFcfa" ASC'
        )
        return [_format_plan_record(r) for r in raw]

    async def list_all_plans(self) -> list[SubscriptionPlanResponse]:
        """Retourne toutes les formules (actives et inactives) pour l'administrateur."""
        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                plans = await db.subscriptionplan.find_many(
                    order=[{"ordre": "asc"}, {"prixFcfa": "asc"}],
                )
                return [_format_plan_record(p) for p in plans]
            except Exception as e:
                logger.warning("Prisma client subscriptionplan find_many error, falling back to raw SQL: %s", e)

        raw = await db.query_raw(
            'SELECT * FROM "SubscriptionPlan" ORDER BY "ordre" ASC, "prixFcfa" ASC'
        )
        return [_format_plan_record(r) for r in raw]

    async def get_plan_by_id(self, plan_id: str) -> SubscriptionPlanResponse:
        """Récupère une formule par son ID."""
        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                plan = await db.subscriptionplan.find_unique(where={"id": plan_id})
                if not plan:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan non trouvé.")
                return _format_plan_record(plan)
            except HTTPException:
                raise
            except Exception as e:
                logger.warning("Prisma client get_plan_by_id error, falling back to raw SQL: %s", e)

        raw = await db.query_raw('SELECT * FROM "SubscriptionPlan" WHERE "id" = $1 LIMIT 1', plan_id)
        if not raw:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan non trouvé.")
        return _format_plan_record(raw[0])

    async def create_plan(self, data: SubscriptionPlanCreate) -> SubscriptionPlanResponse:
        """Crée une nouvelle formule d'abonnement (Admin uniquement)."""
        options_fr_str = json.dumps(data.options_fr or [], ensure_ascii=False)
        options_en_str = json.dumps(data.options_en or [], ensure_ascii=False)

        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                existing = await db.subscriptionplan.find_unique(where={"code": data.code})
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Une formule avec le code '{data.code}' existe déjà.",
                    )

                created = await db.subscriptionplan.create(
                    data={
                        "code": data.code,
                        "nomFr": data.nom_fr,
                        "nomEn": data.nom_en,
                        "prixFcfa": data.prix_fcfa,
                        "dureeJours": data.duree_jours,
                        "maxNumeros": data.max_numeros,
                        "maxMembres": data.max_membres,
                        "descriptionFr": data.description_fr,
                        "descriptionEn": data.description_en,
                        "optionsFr": options_fr_str,
                        "optionsEn": options_en_str,
                        "badgeFr": data.badge_fr,
                        "badgeEn": data.badge_en,
                        "estActif": data.est_actif,
                        "ordre": data.ordre,
                    }
                )
                return _format_plan_record(created)
            except HTTPException:
                raise
            except Exception as e:
                logger.warning("Prisma client create plan error, falling back to raw SQL: %s", e)

        # Fallback SQL
        existing = await db.query_raw('SELECT * FROM "SubscriptionPlan" WHERE "code" = $1 LIMIT 1', data.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Une formule avec le code '{data.code}' existe déjà.",
            )

        new_id = f"plan_{uuid.uuid4().hex[:16]}"
        now = datetime.now(timezone.utc)
        await db.execute_raw(
            '''
            INSERT INTO "SubscriptionPlan" 
            ("id", "code", "nomFr", "nomEn", "prixFcfa", "dureeJours", "maxNumeros", "maxMembres", "descriptionFr", "descriptionEn", "optionsFr", "optionsEn", "badgeFr", "badgeEn", "estActif", "ordre", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ''',
            new_id, data.code, data.nom_fr, data.nom_en, data.prix_fcfa, data.duree_jours,
            data.max_numeros, data.max_membres, data.description_fr, data.description_en,
            options_fr_str, options_en_str, data.badge_fr, data.badge_en, data.est_actif, data.ordre,
            now, now
        )
        return await self.get_plan_by_id(new_id)

    async def update_plan(self, plan_id: str, data: SubscriptionPlanUpdate) -> SubscriptionPlanResponse:
        """Met à jour une formule existante (Admin uniquement)."""
        existing = await self.get_plan_by_id(plan_id)

        update_data: dict[str, Any] = {}
        if data.code is not None:
            update_data["code"] = data.code
        if data.nom_fr is not None:
            update_data["nomFr"] = data.nom_fr
        if data.nom_en is not None:
            update_data["nomEn"] = data.nom_en
        if data.prix_fcfa is not None:
            update_data["prixFcfa"] = data.prix_fcfa
        if data.duree_jours is not None:
            update_data["dureeJours"] = data.duree_jours
        if data.max_numeros is not None:
            update_data["maxNumeros"] = data.max_numeros
        if data.max_membres is not None:
            update_data["maxMembres"] = data.max_membres
        if data.description_fr is not None:
            update_data["descriptionFr"] = data.description_fr
        if data.description_en is not None:
            update_data["descriptionEn"] = data.description_en
        if data.options_fr is not None:
            update_data["optionsFr"] = json.dumps(data.options_fr, ensure_ascii=False)
        if data.options_en is not None:
            update_data["optionsEn"] = json.dumps(data.options_en, ensure_ascii=False)
        if data.badge_fr is not None:
            update_data["badgeFr"] = data.badge_fr
        if data.badge_en is not None:
            update_data["badgeEn"] = data.badge_en
        if data.est_actif is not None:
            update_data["estActif"] = data.est_actif
        if data.ordre is not None:
            update_data["ordre"] = data.ordre

        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                updated = await db.subscriptionplan.update(
                    where={"id": plan_id},
                    data=update_data,
                )
                return _format_plan_record(updated)
            except Exception as e:
                logger.warning("Prisma client update plan error, falling back to raw SQL: %s", e)

        # Fallback SQL update
        now = datetime.now(timezone.utc)
        clauses = []
        params = []
        idx = 1
        for k, v in update_data.items():
            clauses.append(f'"{k}" = ${idx}')
            params.append(v)
            idx += 1
        clauses.append(f'"updatedAt" = ${idx}')
        params.append(now)
        idx += 1
        params.append(plan_id)

        sql = f'UPDATE "SubscriptionPlan" SET {", ".join(clauses)} WHERE "id" = ${idx}'
        await db.execute_raw(sql, *params)
        return await self.get_plan_by_id(plan_id)

    async def toggle_plan_status(self, plan_id: str) -> SubscriptionPlanResponse:
        """Active ou désactive une formule en un clic."""
        existing = await self.get_plan_by_id(plan_id)
        new_status = not existing.est_actif
        return await self.update_plan(plan_id, SubscriptionPlanUpdate(est_actif=new_status))

    async def delete_plan(self, plan_id: str) -> dict[str, str]:
        """Supprime une formule d'abonnement."""
        await self.get_plan_by_id(plan_id)
        if hasattr(db, "subscriptionplan") and db.subscriptionplan:
            try:
                await db.subscriptionplan.delete(where={"id": plan_id})
                return {"message": "Plan supprimé avec succès."}
            except Exception as e:
                logger.warning("Prisma client delete plan error, falling back to raw SQL: %s", e)

        await db.execute_raw('DELETE FROM "SubscriptionPlan" WHERE "id" = $1', plan_id)
        return {"message": "Plan supprimé avec succès."}


plans_service = PlansService()
