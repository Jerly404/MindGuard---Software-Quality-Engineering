import json

from groq import Groq

from app.core.config import settings


class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            self.model_id = 'llama-3.3-70b-versatile'
        else:
            self.client = None

    async def generate_daily_report(self, messages: list) -> dict:
        if not self.client:
            return {"error": "IA no configurada"}

        # Convertir mensajes a texto plano para el análisis
        chat_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])

        prompt = (
            "Actúa como un psicólogo clínico senior. Analiza esta conversación y genera un REPORTE DEL ESTADO DEL DÍA en formato JSON.\n"
            "La respuesta DEBE ser un JSON con esta estructura exacta:\n"
            "{\n"
            "  \"resumen\": \"Breve resumen de 2 frases sobre cómo está el usuario hoy\",\n"
            "  \"nivel_ansiedad\": \"Bajo/Medio/Alto\",\n"
            "  \"nivel_depresion\": \"Bajo/Medio/Alto\",\n"
            "  \"puntos_clave\": [\"punto 1\", \"punto 2\"],\n"
            "  \"recomendacion_profesional\": \"Consejo clínico breve\",\n"
            "  \"plan_accion\": [\"tarea 1\", \"tarea 2\"]\n"
            "}\n\n"
            f"Conversación:\n{chat_text}"
        )

        try:
            completion = self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Error generando reporte: {e}")
            return {"error": "No se pudo generar el reporte"}

ai_report_service = AIService()
