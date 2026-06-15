from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import AsignacionProfesional, Usuario


class AssignmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_by_patient(self, patient_id: int) -> Optional[AsignacionProfesional]:
        result = await self.db.execute(
            select(AsignacionProfesional).where(
                AsignacionProfesional.id_paciente == patient_id, AsignacionProfesional.activa
            )
        )
        return result.scalars().first()

    async def get_active_assignments_by_patient(self, patient_id: int) -> List[AsignacionProfesional]:
        result = await self.db.execute(
            select(AsignacionProfesional).where(
                AsignacionProfesional.id_paciente == patient_id, AsignacionProfesional.activa
            )
        )
        return list(result.scalars().all())

    async def deactivate_all_for_patient(self, patient_id: int) -> None:
        result = await self.db.execute(
            select(AsignacionProfesional).where(
                AsignacionProfesional.id_paciente == patient_id, AsignacionProfesional.activa
            )
        )
        for old in result.scalars().all():
            old.activa = False

    async def create(self, assignment: AsignacionProfesional) -> AsignacionProfesional:
        self.db.add(assignment)
        await self.db.commit()
        await self.db.refresh(assignment)
        return assignment

    async def list_assigned_patients(self, professional_id: int) -> List[Usuario]:
        stmt = (
            select(Usuario)
            .join(AsignacionProfesional, Usuario.id == AsignacionProfesional.id_paciente)
            .where(AsignacionProfesional.id_profesional == professional_id, AsignacionProfesional.activa)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
