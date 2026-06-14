"""
Configuración global de pytest con fixtures reutilizables para todos los tests
"""

import asyncio
import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import get_db
from app.core import security
from app.main import app
from app.models.base import Base, Evaluacion, Usuario

# Configuración de la base de datos de prueba
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    """Función para sobreescribir la dependencia de base de datos"""
    async with TestingSessionLocal() as db:
        yield db


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Crear y proporcionar el event loop para las pruebas async"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


async def _seed_admin_user(db: AsyncSession) -> None:
    """Crea el usuario admin requerido por las pruebas funcionales."""
    result = await db.execute(select(Usuario).where(Usuario.email == "admin@mindguard.ai"))
    admin = result.scalars().first()
    if not admin:
        db.add(
            Usuario(
                email="admin@mindguard.ai",
                password_hash=security.get_password_hash("admin123"),
                nombre="Admin MindGuard",
                rol="admin",
            )
        )


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Configurar la base de datos de prueba al inicio de la sesión"""
    app.dependency_overrides[get_db] = override_get_db
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with TestingSessionLocal() as db:
        await _seed_admin_user(db)
        await db.commit()
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(autouse=True)
async def clean_database():
    """Limpia datos entre tests para evitar colisiones de email o historial."""
    async with TestingSessionLocal() as db:
        await db.execute(delete(Evaluacion))
        await db.execute(delete(Usuario).where(Usuario.email != "admin@mindguard.ai"))
        await _seed_admin_user(db)
        await db.commit()
    yield


@pytest_asyncio.fixture
async def db_session():
    """Fixture para proporcionar una sesión de BD limpia para cada test"""
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    """Fixture para proporcionar un cliente HTTP async para los tests"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def admin_credentials():
    """Fixture con credenciales del admin para pruebas de funcionalidad"""
    return {
        "email": "admin@mindguard.ai",
        "password": "admin123",
        "username": "admin@mindguard.ai"
    }


@pytest.fixture
def test_user_credentials():
    """Fixture con credenciales de usuario de prueba (email único por test)."""
    unique_id = uuid.uuid4().hex[:8]
    return {
        "email": f"testuser_{unique_id}@example.com",
        "password": "TestPassword123!",
        "nombre": "Test User",
    }


@pytest.fixture
def sample_assessment_data():
    """Fixture con datos de evaluación de prueba"""
    return {
        "phq9Score": 8,
        "gad7Score": 6,
        "phq9Answers": [1, 1, 1, 1, 1, 0, 1, 1, 0],
        "gad7Answers": [1, 1, 1, 1, 0, 0, 0],
        "text_input": "Me siento ansioso y con dificultad para concentrarme."
    }


@pytest.fixture
def sample_assessment_data_high_risk():
    """Fixture con datos de evaluación de alto riesgo"""
    return {
        "phq9Score": 20,
        "gad7Score": 18,
        "phq9Answers": [3, 3, 3, 2, 2, 2, 2, 2, 2],
        "gad7Answers": [3, 3, 3, 3, 3, 2, 2],
        "text_input": "Tengo pensamientos suicidas frecuentes y ansiedad severa."
    }


@pytest.fixture
def sample_assessment_data_low_risk():
    """Fixture con datos de evaluación de bajo riesgo"""
    return {
        "phq9Score": 2,
        "gad7Score": 1,
        "phq9Answers": [0, 0, 1, 0, 0, 1, 0, 0, 0],
        "gad7Answers": [0, 0, 1, 0, 0, 0, 0],
        "text_input": "Me siento bien generalmente."
    }
