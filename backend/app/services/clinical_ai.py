import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from groq import Groq
from app.core.config import settings

logger = logging.getLogger("mindguard")

PROMPT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "resources", "prompts")

def load_prompt(filename: str) -> str:
    path = os.path.join(PROMPT_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        logger.error(f"Error loading prompt {filename}: {e}")
        return ""

class ClinicalAIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model_id = "llama-3.3-70b-versatile"
        self.timeout_seconds = 10.0
        
        if self.api_key:
            # We construct a custom httpx client to pass timeouts and configure the Groq SDK
            http_client = httpx.Client(timeout=self.timeout_seconds)
            self.client = Groq(api_key=self.api_key, http_client=http_client)
        else:
            self.client = None

        # Defecto del test PHQ-4
        self.questions = [
            {
                "id": "mood",
                "text": "¿Con qué frecuencia te has sentido triste, deprimido o sin esperanza en las últimas 2 semanas?",
                "options": ["Para nada", "Varios días", "Más de la mitad de los días", "Casi todos los días"],
            },
            {
                "id": "interest",
                "text": "¿Has sentido poco interés o placer en hacer las cosas?",
                "options": ["Para nada", "Varios días", "Más de la mitad de los días", "Casi todos los días"],
            },
            {
                "id": "anxiety",
                "text": "¿Te has sentido nervioso, ansioso o con los nervios de punta?",
                "options": ["Para nada", "Varios días", "Más de la mitad de los días", "Casi todos los días"],
            },
            {
                "id": "worry",
                "text": "¿No has podido dejar de preocuparte o controlar la preocupación?",
                "options": ["Para nada", "Varios días", "Más de la mitad de los días", "Casi todos los días"],
            },
        ]

    def get_greeting(self) -> Dict[str, Any]:
        return {
            "response": "¡Hola! Soy MindGuard 🌙. Antes de conversar, hagamos un breve chequeo de tu estado hoy. ¿Empezamos?",
            "options": ["Sí, adelante", "Ahora no, solo quiero hablar"],
        }

    async def get_response(self, messages: List[Dict[str, str]], step_name: str = None) -> Dict[str, Any]:
        user_responses = [m for m in messages if m["role"] == "user"]
        num_responses = len(user_responses)

        # Si el usuario dice "Ahora no", pasamos a modo libre
        if any("Ahora no" in m["content"] for m in user_responses):
            return await self._get_free_response(messages)

        # Flujo de triaje (4 preguntas)
        if num_responses <= len(self.questions):
            idx = num_responses - 1 if num_responses > 0 else 0
            if idx < len(self.questions):
                q = self.questions[idx]
                return {"response": q["text"], "options": q["options"]}

        # Fuera del triaje, modo libre psicólogo
        return await self._get_free_response(messages)

    async def _get_free_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        system_prompt = load_prompt("chatbot_free.txt")
        if not self.client:
            logger.warning("Groq client not configured. Returning fallback free response.")
            return {"response": "Entiendo. Cuéntame más sobre eso...", "options": []}

        try:
            history = [{"role": "system", "content": system_prompt}]
            for m in messages:
                history.append({"role": m["role"], "content": m["content"]})

            # Llamada al LLM con timeout implícito en el cliente HTTP de Groq
            completion = self.client.chat.completions.create(
                model=self.model_id, 
                messages=history, 
                temperature=0.7, 
                max_tokens=250
            )
            return {"response": completion.choices[0].message.content, "options": []}
        except Exception as e:
            logger.error(f"Error in chatbot free response generation: {e}", exc_info=True)
            return {"response": "Entiendo. Cuéntame más sobre eso...", "options": []}

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        fallback_response = {
            "sentiment": "STABLE",
            "has_alert": False,
            "emociones_detectadas": {
                "tristeza": 0.2, 
                "ansiedad": 0.2, 
                "estrés": 0.2, 
                "sobrepensamiento": 0.1, 
                "agotamiento_mental": 0.1
            },
            "factores_detectados": [],
            "riesgo_emocional": "bajo",
            "interpretacion": "No se pudo realizar el análisis detallado por indisponibilidad de IA.",
            "recomendacion": "Continúa conversando con el asistente.",
            "label": "GROQ_ANALYSIS",
            "score": 0.99,
            "patrones": ["Análisis dinámico"]
        }

        if not self.client:
            logger.warning("Groq client not configured. Returning fallback text analysis.")
            return fallback_response

        template = load_prompt("clinical_analysis.txt")
        prompt = template.replace("{text}", text)

        try:
            completion = self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            content = completion.choices[0].message.content
            result = json.loads(content)
            
            # Garantizar que las claves existan para evitar KeyError en el llamador
            result.setdefault("sentiment", "STABLE")
            result.setdefault("has_alert", False)
            result.setdefault("emociones_detectadas", fallback_response["emociones_detectadas"])
            result.setdefault("factores_detectados", [])
            result.setdefault("riesgo_emocional", "bajo")
            result.setdefault("interpretacion", "Evaluación completada.")
            result.setdefault("recomendacion", "Continúa el seguimiento de tu estado emocional.")
            result.setdefault("label", "GROQ_ANALYSIS")
            result.setdefault("score", 0.99)
            result.setdefault("patrones", ["Análisis dinámico"])
            return result
        except Exception as e:
            logger.error(f"Error in text analysis generation: {e}", exc_info=True)
            return fallback_response

    async def generate_daily_report(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        fallback_report = {
            "resumen": "Evaluación completada.",
            "nivel_ansiedad": "Bajo",
            "nivel_depresion": "Bajo",
            "puntos_clave": [],
            "recomendacion_profesional": "Sigue adelante.",
            "plan_accion": []
        }

        if not self.client:
            logger.warning("Groq client not configured. Returning fallback daily report.")
            return fallback_report

        chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        template = load_prompt("daily_report.txt")
        prompt = template.replace("{chat_text}", chat_text)

        try:
            completion = self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            content = completion.choices[0].message.content
            result = json.loads(content)
            
            # Asegurar claves por defecto
            result.setdefault("resumen", "Evaluación completada.")
            result.setdefault("nivel_ansiedad", "Bajo")
            result.setdefault("nivel_depresion", "Bajo")
            result.setdefault("puntos_clave", [])
            result.setdefault("recomendacion_profesional", "Sigue adelante.")
            result.setdefault("plan_accion", [])
            return result
        except Exception as e:
            logger.error(f"Error in daily report generation: {e}", exc_info=True)
            return fallback_report
