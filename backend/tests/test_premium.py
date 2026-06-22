from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import get_db
from app.core import security
from app.main import app
from app.models.base import AsignacionProfesional, Base, Cita, Usuario

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test_flow_premium.db"
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
async def test_premium_appointment_flow():
    # 1. Create Patient, Professional, and Assignment
    async with TestingSessionLocal() as db:
        patient = Usuario(
            email="patient@example.com",
            password_hash=security.get_password_hash("pass"),
            nombre="Paciente Test",
            rol="usuario",
        )
        professional = Usuario(
            email="pro@example.com",
            password_hash=security.get_password_hash("pass"),
            nombre="Psicologo Test",
            rol="profesional",
        )
        db.add_all([patient, professional])
        await db.commit()
        await db.refresh(patient)
        await db.refresh(professional)

        # Create active professional assignment
        assignment = AsignacionProfesional(id_paciente=patient.id, id_profesional=professional.id, activa=True)
        db.add(assignment)
        await db.commit()

        patient_id = patient.id
        professional_id = professional.id

    # Create auth tokens
    pro_token = security.create_access_token(professional_id)
    pat_token = security.create_access_token(patient_id)
    pro_headers = {"Authorization": f"Bearer {pro_token}"}
    pat_headers = {"Authorization": f"Bearer {pat_token}"}

    # 2. Mock email service
    from app.services.email import email_service

    mock_send = AsyncMock(return_value=True)
    with patch.object(email_service, "send_appointment_email", mock_send):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Case 1: Try to create appointment as user (should fail with 403)
            fail_resp = await ac.post(
                "/api/v1/premium/appointments",
                headers=pat_headers,
                json={"id_paciente": patient_id, "fecha_cita": "2026-06-23T10:00:00"},
            )
            assert fail_resp.status_code == 403

            # Case 2: Create appointment as professional (should succeed)
            success_resp = await ac.post(
                "/api/v1/premium/appointments",
                headers=pro_headers,
                json={"id_paciente": patient_id, "fecha_cita": "2026-06-23T10:00:00"},
            )
            assert success_resp.status_code == 200
            data = success_resp.json()
            assert data["mensaje"] == "Cita programada con éxito"
            meeting_link = data["link"]
            assert meeting_link.startswith("https://meet.jit.si/MindGuard-")

            # Check mock email was called with correct link and metadata
            mock_send.assert_called_once()
            call_kwargs = mock_send.call_args.kwargs
            assert call_kwargs["email_to"] == "patient@example.com"
            assert call_kwargs["patient_name"] == "Paciente Test"
            assert call_kwargs["professional_name"] == "Psicologo Test"
            assert call_kwargs["meeting_link"] == meeting_link

            # 3. Retrieve the created appointment from DB to verify it exists and is correct
            async with TestingSessionLocal() as db:
                stmt = select(Cita).where(Cita.id_paciente == patient_id)
                result = await db.execute(stmt)
                appointment = result.scalars().first()
                assert appointment is not None
                assert appointment.link_reunion == meeting_link
                assert appointment.id_profesional == professional_id
                appointment_id = appointment.id

            # 4. Verify patient can see the appointment in /appointments/me
            patient_appointments_resp = await ac.get("/api/v1/premium/appointments/me", headers=pat_headers)
            assert patient_appointments_resp.status_code == 200
            patient_appointments = patient_appointments_resp.json()
            assert len(patient_appointments) >= 1
            # Find the appointment we just created
            our_app = next((a for a in patient_appointments if a["id"] == appointment_id), None)
            assert our_app is not None
            assert our_app["link"] == meeting_link
            assert our_app["estado"] == "programada"

            # 5. Verify professional can see the appointment in /appointments/me
            pro_appointments_resp = await ac.get("/api/v1/premium/appointments/me", headers=pro_headers)
            assert pro_appointments_resp.status_code == 200
            pro_appointments = pro_appointments_resp.json()
            assert len(pro_appointments) >= 1
            our_app_pro = next((a for a in pro_appointments if a["id"] == appointment_id), None)
            assert our_app_pro is not None
            assert our_app_pro["link"] == meeting_link

            # 6. Resend email as professional
            mock_send.reset_mock()
            resend_resp = await ac.post(
                f"/api/v1/premium/appointments/{appointment_id}/resend-email", headers=pro_headers
            )
            assert resend_resp.status_code == 200
            assert resend_resp.json()["mensaje"] == "Correo reenviado con éxito"

            # Check that email service was invoked again with the same correct details
            mock_send.assert_called_once()
            call_kwargs = mock_send.call_args.kwargs
            assert call_kwargs["email_to"] == "patient@example.com"
            assert call_kwargs["meeting_link"] == meeting_link

            # 7. Try to resend email for this appointment using another professional's token (should fail with 403)
            # Create another professional
            async with TestingSessionLocal() as db:
                other_pro = Usuario(
                    email="otherpro@example.com",
                    password_hash=security.get_password_hash("pass"),
                    nombre="Otro Psicologo",
                    rol="profesional",
                )
                db.add(other_pro)
                await db.commit()
                await db.refresh(other_pro)
                other_pro_id = other_pro.id

            other_pro_token = security.create_access_token(other_pro_id)
            other_pro_headers = {"Authorization": f"Bearer {other_pro_token}"}

            resend_fail_resp = await ac.post(
                f"/api/v1/premium/appointments/{appointment_id}/resend-email", headers=other_pro_headers
            )
            assert resend_fail_resp.status_code == 403
