from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.api.deps import get_db, get_current_user, get_current_active_user
from app.models.base import Usuario, AsignacionProfesional, TransaccionMock, Evaluacion

router = APIRouter()

class ProfessionalSchema(BaseModel):
    id: int
    nombre: str
    email: str

    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    id_profesional: int
    monto: float
    metodo: str = "tarjeta_simulada"

class PaymentResponse(BaseModel):
    mensaje: str
    transaccion_id: int
    asignacion_id: int

class PatientSummary(BaseModel):
    id: int
    nombre: str
    email: str
    fecha_asignacion: datetime
    ultima_evaluacion_riesgo: str | None = None

    class Config:
        from_attributes = True

@router.get("/professionals", response_model=List[ProfessionalSchema])
def list_professionals(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Lista todos los profesionales disponibles para asignación."""
    professionals = db.query(Usuario).filter(Usuario.rol == "profesional").all()
    return professionals

@router.post("/payment/mock", response_model=PaymentResponse)
def simulate_payment_and_assign(
    request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Simula un pago y si es exitoso, crea la asignación con el profesional."""
    # Verificar si el profesional existe
    profesional = db.query(Usuario).filter(Usuario.id == request.id_profesional, Usuario.rol == "profesional").first()
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    # 1. Crear transacción mock
    transaccion = TransaccionMock(
        id_usuario=current_user.id,
        monto=request.monto,
        estado="completado"
    )
    db.add(transaccion)
    db.commit()
    db.refresh(transaccion)

    # 2. Crear Asignación
    # Verificar si ya existe una activa
    asignacion_existente = db.query(AsignacionProfesional).filter(
        AsignacionProfesional.id_paciente == current_user.id,
        AsignacionProfesional.activa == True
    ).first()

    if asignacion_existente:
        # Inactivar la anterior
        asignacion_existente.activa = False
        db.commit()

    nueva_asignacion = AsignacionProfesional(
        id_paciente=current_user.id,
        id_profesional=profesional.id,
        activa=True
    )
    db.add(nueva_asignacion)
    db.commit()
    db.refresh(nueva_asignacion)

    return PaymentResponse(
        mensaje="Pago exitoso y profesional asignado correctamente.",
        transaccion_id=transaccion.id,
        asignacion_id=nueva_asignacion.id
    )

@router.get("/assigned-patients", response_model=List[PatientSummary])
def get_assigned_patients(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtiene la lista de pacientes asignados al profesional actual."""
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="No tienes permisos para ver esto")

    asignaciones = db.query(AsignacionProfesional).filter(
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    ).all()

    pacientes_resumen = []
    for asig in asignaciones:
        paciente = asig.paciente
        # Buscar la última evaluación
        ultima_evaluacion = db.query(Evaluacion).filter(
            Evaluacion.id_usuario == paciente.id
        ).order_by(Evaluacion.fecha.desc()).first()

        nivel_riesgo = ultima_evaluacion.nivelRiesgo if ultima_evaluacion else "Sin evaluaciones"

        pacientes_resumen.append(PatientSummary(
            id=paciente.id,
            nombre=paciente.nombre,
            email=paciente.email,
            fecha_asignacion=asig.fecha_inicio,
            ultima_evaluacion_riesgo=nivel_riesgo
        ))

    return pacientes_resumen
