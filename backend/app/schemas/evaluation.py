from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class EvaluationBase(BaseModel):
    phq9Score: int
    gad7Score: int
    phq9Answers: Optional[List[int]] = None
    gad7Answers: Optional[List[int]] = None
    text_input: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class Evaluation(EvaluationBase):
    id: int
    fecha: datetime
    nivelRiesgo: str
    resultadoIA: Optional[str] = None
    id_usuario: int
    has_high_risk: bool = False # Campo nuevo para indicar riesgo suicida/autolesión

    class Config:
        from_attributes = True

class EvaluationResult(BaseModel):
    phq9_level: str
    gad7_level: str
    ai_analysis: str
    overall_risk: str
