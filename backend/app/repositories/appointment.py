from typing import List, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Cita, Usuario


class AppointmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, appointment: Cita) -> Cita:
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def list_by_professional(self, professional_id: int) -> List[Tuple[Cita, str]]:
        stmt = (
            select(Cita, Usuario.nombre.label("otro_nombre"))
            .join(Usuario, Cita.id_paciente == Usuario.id)
            .where(Cita.id_profesional == professional_id)
            .order_by(Cita.fecha_cita.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def list_by_patient(self, patient_id: int) -> List[Tuple[Cita, str]]:
        stmt = (
            select(Cita, Usuario.nombre.label("otro_nombre"))
            .join(Usuario, Cita.id_profesional == Usuario.id)
            .where(Cita.id_paciente == patient_id)
            .order_by(Cita.fecha_cita.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.all())
