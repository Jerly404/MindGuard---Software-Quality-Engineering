from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.base import Usuario, AsignacionProfesional, TransaccionMock, Evaluacion, Cita
from sqlalchemy.future import select

router = APIRouter()

class AppointmentCreate(BaseModel):
    id_paciente: int
    fecha_cita: datetime
    link_reunion: Optional[str] = "https://meet.google.com/new"
    mensaje_seguimiento: Optional[str] = None

# ... (dentro de los endpoints existentes)

@router.post("/appointments")
async def create_appointment(
    request: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Solo profesionales pueden agendar citas")
    
    # Validar que el paciente esté asignado
    stmt = select(AsignacionProfesional).where(
        AsignacionProfesional.id_paciente == request.id_paciente,
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(status_code=403, detail="El paciente no está asignado a tu supervisión")

    nueva_cita = Cita(
        id_paciente=request.id_paciente,
        id_profesional=current_user.id,
        fecha_cita=request.fecha_cita,
        link_reunion=request.link_reunion,
        mensaje_seguimiento=request.mensaje_seguimiento
    )
    db.add(nueva_cita)
    await db.commit()
    await db.refresh(nueva_cita)
    return {"mensaje": "Cita programada con éxito", "id": nueva_cita.id}

@router.get("/appointments/me")
async def get_my_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol == "profesional":
        stmt = select(Cita, Usuario.nombre.label("paciente_nombre")).join(
            Usuario, Cita.id_paciente == Usuario.id
        ).where(Cita.id_profesional == current_user.id).order_by(Cita.fecha_cita.asc())
    else:
        stmt = select(Cita, Usuario.nombre.label("profesional_nombre")).join(
            Usuario, Cita.id_profesional == Usuario.id
        ).where(Cita.id_paciente == current_user.id).order_by(Cita.fecha_cita.asc())
        
    result = await db.execute(stmt)
    rows = result.all()
    
    citas = []
    for row in rows:
        cita, nombre_otro = row
        citas.append({
            "id": cita.id,
            "fecha": cita.fecha_cita,
            "link": cita.link_reunion,
            "mensaje": cita.mensaje_seguimiento,
            "estado": cita.estado,
            "con": nombre_otro
        })
    return citas

class ProfessionalSchema(BaseModel):
    id: int
    nombre: str
    email: str
    class Config: from_attributes = True

class PaymentRequest(BaseModel):
    id_profesional: int
    monto: float
    metodo: str

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
        # 1. Definir expiración
        es_prueba = request.metodo == "prueba"
        # Usar timezone-aware si es posible, o simplemente datetime.utcnow() consistente
        expiracion = datetime.utcnow() + (timedelta(days=2) if es_prueba else timedelta(days=365))

        # 2. Crear transacción (Mock)
        transaccion = TransaccionMock(
            id_usuario=current_user.id,
            id_profesional=request.id_profesional,
            monto=request.monto,
            metodo_pago=request.metodo,
            estado="completado"
        )
        db.add(transaccion)
        
        # 3. Gestionar Asignación (Desactivar anteriores)
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
        
        # Un solo commit para todo
        await db.commit()
        await db.refresh(nueva_asig)
        await db.refresh(transaccion)

        return PaymentResponse(
            mensaje="¡Prueba Gratis Activada!" if es_prueba else "Suscripción Premium Activada",
            transaccion_id=transaccion.id,
            asignacion_id=nueva_asig.id,
            expira_en=expiracion
        )
    except Exception as e:
        await db.rollback()
        print(f"ERROR EN PREMIUM PAYMENT: {str(e)}") # Esto saldrá en la terminal
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

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
    if not asig:
        return None
    
    # Calcular expiración (asumiendo 2 días para el ejemplo visual)
    fecha_limite = asig.fecha_inicio + timedelta(days=2)
    
    res_pro = await db.execute(select(Usuario).filter(Usuario.id == asig.id_profesional))
    pro = res_pro.scalars().first()
    
    return {
        "profesional": pro.nombre if pro else "Especialista",
        "fecha_inicio": asig.fecha_inicio,
        "fecha_expiracion": fecha_limite,
        "dias_restantes": (fecha_limite - datetime.utcnow()).total_seconds() / 86400
    }

# --- NUEVOS ENDPOINTS PARA PROFESIONALES ---

@router.get("/assigned-patients")
async def get_assigned_patients(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")
    
    # Buscar pacientes activos asignados a este profesional
    stmt = select(Usuario).join(AsignacionProfesional, Usuario.id == AsignacionProfesional.id_paciente).where(
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    )
    result = await db.execute(stmt)
    patients = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "email": p.email,
            "riesgo": "Moderado" # Esto podría calcularse dinámicamente
        } for p in patients
    ]

@router.get("/earnings")
async def get_earnings(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")
    
    # Sumar montos de transacciones dirigidas a este profesional
    stmt = select(func.sum(TransaccionMock.monto)).where(
        TransaccionMock.id_profesional == current_user.id,
        TransaccionMock.estado == "completado"
    )
    result = await db.execute(stmt)
    total = result.scalar() or 0
    
    return {
        "total_ganado": total,
        "moneda": "USD",
        "periodo": "Mensual"
    }

@router.get("/patient-history/{patient_id}")
async def get_patient_history(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.rol != "profesional":
        raise HTTPException(status_code=403, detail="Acceso solo para profesionales")
    
    # Verificar que el paciente esté asignado a este profesional
    asig_check = await db.execute(select(AsignacionProfesional).where(
        AsignacionProfesional.id_paciente == patient_id,
        AsignacionProfesional.id_profesional == current_user.id,
        AsignacionProfesional.activa == True
    ))
    if not asig_check.scalars().first():
        raise HTTPException(status_code=403, detail="Este paciente no está bajo tu supervisión")

    # Obtener evaluaciones
    stmt = select(Evaluacion).where(Evaluacion.id_usuario == patient_id).order_by(Evaluacion.fecha.desc())
    result = await db.execute(stmt)
    evaluations = result.scalars().all()
    
    return [
        {
            "id": ev.id,
            "fecha": ev.fecha,
            "phq9Score": ev.phq9Score,
            "gad7Score": ev.gad7Score,
            "nivelRiesgo": ev.nivelRiesgo,
            "resultadoIA": ev.resultadoIA
        } for ev in evaluations
    ]
