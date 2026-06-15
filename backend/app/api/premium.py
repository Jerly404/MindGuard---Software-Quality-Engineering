from datetime import datetime, timedelta, timezone
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api import deps
from app.models.base import Usuario
from app.services.business_services import AppointmentService, AssignmentService, EvaluationService, UserService

router = APIRouter()


class AppointmentCreate(BaseModel):
    id_paciente: int
    fecha_cita: datetime
    mensaje_seguimiento: str | None = None


class ProfessionalSchema(BaseModel):
    id: int
    nombre: str
    email: str

    model_config = {"from_attributes": True}


class PaymentRequest(BaseModel):
    id_profesional: int
    monto: float
    metodo: str
    referencia_pago: str | None = None


class PaymentResponse(BaseModel):
    mensaje: str
    transaccion_id: int
    asignacion_id: int
    expira_en: datetime


@router.post("/appointments")
async def create_appointment(
    request: AppointmentCreate,
    appointment_service: Annotated[AppointmentService, Depends(deps.get_appointment_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Solo profesionales pueden agendar citas")

    # Delegar la creación del agendamiento y videoconferencia al servicio de negocio
    res = await appointment_service.create_appointment(
        professional_id=current_user.id,
        patient_id=request.id_paciente,
        fecha_cita=request.fecha_cita,
        mensaje_seguimiento=request.mensaje_seguimiento,
    )
    return {"mensaje": "Cita programada con éxito", "link": res.link_reunion}


@router.get("/appointments/me")
async def get_my_appointments(
    appointment_service: Annotated[AppointmentService, Depends(deps.get_appointment_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    return await appointment_service.list_by_user(current_user.id, current_user.rol)


@router.get("/professionals", response_model=List[ProfessionalSchema])
async def list_professionals(
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    return await assignment_service.list_professionals()


@router.post("/payment/mock", response_model=PaymentResponse)
async def simulate_payment_and_assign(
    request: PaymentRequest,
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    try:
        # Delegamos en el servicio de negocio y retornamos la respuesta con los IDs reales creados
        res = await assignment_service.simulate_payment_and_assign(
            patient_id=current_user.id,
            professional_id=request.id_profesional,
            monto=request.monto,
            metodo=request.metodo,
        )
        return PaymentResponse(
            mensaje=res["mensaje"],
            transaccion_id=res["transaccion_id"],
            asignacion_id=res["asignacion_id"],
            expira_en=res["expira_en"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/my-assignment")
async def get_my_assignment(
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    asig = await assignment_service.get_active_by_patient(current_user.id)
    if not asig:
        return None

    pro = await user_service.get_by_id(asig.id_profesional)

    # Cálculo dinámico de días restantes en base a la fecha de inicio
    limite = asig.fecha_inicio + timedelta(days=30)
    dias_restantes = (limite - datetime.now(timezone.utc)).days
    dias_restantes = max(0, dias_restantes)

    return {
        "profesional": pro.nombre if pro else "Especialista",
        "fecha_inicio": asig.fecha_inicio,
        "dias_restantes": dias_restantes,
    }


@router.get("/assigned-patients")
async def get_assigned_patients(
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    eval_service: Annotated[EvaluationService, Depends(deps.get_evaluation_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")

    patients = await assignment_service.list_assigned_patients(current_user.id)

    # Corrección del riesgo clínico hardcodeado. Calculamos el nivel de riesgo real de cada paciente.
    enriched_patients = []
    for p in patients:
        history = await eval_service.list_by_user(p["id"], asc=False)
        riesgo = "Estable"
        if history:
            riesgo = history[0].nivelRiesgo or "Estable"

        enriched_patients.append({"id": p["id"], "nombre": p["nombre"], "email": p["email"], "riesgo": riesgo})
    return enriched_patients


@router.get("/earnings")
async def get_earnings(
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")

    return await assignment_service.get_earnings(current_user.id)


@router.get("/patient-history/{patient_id}")
async def get_patient_history(
    patient_id: int,
    assignment_service: Annotated[AssignmentService, Depends(deps.get_assignment_service)],
    eval_service: Annotated[EvaluationService, Depends(deps.get_evaluation_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
):
    # Verificación de seguridad estricta para mitigar la vulnerabilidad IDOR/BOLA
    tiene_acceso = False

    if current_user.id == patient_id:
        tiene_acceso = True
    elif current_user.rol in ["admin", "administrador"]:
        tiene_acceso = True
    elif current_user.rol == "profesional":
        patients = await assignment_service.list_assigned_patients(current_user.id)
        if any(p["id"] == patient_id for p in patients):
            tiene_acceso = True

    if not tiene_acceso:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: No tienes autorización para consultar el historial clínico de este paciente.",
        )

    evaluations = await eval_service.list_by_user(patient_id, asc=False)
    return [
        {
            "id": ev.id,
            "fecha": ev.fecha,
            "phq9Score": ev.phq9Score,
            "gad7Score": ev.gad7Score,
            "resultadoIA": ev.resultadoIA,
        }
        for ev in evaluations
    ]
