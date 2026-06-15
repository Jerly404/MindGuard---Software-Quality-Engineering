from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import TransaccionMock

class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, transaction: TransaccionMock) -> TransaccionMock:
        self.db.add(transaction)
        # We don't commit immediately if part of a larger unit of work, but we do standard commit
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def get_earnings_by_professional(self, professional_id: int) -> float:
        stmt = select(func.sum(TransaccionMock.monto)).where(TransaccionMock.id_profesional == professional_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0.0
