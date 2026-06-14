from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class EvaluationBase(BaseModel):
    phq9Score: int = Field(..., ge=0, le=27)
    gad7Score: int = Field(..., ge=0, le=21)
    phq9Answers: Optional[List[int]] = None
    gad7Answers: Optional[List[int]] = None
    text_input: Optional[str] = None

    @field_validator("phq9Answers")
    @classmethod
    def validate_phq9_answers(cls, value: Optional[List[int]]) -> Optional[List[int]]:
        if value is not None and len(value) != 9:
            raise ValueError("phq9Answers debe contener exactamente 9 respuestas")
        return value

    @field_validator("gad7Answers")
    @classmethod
    def validate_gad7_answers(cls, value: Optional[List[int]]) -> Optional[List[int]]:
        if value is not None and len(value) != 7:
            raise ValueError("gad7Answers debe contener exactamente 7 respuestas")
        return value


class EvaluationCreate(EvaluationBase):
    pass


class DetailedAIAnalysis(BaseModel):
    emociones_detectadas: Dict[str, float]
    factores_detectados: List[str]
    riesgo_emocional: str
    patrones: List[str]
    interpretacion: str
    recomendacion: str


class Evaluation(EvaluationBase):
    id: int
    fecha: datetime
    nivelRiesgo: str
    resultadoIA: Optional[str] = None
    id_usuario: int
    has_high_risk: bool = False
    analisis_detallado: Optional[DetailedAIAnalysis] = None

    model_config = {"from_attributes": True}


class EvaluationResult(BaseModel):
    phq9_level: str
    gad7_level: str
    ai_analysis: str
    overall_risk: str
