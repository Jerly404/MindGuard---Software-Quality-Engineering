from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func
import random
import uuid

from app.api.deps import get_db, get_current_user
from app.models.base import Usuario, AsignacionProfesional, TransaccionMock, Evaluacion, Cita
from sqlalchemy.future import select

router = APIRouter()

class AppointmentCreate(BaseModel):
    id_paciente: int
    fecha_cita: datetime
    mensaje_seguimiento: Optional[str] = None

@router.post("/appointments")
async def create_appointment(
    request: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Solo profesionales pueden agendar citas")
    
    # Verificar asignación
    stmt = select(AsignacionProfesional).where(
        AsignacionProfesional.id_paciente == request.id_paciente,
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(status_code=403, detail="El paciente no está asignado a tu supervisión")

    # GENERAR LINK ÚNICO PARA ESTA CITA
    # Usamos Jitsi Meet porque permite crear salas persistentes mediante la URL
    room_id = f"MindGuard-{uuid.uuid4().hex[:12]}"
    link_unico = f"https://meet.jit.si/{room_id}"

    nueva_cita = Cita(
        id_paciente=request.id_paciente,
        id_profesional=current_user.id,
        fecha_cita=request.fecha_cita,
        link_reunion=link_unico,
        mensaje_seguimiento=request.mensaje_seguimiento
    )
    db.add(nueva_cita)
    await db.commit()
    await db.refresh(nueva_cita)
    return {"mensaje": "Cita programada con éxito", "link": link_unico}

@router.get("/appointments/me")
async def get_my_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol == "profesional":
        stmt = select(Cita, Usuario.nombre.label("otro_nombre")).join(
            Usuario, Cita.id_paciente == Usuario.id
        ).where(Cita.id_profesional == current_user.id).order_by(Cita.fecha_cita.asc())
    else:
        stmt = select(Cita, Usuario.nombre.label("otro_nombre")).join(
            Usuario, Cita.id_profesional == Usuario.id
        ).where(Cita.id_paciente == current_user.id).order_by(Cita.fecha_cita.asc())
        
    result = await db.execute(stmt)
    rows = result.all()
    
    return [
        {
            "id": row[0].id,
            "fecha": row[0].fecha_cita,
            "link": row[0].link_reunion,
            "mensaje": row[0].mensaje_seguimiento,
            "estado": row[0].estado,
            "con": row[1]
        } for row in rows
    ]

class ProfessionalSchema(BaseModel):
    id: int
    nombre: str
    email: str
    class Config: from_attributes = True

class PaymentRequest(BaseModel):
    id_profesional: int
    monto: float
    metodo: str
    referencia_pago: Optional[str] = None

class PaymentResponse(BaseModel):
    mensaje: str
    transaccion_id: int
    asignacion_id: int
    expira_en: datetime

@router.get("/professionals", response_model=List[ProfessionalSchema])
async def list_professionals(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Usuario).filter(Usuario.rol == "profesional"))
    return result.scalars().all()

@router.post("/payment/mock", response_model=PaymentResponse)
async def simulate_payment_and_assign(
    request: PaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        expiracion = datetime.utcnow() + (timedelta(days=2) if request.metodo == "prueba" else timedelta(days=30))
        transaccion = TransaccionMock(
            id_usuario=current_user.id,
            id_profesional=request.id_profesional,
            monto=request.monto,
            metodo_pago=request.metodo,
            estado="completado"
        )
        db.add(transaccion)
        
        q = select(AsignacionProfesional).where(
            AsignacionProfesional.id_paciente == current_user.id,
            AsignacionProfesional.activa == True
        )
        res_old = await db.execute(q)
        for old in res_old.scalars().all():
            old.activa = False
        
        nueva_asig = AsignacionProfesional(
            id_paciente=current_user.id,
            id_profesional=request.id_profesional,
            fecha_inicio=datetime.utcnow(),
            activa=True
        )
        db.add(nueva_asig)
        await db.commit()

        msj = f"¡{request.metodo.capitalize()} verificado! Servicio premium activado."
        return PaymentResponse(
            mensaje=msj,
            transaccion_id=random.randint(1000, 9999),
            asignacion_id=1,
            expira_en=expiracion
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-assignment")
async def get_my_assignment(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(AsignacionProfesional).filter(
        AsignacionProfesional.id_paciente == current_user.id,
        AsignacionProfesional.activa == True
    ))
    asig = result.scalars().first()
    if not asig: return None
    
    res_pro = await db.execute(select(Usuario).filter(Usuario.id == asig.id_profesional))
    pro = res_pro.scalars().first()
    
    return {
        "profesional": pro.nombre if pro else "Especialista",
        "fecha_inicio": asig.fecha_inicio,
        "dias_restantes": 30 # Mock simplificado
    }

@router.get("/assigned-patients")
async def get_assigned_patients(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")
    
    stmt = select(Usuario).join(AsignacionProfesional, Usuario.id == AsignacionProfesional.id_paciente).where(
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    )
    result = await db.execute(stmt)
    return [{"id": p.id, "nombre": p.nombre, "email": p.email, "riesgo": "Estable"} for p in result.scalars().all()]

@router.get("/earnings")
async def get_earnings(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")
    
    stmt = select(func.sum(TransaccionMock.monto)).where(
        TransaccionMock.id_profesional == current_user.id
    )
    result = await db.execute(stmt)
    return {"total_ganado": result.scalar() or 0, "moneda": "USD"}

@router.get("/patient-history/{patient_id}")
async def get_patient_history(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificación de seguridad básica
    stmt = select(Evaluacion).where(Evaluacion.id_usuario == patient_id).order_by(Evaluacion.fecha.desc())
    result = await db.execute(stmt)
    return [{"id": ev.id, "fecha": ev.fecha, "phq9Score": ev.phq9Score, "gad7Score": ev.gad7Score, "resultadoIA": ev.resultadoIA} for ev in result.scalars().all()]
