import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.base import Base, Usuario

# Forzamos SQLite local para el reset manual si es necesario, 
# o usamos la URL de configuración.
engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def reset_db_vacia():
    async with engine.begin() as conn:
        # CUIDADO: Esto borrará todo si las tablas ya existen y las recreamos,
        # pero para asegurar que esté vacía, primero las eliminamos.
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Tablas recreadas (vacías).")

    async with SessionLocal() as db:
        # 1. Crear usuario admin
        admin_email = "admin@mindguard.ai"
        user = Usuario(
            nombre="Administrador",
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            rol="admin",
        )
        db.add(user)
        await db.commit()
        print(f"Usuario admin creado ({admin_email}).")

    print("Base de datos reseteada y lista con solo el admin.")

if __name__ == "__main__":
    asyncio.run(reset_db_vacia())
