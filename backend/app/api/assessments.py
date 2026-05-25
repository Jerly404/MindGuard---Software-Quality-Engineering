from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.base import Evaluacion, Usuario
from app.schemas.evaluation import Evaluation, EvaluationCreate
from app.services.chatbot import chatbot_service
from app.services.clinical import ai_service
from app.services.report_service import ai_report_service

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatSession(BaseModel):
    messages: List[ChatMessage]
    step: str


def level_to_score(level: str) -> int:
    level = str(level).lower()
    if "alto" in level or "grave" in level:
        return 18
    if "medio" in level or "moderado" in level:
        return 10
    if "leve" in level or "bajo" in level:
        return 5
    return 0


@router.get("/me", response_model=List[Evaluation])
async def get_my_assessments(
    db: AsyncSession = Depends(deps.get_db), current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    result = await db.execute(
        select(Evaluacion).where(Evaluacion.id_usuario == current_user.id).order_by(Evaluacion.fecha.asc())
    )
    evaluations_db = result.scalars().all()

    safe_evaluations = []
    for ev in evaluations_db:
        # Si el score es 0 pero tiene nivel de riesgo, lo corregimos al vuelo para el frontend
        p_score = ev.phq9Score if (ev.phq9Score and ev.phq9Score > 0) else level_to_score(ev.nivelRiesgo)
        g_score = ev.gad7Score if (ev.gad7Score and ev.gad7Score > 0) else level_to_score(ev.nivelRiesgo)

        safe_evaluations.append(
            Evaluation(
                id=ev.id,
                fecha=ev.fecha or datetime.utcnow(),
                phq9Score=p_score,
                gad7Score=g_score,
                nivelRiesgo=ev.nivelRiesgo or "Moderado",
                resultadoIA=ev.resultadoIA or "Sin análisis disponible",
                id_usuario=ev.id_usuario,
                has_high_risk=bool(ev.has_high_risk),
                text_input=ev.notas_personales or "",
            )
        )
    return safe_evaluations


@router.post("/chat/message/")
async def get_chat_response(session: ChatSession) -> Any:
    messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
    return await chatbot_service.get_response(messages_dict, session.step)


@router.get("/chat/greeting/")
async def get_greeting() -> Any:
    return chatbot_service.get_greeting()


@router.post("/chat/")
async def chat_evaluation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session: ChatSession,
    current_user: Usuario = Depends(deps.get_current_user),
) -> Any:
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
        report = await ai_report_service.generate_daily_report(messages_dict)

        # Puntajes dinámicos basados en el reporte de IA
        ansiedad_label = report.get("nivel_ansiedad", "Bajo")
        depresion_label = report.get("nivel_depresion", "Bajo")

        db_obj = Evaluacion(
            phq9Score=level_to_score(depresion_label),
            gad7Score=level_to_score(ansiedad_label),
            nivelRiesgo=str(ansiedad_label),
            resultadoIA=str(report.get("resumen", "Evaluación completada")),
            has_high_risk=("alto" in str(ansiedad_label).lower() or "grave" in str(ansiedad_label).lower()),
            notas_personales="Reporte generado por Chatbot",
            id_usuario=current_user.id,
        )
        db.add(db_obj)
        await db.commit()
        return report
    except Exception as e:
        print(f"Error en chat_evaluation: {e}")
        return {
            "resumen": "Sesión finalizada.",
            "nivel_ansiedad": "Bajo",
            "nivel_depresion": "Bajo",
            "puntos_clave": [],
            "recomendacion_profesional": "Sigue así.",
            "plan_accion": [],
        }


@router.post("/", response_model=Evaluation)
async def create_evaluation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    evaluation_in: EvaluationCreate,
    current_user: Usuario = Depends(deps.get_current_user),
) -> Any:
    ai_result = await ai_service.analyze_text(evaluation_in.text_input)
    db_obj = Evaluacion(
        phq9Score=evaluation_in.phq9Score,
        gad7Score=evaluation_in.gad7Score,
        nivelRiesgo="Leve",
        resultadoIA=ai_result["interpretacion"],
        has_high_risk=ai_result.get("has_alert", False),
        notas_personales=evaluation_in.text_input,
        id_usuario=current_user.id,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
