from typing import Dict, List

from groq import Groq

from app.core.config import settings


class MentalHealthChatbot:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if self.api_key:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model_id = "llama-3.3-70b-versatile"
        else:
            self.client = None

        # Definición del test PHQ-4 (4 preguntas clave)
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

    def get_greeting(self) -> Dict:
        return {
            "response": "¡Hola! Soy MindGuard 🌙. Antes de conversar, hagamos un breve chequeo de tu estado hoy. ¿Empezamos?",
            "options": ["Sí, adelante", "Ahora no, solo quiero hablar"],
        }

    async def get_response(self, messages: List[Dict[str, str]], step_name: str = None) -> Dict:
        # Contar cuántas respuestas ha dado el usuario para saber en qué pregunta vamos
        user_responses = [m for m in messages if m["role"] == "user"]
        num_responses = len(user_responses)

        # Si el usuario dijo que "Ahora no", pasamos a modo libre
        if any("Ahora no" in m["content"] for m in user_responses):
            return await self._get_free_response(messages)

        # Si estamos en el proceso del test (4 preguntas)
        if num_responses <= len(self.questions):
            # Si el usuario acaba de decir "Sí, adelante" o es el inicio
            idx = num_responses - 1 if num_responses > 0 else 0
            if idx < len(self.questions):
                q = self.questions[idx]
                return {"response": q["text"], "options": q["options"]}

        # Si ya terminó las preguntas, pasamos a modo psicólogo
        return await self._get_free_response(messages)

    async def _get_free_response(self, messages: List[Dict[str, str]]) -> Dict:
        prompt = (
            "Eres MindGuard, un psicólogo clínico experto. Has terminado el triaje inicial. "
            "Ahora ofrece apoyo empático, consejos de salud mental o recomendaciones (música/cine). "
            "Sé breve (máximo 3 líneas) y profesional."
        )
        try:
            history = [{"role": "system", "content": prompt}]
            for m in messages:
                history.append({"role": m["role"], "content": m["content"]})

            completion = self.client.chat.completions.create(
                model=self.model_id, messages=history, temperature=0.7, max_tokens=250
            )
            return {"response": completion.choices[0].message.content, "options": []}
        except Exception:
            return {"response": "Entiendo. Cuéntame más sobre eso...", "options": []}


chatbot_service = MentalHealthChatbot()
