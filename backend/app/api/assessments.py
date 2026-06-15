from datetime import datetime, timezone
from typing import Annotated, Any, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api import deps
from app.models.base import Usuario
from app.schemas.evaluation import Evaluation, EvaluationCreate
from app.services.business_services import EvaluationService, level_to_score
from app.services.chatbot import chatbot_service

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatSession(BaseModel):
    messages: List[ChatMessage]
    step: str


@router.get("/me", response_model=List[Evaluation])
async def get_my_assessments(
    eval_service: Annotated[EvaluationService, Depends(deps.get_evaluation_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
) -> Any:
    evaluations_db = await eval_service.list_by_user(current_user.id, asc=True)

    safe_evaluations = []
    for ev in evaluations_db:
        p_score = ev.phq9Score if (ev.phq9Score and ev.phq9Score > 0) else level_to_score(ev.nivelRiesgo)
        g_score = ev.gad7Score if (ev.gad7Score and ev.gad7Score > 0) else level_to_score(ev.nivelRiesgo)

        safe_evaluations.append(
            Evaluation(
                id=ev.id,
                fecha=ev.fecha or datetime.now(timezone.utc),
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
async def get_chat_response(
    session: ChatSession, current_user: Annotated[Usuario, Depends(deps.get_current_user)]
) -> Any:
    messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
    return await chatbot_service.get_response(messages_dict, session.step)


@router.get("/chat/greeting/")
async def get_greeting(current_user: Annotated[Usuario, Depends(deps.get_current_user)]) -> Any:
    return chatbot_service.get_greeting()


@router.post("/chat/", response_model=Evaluation)
async def chat_evaluation(
    *,
    eval_service: Annotated[EvaluationService, Depends(deps.get_evaluation_service)],
    session: ChatSession,
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
) -> Any:
    messages_dict = [{"role": m.role, "content": m.content} for m in session.messages]
    return await eval_service.create_chat_evaluation(current_user.id, messages_dict)


@router.post("/", response_model=Evaluation)
async def create_evaluation(
    *,
    eval_service: Annotated[EvaluationService, Depends(deps.get_evaluation_service)],
    evaluation_in: EvaluationCreate,
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
) -> Any:
    return await eval_service.create_evaluation(
        user_id=current_user.id,
        phq9Score=evaluation_in.phq9Score,
        gad7Score=evaluation_in.gad7Score,
        text_input=evaluation_in.text_input or "",
    )
