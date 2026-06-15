from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Evaluacion

class EvaluationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, evaluation_id: int) -> Optional[Evaluacion]:
        result = await self.db.execute(select(Evaluacion).where(Evaluacion.id == evaluation_id))
        return result.scalars().first()

    async def list_by_user_asc(self, user_id: int) -> List[Evaluacion]:
        result = await self.db.execute(
            select(Evaluacion)
            .where(Evaluacion.id_usuario == user_id)
            .order_by(Evaluacion.fecha.asc())
        )
        return list(result.scalars().all())

    async def list_by_user_desc(self, user_id: int) -> List[Evaluacion]:
        result = await self.db.execute(
            select(Evaluacion)
            .where(Evaluacion.id_usuario == user_id)
            .order_by(Evaluacion.fecha.desc())
        )
        return list(result.scalars().all())

    async def create(self, evaluation: Evaluacion) -> Evaluacion:
        self.db.add(evaluation)
        await self.db.commit()
        await self.db.refresh(evaluation)
        return evaluation
