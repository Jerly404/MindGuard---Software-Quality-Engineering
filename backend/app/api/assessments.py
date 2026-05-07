from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models.base import Usuario, Evaluacion, ResultadoIA
from app.schemas.evaluation import EvaluationCreate, Evaluation, EvaluationResult
from app.services.clinical import clinical_service, ai_service

router = APIRouter()

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
    # PHQ-9 Q9 is index 8 in phq9Answers
    suicidal_ideation = False
    if evaluation_in.phq9Answers and len(evaluation_in.phq9Answers) >= 9:
        if evaluation_in.phq9Answers[8] > 0: # 1, 2, or 3 means "several days" to "nearly every day"
            suicidal_ideation = True
    
    has_high_risk = suicidal_ideation or ai_result.get("has_alert", False)
    
    # Simple heuristic for overall risk
    risk_levels = {"Mínimo": 0, "Leve": 1, "Moderado": 2, "Moderadamente Grave": 3, "Grave": 4}
    max_risk_score = max(risk_levels[phq9_level], risk_levels[gad7_level])
    
    if has_high_risk:
        max_risk_score = 4 # Force Grave risk if suicidal ideation/alert is present
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
    
    return db_obj

@router.get("/me", response_model=List[Evaluation])
async def read_evaluations(
    db: AsyncSession = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    result = await db.execute(select(Evaluacion).where(Evaluacion.id_usuario == current_user.id))
    return result.scalars().all()
