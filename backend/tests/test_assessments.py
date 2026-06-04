
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import get_db
from app.core import security
from app.main import app
from app.models.base import Base, Usuario

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test_assessments.db"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db():
    async with TestingSessionLocal() as db:
        yield db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    app.dependency_overrides[get_db] = override_get_db
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_evaluation():
    # 1. Create a user and get token
    async with TestingSessionLocal() as db:
        user = Usuario(email="eval@example.com", password_hash=security.get_password_hash("pass"), nombre="Eval User")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        user_id = user.id

    token = security.create_access_token(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit evaluation
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/assessments/",
            headers=headers,
            json={"phq9Score": 10, "gad7Score": 5, "text_input": "I have been feeling very sad and anxious lately."},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["phq9Score"] == 10
    assert "nivelRiesgo" in data
    assert data["id_usuario"] == user_id


@pytest.mark.asyncio
async def test_get_evaluations():
    async with TestingSessionLocal() as db:
        result = await db.execute(select(Usuario).where(Usuario.email == "eval@example.com"))
        user = result.scalars().first()
        if not user:
            user = Usuario(
                email="eval@example.com", password_hash=security.get_password_hash("pass"), nombre="Eval User"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        user_id = user.id

    token = security.create_access_token(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/assessments/me", headers=headers)

    assert response.status_code == 200
    assert len(response.json()) >= 1
