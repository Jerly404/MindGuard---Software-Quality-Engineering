from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Usuario

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[Usuario]:
        result = await self.db.execute(select(Usuario).where(Usuario.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[Usuario]:
        result = await self.db.execute(select(Usuario).where(Usuario.email == email))
        return result.scalars().first()

    async def create(self, user: Usuario) -> Usuario:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def list_all(self) -> List[Usuario]:
        result = await self.db.execute(select(Usuario))
        return list(result.scalars().all())

    async def list_professionals(self) -> List[Usuario]:
        result = await self.db.execute(select(Usuario).where(Usuario.rol == "profesional"))
        return list(result.scalars().all())

    async def delete(self, user: Usuario) -> None:
        await self.db.delete(user)
        await self.db.commit()
