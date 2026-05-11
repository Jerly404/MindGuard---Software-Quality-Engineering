from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.base import Usuario, AsignacionProfesional, TransaccionMock, Evaluacion
from sqlalchemy.future import select
from app.schemas.evaluation import Evaluation

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
    metodo: str # "paypal", "yape", "tarjeta"

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
    ultimo_phq9: int | None = None
    ultimo_gad7: int | None = None
    ultima_fecha_eval: datetime | None = None

    class Config:
        from_attributes = True

class EarningsResponse(BaseModel):
    total_acumulado: float
    moneda: str = "PEN"

@router.get("/professionals", response_model=List[ProfessionalSchema])
async def list_professionals(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos los profesionales disponibles para asignación."""
    result = await db.execute(select(Usuario).filter(Usuario.rol == "profesional"))
    professionals = result.scalars().all()
    return [ProfessionalSchema.model_validate(p, from_attributes=True) for p in professionals]

@router.post("/payment/mock", response_model=PaymentResponse)
async def simulate_payment_and_assign(
    request: PaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Simula un pago y registra el id_profesional para sus ingresos."""
    result = await db.execute(select(Usuario).filter(Usuario.id == request.id_profesional, Usuario.rol == "profesional"))
    profesional = result.scalars().first()
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    # 1. Crear transacción vinculada al profesional
    transaccion = TransaccionMock(
        id_usuario=current_user.id,
        id_profesional=profesional.id,
        monto=request.monto,
        metodo_pago=request.metodo,
        estado="completado"
    )
    db.add(transaccion)
    await db.commit()
    await db.refresh(transaccion)

    # 2. Crear Asignación
    result_asig = await db.execute(select(AsignacionProfesional).filter(
        AsignacionProfesional.id_paciente == current_user.id,
        AsignacionProfesional.activa == True
    ))
    asignacion_existente = result_asig.scalars().first()

    if asignacion_existente:
        asignacion_existente.activa = False
        await db.commit()

    nueva_asignacion = AsignacionProfesional(
        id_paciente=current_user.id,
        id_profesional=profesional.id,
        activa=True
    )
    db.add(nueva_asignacion)
    await db.commit()
    await db.refresh(nueva_asignacion)

    return PaymentResponse(
        mensaje="Pago exitoso y profesional asignado correctamente.",
        transaccion_id=transaccion.id,
        asignacion_id=nueva_asignacion.id
    )

@router.get("/earnings", response_model=EarningsResponse)
async def get_earnings(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene los ingresos totales del profesional."""
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Solo profesionales pueden ver sus ingresos")
    
    result = await db.execute(
        select(func.sum(TransaccionMock.monto))
        .where(TransaccionMock.id_profesional == current_user.id)
        .where(TransaccionMock.estado == "completado")
    )
    total = result.scalar() or 0.0
    return EarningsResponse(total_acumulado=total)

@router.get("/assigned-patients", response_model=List[PatientSummary])
async def get_assigned_patients(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    result = await db.execute(select(AsignacionProfesional).filter(
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    ))
    asignaciones = result.scalars().all()

    pacientes_resumen = []
    for asig in asignaciones:
        res_p = await db.execute(select(Usuario).filter(Usuario.id == asig.id_paciente))
        paciente = res_p.scalars().first()
        if not paciente: continue

        res_eval = await db.execute(select(Evaluacion).filter(
            Evaluacion.id_usuario == paciente.id
        ).order_by(Evaluacion.fecha.desc()))
        ultima_eval = res_eval.scalars().first()

        pacientes_resumen.append(PatientSummary(
            id=paciente.id,
            nombre=paciente.nombre,
            email=paciente.email,
            fecha_asignacion=asig.fecha_inicio,
            ultima_evaluacion_riesgo=ultima_eval.nivelRiesgo if ultima_eval else "Sin evaluaciones",
            ultimo_phq9=ultima_eval.phq9Score if ultima_eval else None,
            ultimo_gad7=ultima_eval.gad7Score if ultima_eval else None,
            ultima_fecha_eval=ultima_eval.fecha if ultima_eval else None
        ))
    return pacientes_resumen

@router.get("/patient-history/{patient_id}", response_model=List[Evaluation])
async def get_patient_history(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtiene el historial completo de un paciente específico si está asignado."""
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Permiso denegado")

    # Verificar asignación
    res_asig = await db.execute(select(AsignacionProfesional).filter(
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.id_paciente == patient_id,
        AsignacionProfesional.activa == True
    ))
    if not res_asig.scalars().first():
        raise HTTPException(status_code=403, detail="El paciente no está asignado a tu supervisión")

    res_evals = await db.execute(
        select(Evaluacion)
        .where(Evaluacion.id_usuario == patient_id)
        .order_by(Evaluacion.fecha.desc())
    )
    evaluations_db = res_evals.scalars().all()
    
    return [
        Evaluation(
            id=e.id,
            fecha=e.fecha,
            phq9Score=e.phq9Score,
            gad7Score=e.gad7Score,
            nivelRiesgo=e.nivelRiesgo,
            resultadoIA=e.resultadoIA,
            has_high_risk=bool(e.has_high_risk),
            id_usuario=e.id_usuario,
            text_input=e.notas_personales
        ) for e in evaluations_db
    ]
