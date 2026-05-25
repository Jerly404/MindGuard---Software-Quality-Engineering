import json

from groq import Groq

from app.core.config import settings


class ClinicalService:
    @staticmethod
    def get_phq9_level(score: int) -> str:
        if score <= 4:
            return "Mínimo"
        if score <= 9:
            return "Leve"
        if score <= 14:
            return "Moderado"
        if score <= 19:
            return "Moderadamente Grave"
        return "Grave"

    @staticmethod
    def get_gad7_level(score: int) -> str:
        if score <= 4:
            return "Mínimo"
        if score <= 9:
            return "Leve"
        if score <= 14:
            return "Moderado"
        return "Grave"


class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            self.model_id = "llama-3.3-70b-versatile"
        else:
            self.client = None

    async def analyze_text(self, text: str) -> dict:
        if not self.client:
            return {"error": "Groq not configured"}

        prompt = (
            "Analiza el siguiente texto de una conversación de salud mental y devuelve un JSON estricto con este formato:\n"
            "{\n"
            '  "sentiment": "DISTRESS" o "STABLE",\n'
            '  "has_alert": true o false (si hay riesgo de suicidio),\n'
            '  "emociones_detectadas": {"tristeza": 0.x, "ansiedad": 0.x, "estrés": 0.x, "sobrepensamiento": 0.x, "agotamiento_mental": 0.x},\n'
            '  "factores_detectados": ["factor1", "factor2"],\n'
            '  "riesgo_emocional": "bajo", "moderado" o "alto",\n'
            '  "interpretacion": "resumen breve del estado del usuario",\n'
            '  "recomendacion": "consejo breve"\n'
            "}\n\n"
            f"Texto: {text}"
        )

        try:
            completion = self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            result = json.loads(completion.choices[0].message.content)
            # Asegurar campos por defecto si faltan
            result.setdefault("label", "GROQ_ANALYSIS")
            result.setdefault("score", 0.99)
            result.setdefault("patrones", ["Análisis dinámico"])
            return result
        except Exception as e:
            print(f"Error en análisis Groq: {e}")
            return {
                "sentiment": "STABLE",
                "has_alert": False,
                "emociones_detectadas": {},
                "factores_detectados": [],
                "riesgo_emocional": "bajo",
                "interpretacion": "No se pudo realizar el análisis detallado.",
                "recomendacion": "Continúa conversando con el asistente.",
            }


clinical_service = ClinicalService()
ai_service = AIService()
