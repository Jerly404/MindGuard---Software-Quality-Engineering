from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models.base import Usuario, Evaluacion, ResultadoIA
from app.schemas.evaluation import EvaluationCreate, Evaluation, EvaluationResult
from app.services.clinical import clinical_service, ai_service
from app.services.chatbot import chatbot_service
from pydantic import BaseModel

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # user or assistant
    content: str

class ChatSession(BaseModel):
    messages: List[ChatMessage]
    step: str # Nombre del paso o índice como string

@router.post("/chat/message")
async def get_chat_response(
    session: ChatSession
) -> Any:
    messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
    response = await chatbot_service.get_response(messages_dict, session.step)
    return {"response": response}

@router.get("/chat/greeting")
async def get_greeting() -> Any:
    return {"response": chatbot_service.get_greeting()}

@router.post("/chat", response_model=Evaluation)
async def chat_evaluation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session: ChatSession,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    # 1. Analizar el texto acumulado de la sesión de chat
    messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
    full_text = chatbot_service.analyze_session(messages_dict)
    
    # 2. Análisis de IA sobre la conversación completa
    ai_result = await ai_service.analyze_text(full_text)
    
    # 3. Determinar riesgo y etiquetas
    risk_label = "Leve"
    if ai_result.get("has_alert"):
        risk_label = "Grave"
    elif ai_result["sentiment"] == "DISTRESS":
        risk_label = "Moderado"
        
    # Crear el objeto de evaluación
    db_obj = Evaluacion(
        phq9Score=0,
        gad7Score=0,
        nivelRiesgo=risk_label,
        resultadoIA=ai_result["interpretacion"],
        has_high_risk=ai_result.get("has_alert", False),
        notas_personales=full_text,
        id_usuario=current_user.id
    )
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # Mapear al esquema con el análisis detallado
    return Evaluation(
        id=db_obj.id,
        fecha=db_obj.fecha,
        phq9Score=db_obj.phq9Score,
        gad7Score=db_obj.gad7Score,
        nivelRiesgo=db_obj.nivelRiesgo,
        resultadoIA=db_obj.resultadoIA,
        has_high_risk=db_obj.has_high_risk,
        id_usuario=db_obj.id_usuario,
        text_input=db_obj.notas_personales,
        analisis_detallado={
            "emociones_detectadas": ai_result["emociones_detectadas"],
            "factores_detectados": ai_result["factores_detectados"],
            "riesgo_emocional": ai_result["riesgo_emocional"],
            "patrones": ai_result["patrones"],
            "interpretacion": ai_result["interpretacion"],
            "recomendacion": ai_result["recomendacion"]
        }
    )

@router.post("/", response_model=Evaluation)
async def create_evaluation(
    *,
    db: AsyncSession = Depends(deps.get_db),
    evaluation_in: EvaluationCreate,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    # 1. AI Analysis
    ai_result = await ai_service.analyze_text(evaluation_in.text_input)
    
    # 2. Determine risk level
    phq9_level = clinical_service.get_phq9_level(evaluation_in.phq9Score)
    gad7_level = clinical_service.get_gad7_level(evaluation_in.gad7Score)
    
    # Check for specific high risk (Question 9 of PHQ-9 or AI Alert)
    suicidal_ideation = False
    if evaluation_in.phq9Answers and len(evaluation_in.phq9Answers) >= 9:
        if evaluation_in.phq9Answers[8] > 0: 
            suicidal_ideation = True
    
    has_high_risk = suicidal_ideation or ai_result.get("has_alert", False)
    
    risk_levels = {"Mínimo": 0, "Leve": 1, "Moderado": 2, "Moderadamente Grave": 3, "Grave": 4}
    max_risk_score = max(risk_levels[phq9_level], risk_levels[gad7_level])
    
    if has_high_risk:
        max_risk_score = 4 
    elif ai_result["sentiment"] == "DISTRESS" and ai_result["score"] > 0.7:
        max_risk_score = max(max_risk_score, 2) 
    
    reverse_risk = {v: k for k, v in risk_levels.items()}
    overall_risk = reverse_risk[max_risk_score]

    db_obj = Evaluacion(
        phq9Score=evaluation_in.phq9Score,
        gad7Score=evaluation_in.gad7Score,
        nivelRiesgo=overall_risk,
        resultadoIA=f"{ai_result['label']} - {ai_result['sentiment']} ({ai_result['score']:.2f})",
        has_high_risk=has_high_risk,
        id_usuario=current_user.id,
        notas_personales=evaluation_in.text_input
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # Save detailed AI result
    ai_detail = ResultadoIA(
        nivel="ALTO" if has_high_risk else "BAJO",
        scoreConfianza=ai_result["score"],
        id_evaluacion=db_obj.id
    )
    db.add(ai_detail)
    await db.commit()
    
    return Evaluation(
        id=db_obj.id,
        fecha=db_obj.fecha,
        phq9Score=db_obj.phq9Score,
        gad7Score=db_obj.gad7Score,
        nivelRiesgo=db_obj.nivelRiesgo,
        resultadoIA=db_obj.resultadoIA,
        has_high_risk=bool(db_obj.has_high_risk),
        id_usuario=db_obj.id_usuario,
        text_input=db_obj.notas_personales,
        analisis_detallado={
            "emociones_detectadas": ai_result["emociones_detectadas"],
            "factores_detectados": ai_result["factores_detectados"],
            "riesgo_emocional": ai_result["riesgo_emocional"],
            "patrones": ai_result["patrones"],
            "interpretacion": ai_result["interpretacion"],
            "recomendacion": ai_result["recomendacion"]
        }
    )

@router.get("/me", response_model=List[Evaluation])
async def read_evaluations(
    db: AsyncSession = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    # Usamos una consulta explícita para evitar problemas de relación
    result = await db.execute(
        select(Evaluacion)
        .where(Evaluacion.id_usuario == current_user.id)
        .order_by(Evaluacion.fecha.desc())
    )
    evaluations_db = result.scalars().all()
    
    # Mapeo manual ultra-seguro
    output = []
    for e in evaluations_db:
        output.append(Evaluation(
            id=int(e.id),
            fecha=e.fecha,
            phq9Score=int(e.phq9Score or 0),
            gad7Score=int(e.gad7Score or 0),
            nivelRiesgo=str(e.nivelRiesgo or "Desconocido"),
            resultadoIA=str(e.resultadoIA or ""),
            has_high_risk=bool(e.has_high_risk),
            id_usuario=int(e.id_usuario),
            text_input=str(e.notas_personales or "")
        ))
    return output
