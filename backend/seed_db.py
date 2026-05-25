import asyncio
import random
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.base import Evaluacion, Usuario

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with SessionLocal() as db:
        # 1. Crear usuario admin si no existe
        result = await db.execute(select(Usuario).where(Usuario.email == "admin@mindguard.ai"))
        user = result.scalars().first()

        if not user:
            user = Usuario(
                nombre="Administrador",
                email="admin@mindguard.ai",
                password_hash=get_password_hash("admin123"),
                rol="admin",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print("Usuario admin creado.")

        # 2. Crear profesional de prueba
        result_pro = await db.execute(select(Usuario).where(Usuario.email == "psicologo@mindguard.ai"))
        if not result_pro.scalars().first():
            pro = Usuario(
                nombre="Dr. Ricardo Gareca",
                email="psicologo@mindguard.ai",
                password_hash=get_password_hash("admin123"),
                rol="profesional",
            )
            db.add(pro)
            await db.commit()
            print("Profesional de prueba creado.")

        # 3. Agregar historial de prueba
        result_ev = await db.execute(select(Evaluacion).where(Evaluacion.id_usuario == user.id))
        if not result_ev.scalars().first():
            print("Insertando historial de prueba...")
            for i in range(10):
                fecha = datetime.utcnow() - timedelta(days=(10 - i))
                ev = Evaluacion(
                    id_usuario=user.id,
                    fecha=fecha,
                    phq9Score=random.randint(5, 20),
                    gad7Score=random.randint(5, 20),
                    nivelRiesgo=random.choice(["Leve", "Moderado", "Alto"]),
                    resultadoIA="Análisis de prueba generado automáticamente.",
                    has_high_risk=random.choice([True, False]),
                    notas_personales=f"Evaluación del día {fecha.date()}",
                )
                db.add(ev)
            await db.commit()
            print("Historial de prueba creado.")


if __name__ == "__main__":
    asyncio.run(seed())
