from typing import Optional, List, Dict
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

    class Config:
        from_attributes = True

class EvaluationResult(BaseModel):
    phq9_level: str
    gad7_level: str
    ai_analysis: str
    overall_risk: str
