import pytest
from pydantic import ValidationError

from app.api.assessments import level_to_score
from app.schemas.evaluation import EvaluationCreate
from app.services.chatbot import chatbot_service
from app.services.clinical import ai_service

pytestmark = pytest.mark.unit


def test_phq9_logic_bounds():
    """Verifica que el sistema maneje correctamente los límites de puntajes PHQ-9"""
    # Caso mínimo
    assert level_to_score("Bajo") == 5
    # Caso máximo
    assert level_to_score("Grave") == 18
    # Caso inexistente
    assert level_to_score("Desconocido") == 0


def test_evaluation_schema_validation():
    """Verifica que los datos que entran al sistema sean válidos (Pydantic)"""
    # Datos correctos
    valid_data = {"phq9Score": 10, "gad7Score": 8, "text_input": "Me siento ansioso"}
    eval_obj = EvaluationCreate(**valid_data)
    assert eval_obj.phq9Score == 10

    # Datos incorrectos (debe fallar)
    with pytest.raises(ValidationError):
        EvaluationCreate(phq9Score="no es un numero", gad7Score=5)


@pytest.mark.asyncio
async def test_chatbot_greeting_logic():
    """Prueba que el chatbot genere saludos válidos sin depender de la API externa"""
    greeting = chatbot_service.get_greeting()
    # Ahora verificamos el campo 'response' del diccionario
    assert "MindGuard" in greeting["response"]
    assert isinstance(greeting, dict)


@pytest.mark.asyncio
async def test_ai_service_text_analysis_structure():
    """Verifica que el servicio de análisis de IA devuelva la estructura correcta incluso si falla Groq"""
    # Simulamos una entrada
    result = await ai_service.analyze_text("Me siento muy triste hoy")

    # Verificamos que aunque falle la API de Groq (como vimos antes),
    # el servicio tiene un 'fallback' que devuelve una estructura válida.
    assert "interpretacion" in result
    assert "has_alert" in result
    assert isinstance(result["has_alert"], bool)
