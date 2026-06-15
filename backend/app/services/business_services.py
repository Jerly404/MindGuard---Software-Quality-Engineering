import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.models.base import AsignacionProfesional, Cita, Evaluacion, TransaccionMock, Usuario
from app.repositories.appointment import AppointmentRepository
from app.repositories.assignment import AssignmentRepository
from app.repositories.evaluation import EvaluationRepository
from app.repositories.transaction import TransactionRepository
from app.repositories.user import UserRepository
from app.schemas.evaluation import DetailedAIAnalysis, Evaluation
from app.schemas.user import UserCreate
from app.services.clinical_ai import ClinicalAIService

logger = logging.getLogger("mindguard")

# Mapeo constante de severidad de riesgo a puntaje clínico equivalente
LEVEL_SCORE_MAPPING = {
    "alto": 18,
    "grave": 18,
    "medio": 10,
    "moderado": 10,
    "leve": 5,
    "bajo": 5
}


def level_to_score(level: str) -> int:
    """Convierte una etiqueta cualitativa de riesgo en su puntaje numérico equivalente."""
    level_lower = str(level).lower()
    for keyword, score in LEVEL_SCORE_MAPPING.items():
        if keyword in level_lower:
            return score
    return 0


def get_risk_value(label: str) -> float:
    """Retorna un valor de intensidad de riesgo (0.0 a 1.0) según la etiqueta del nivel."""
    label_lower = str(label).lower()
    if "alto" in label_lower or "grave" in label_lower:
        return 0.8
    if "medio" in label_lower or "moderado" in label_lower:
        return 0.5
    return 0.2


def generate_meeting_link() -> str:
    """Genera un enlace único para una sesión de videoconferencia en Jitsi."""
    room_id = f"MindGuard-{uuid.uuid4().hex[:12]}"
    return f"https://meet.jit.si/{room_id}"



class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def get_by_id(self, user_id: int) -> Optional[Usuario]:
        return await self.repo.get_by_id(user_id)

    async def get_by_email(self, email: str) -> Optional[Usuario]:
        return await self.repo.get_by_email(email)

    async def signup_user(self, nombre: str, email: str, password: str) -> Usuario:
        existing = await self.repo.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this username already exists in the system.",
            )
        new_user = Usuario(
            nombre=nombre,
            email=email,
            password_hash=security.get_password_hash(password),
            rol="usuario",  # Forced role for security
            twoFactorEnabled=False,
        )
        return await self.repo.create(new_user)

    async def create_professional(self, user_in: UserCreate) -> Usuario:
        existing = await self.repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe un usuario con este correo electrónico."
            )
        new_pro = Usuario(
            nombre=user_in.nombre,
            email=user_in.email,
            password_hash=security.get_password_hash(user_in.password),
            rol="profesional",
            colegiatura=user_in.colegiatura,
            especialidad=user_in.especialidad,
            twoFactorEnabled=False,
        )
        return await self.repo.create(new_pro)

    async def list_all(self) -> List[Usuario]:
        return await self.repo.list_all()

    async def delete_user(self, user_id: int) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        await self.repo.delete(user)


class EvaluationService:
    def __init__(self, db: AsyncSession):
        self.repo = EvaluationRepository(db)
        self.ai = ClinicalAIService()

    async def list_by_user(self, user_id: int, asc: bool = True) -> List[Evaluacion]:
        if asc:
            return await self.repo.list_by_user_asc(user_id)
        return await self.repo.list_by_user_desc(user_id)

    async def create_evaluation(self, user_id: int, phq9Score: int, gad7Score: int, text_input: str) -> Evaluacion:
        # Validación de límites de puntuación clínica
        if not (0 <= phq9Score <= 27):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El puntaje PHQ-9 debe estar entre 0 y 27.",
            )
        if not (0 <= gad7Score <= 21):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El puntaje GAD-7 debe estar entre 0 y 21.",
            )

        ai_result = await self.ai.analyze_text(text_input)

        resultado_ia_text = ai_result.get("interpretacion", "No se pudo realizar el análisis.")
        has_high_risk = ai_result.get("has_alert", False)

        es_alto = has_high_risk or phq9Score >= 15 or gad7Score >= 15
        riesgo_calculado = "Alto" if es_alto else ("Moderado" if (phq9Score >= 10 or gad7Score >= 10) else "Leve")

        new_eval = Evaluacion(
            fecha=datetime.now(timezone.utc),
            phq9Score=phq9Score,
            gad7Score=gad7Score,
            nivelRiesgo=riesgo_calculado,
            resultadoIA=resultado_ia_text,
            has_high_risk=has_high_risk,
            notas_personales=text_input,
            id_usuario=user_id,
        )
        return await self.repo.create(new_eval)

    async def create_chat_evaluation(self, user_id: int, messages: List[Dict[str, str]]) -> Evaluation:
        report = await self.ai.generate_daily_report(messages)

        ansiedad_label = report.get("nivel_ansiedad", "Bajo") or "Bajo"
        depresion_label = report.get("nivel_depresion", "Bajo") or "Bajo"

        score_dep = level_to_score(depresion_label)
        score_ans = level_to_score(ansiedad_label)

        es_alto = (
            "alto" in ansiedad_label.lower()
            or "grave" in ansiedad_label.lower()
            or "alto" in depresion_label.lower()
            or "grave" in depresion_label.lower()
        )
        riesgo_calculado = "Alto" if es_alto else ("Moderado" if (score_dep > 9 or score_ans > 9) else "Leve")

        # Guardar en base de datos
        new_eval = Evaluacion(
            fecha=datetime.now(timezone.utc),
            phq9Score=score_dep,
            gad7Score=score_ans,
            nivelRiesgo=riesgo_calculado,
            resultadoIA=report.get("resumen", "Evaluación completada"),
            has_high_risk=es_alto,
            notas_personales="Reporte generado por Chatbot",
            id_usuario=user_id,
        )
        created_eval = await self.repo.create(new_eval)

        # Mapeo de niveles cualitativos a valores flotantes para el frontend usando get_risk_value helper
        ansiedad_val = get_risk_value(ansiedad_label)
        depresion_val = get_risk_value(depresion_label)

        # Construir y retornar el esquema completo de evaluación
        detail = DetailedAIAnalysis(
            emociones_detectadas={
                "tristeza": depresion_val,
                "ansiedad": ansiedad_val,
                "estrés": 0.4 if es_alto else 0.1,
                "sobrepensamiento": 0.4 if es_alto else 0.1,
                "agotamiento_mental": 0.4 if es_alto else 0.2,
            },
            factores_detectados=report.get("puntos_clave", []),
            riesgo_emocional=riesgo_calculado,
            patrones=report.get("plan_accion", []),
            interpretacion=report.get("resumen", "Sesión completada"),
            recomendacion=report.get("recomendacion_profesional", "Consulte a un especialista."),
        )

        return Evaluation(
            id=created_eval.id,
            fecha=created_eval.fecha,
            phq9Score=created_eval.phq9Score,
            gad7Score=created_eval.gad7Score,
            phq9Answers=[],
            gad7Answers=[],
            text_input=created_eval.notas_personales,
            nivelRiesgo=created_eval.nivelRiesgo,
            resultadoIA=created_eval.resultadoIA,
            id_usuario=created_eval.id_usuario,
            has_high_risk=created_eval.has_high_risk,
            analisis_detallado=detail,
        )


class AssignmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AssignmentRepository(db)
        self.user_repo = UserRepository(db)
        self.trans_repo = TransactionRepository(db)

    async def get_active_by_patient(self, patient_id: int) -> Optional[AsignacionProfesional]:
        return await self.repo.get_active_by_patient(patient_id)

    async def list_professionals(self) -> List[Usuario]:
        return await self.user_repo.list_professionals()

    async def simulate_payment_and_assign(
        self, patient_id: int, professional_id: int, monto: float, metodo: str
    ) -> Dict[str, Any]:
        expiracion = datetime.now(timezone.utc) + (timedelta(days=1) if metodo == "prueba" else timedelta(days=30))

        # Registrar transacción
        transaccion = TransaccionMock(
            id_usuario=patient_id,
            id_profesional=professional_id,
            monto=monto,
            metodo_pago=metodo,
            estado="completado",
            fecha=datetime.now(timezone.utc),
        )
        created_trans = await self.trans_repo.create(transaccion)

        # Desactivar asignaciones previas
        await self.repo.deactivate_all_for_patient(patient_id)

        # Crear nueva asignación
        nueva_asig = AsignacionProfesional(
            id_paciente=patient_id, id_profesional=professional_id, fecha_inicio=datetime.now(timezone.utc), activa=True
        )
        created_asig = await self.repo.create(nueva_asig)

        msj = f"¡{metodo.capitalize()} verificado! Servicio premium activado."
        return {
            "mensaje": msj,
            "transaccion_id": created_trans.id,
            "asignacion_id": created_asig.id,
            "expira_en": expiracion,
        }

    async def list_assigned_patients(self, professional_id: int) -> List[Dict[str, Any]]:
        patients = await self.repo.list_assigned_patients(professional_id)
        return [{"id": p.id, "nombre": p.nombre, "email": p.email, "riesgo": "Estable"} for p in patients]

    async def get_earnings(self, professional_id: int) -> Dict[str, Any]:
        total = await self.trans_repo.get_earnings_by_professional(professional_id)
        return {"total_ganado": total, "moneda": "USD"}


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.repo = AppointmentRepository(db)
        self.asig_repo = AssignmentRepository(db)

    async def create_appointment(
        self, professional_id: int, patient_id: int, fecha_cita: datetime, mensaje_seguimiento: Optional[str] = None
    ) -> Cita:
        # Verificar asignación activa
        asignacion = await self.asig_repo.get_active_by_patient(patient_id)
        if not asignacion:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="El paciente no tiene una suscripción premium activa"
            )

        # Generar link único de videoconferencia
        link_unico = generate_meeting_link()

        new_appointment = Cita(
            id_paciente=patient_id,
            id_profesional=professional_id,
            fecha_cita=fecha_cita,
            link_reunion=link_unico,
            mensaje_seguimiento=mensaje_seguimiento,
            estado="programada",
            fecha_creacion=datetime.now(timezone.utc),
        )
        return await self.repo.create(new_appointment)

    async def list_by_user(self, user_id: int, rol: str) -> List[Dict[str, Any]]:
        if rol == "profesional":
            rows = await self.repo.list_by_professional(user_id)
        else:
            rows = await self.repo.list_by_patient(user_id)

        return [
            {
                "id": row[0].id,
                "fecha": row[0].fecha_cita,
                "link": row[0].link_reunion,
                "mensaje": row[0].mensaje_seguimiento,
                "estado": row[0].estado,
                "con": row[1],
            }
            for row in rows
        ]
