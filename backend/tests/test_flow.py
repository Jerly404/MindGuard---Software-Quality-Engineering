import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import get_db
from app.main import app
from app.models.base import Base

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test_flow.db"
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
async def test_full_user_flow():
    """
    Test completo: Registro -> Login -> Crear Evaluación
    """
    print("\n\n" + "=" * 50)
    print("INICIANDO SIMULACION DE USUARIO REAL")
    print("=" * 50)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. REGISTRO
        signup_data = {"email": "flow@example.com", "password": "strongpassword123", "nombre": "User Flow"}
        print("\n[PASO 1] REGISTRANDO NUEVO USUARIO")
        print(f"   -> Enviando Payload: {signup_data}")
        signup_response = await ac.post("/api/v1/auth/signup", json=signup_data)
        assert signup_response.status_code == 200, f"Error en registro: {signup_response.text}"
        print(f"   <- Respuesta Servidor (200 OK): Usuario {signup_response.json()['email']} creado exitosamente.")

        # 2. LOGIN
        login_data = {"username": "flow@example.com", "password": "strongpassword123"}
        print("\n[PASO 2] INICIANDO SESION")
        print(f"   -> Enviando Credenciales: {login_data['username']} / ********")
        login_response = await ac.post("/api/v1/auth/login/access-token", data=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        print(f"   <- Respuesta Servidor (200 OK): JWT Token recibido [{token[:15]}...]")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. REALIZAR ACCION (Crear Evaluacion)
        eval_data = {
            "phq9Score": 5,
            "gad7Score": 3,
            "phq9Answers": [1, 1, 1, 1, 1, 0, 0, 0, 0],
            "gad7Answers": [1, 1, 1, 0, 0, 0, 0],
            "text_input": "Me siento un poco cansado hoy.",
        }
        print("\n[PASO 3] ENVIANDO EVALUACION CLINICA (PHQ-9 / GAD-7)")
        print(
            f"   -> Payload: Puntaje PHQ9: {eval_data['phq9Score']}, GAD7: {eval_data['gad7Score']}, Notas: '{eval_data['text_input']}'"
        )
        eval_response = await ac.post("/api/v1/assessments/", json=eval_data, headers=headers)
        assert eval_response.status_code == 200
        print(
            f"   <- Respuesta Servidor (200 OK): Evaluacion procesada. Riesgo calculado: {eval_response.json()['nivelRiesgo']}"
        )

        # 4. VERIFICAR HISTORIAL
        print("\n[PASO 4] CONSULTANDO HISTORIAL DEL PACIENTE")
        print("   -> GET /api/v1/assessments/me con Token de Autorizacion")
        history_response = await ac.get("/api/v1/assessments/me", headers=headers)
        assert history_response.status_code == 200
        assert len(history_response.json()) >= 1
        assert history_response.json()[0]["phq9Score"] == 5
        print(
            f"   <- Respuesta Servidor (200 OK): Se encontro {len(history_response.json())} registro(s) en el historial."
        )
        print("=" * 50 + "\n")
