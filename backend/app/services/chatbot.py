from google import genai
from google.genai import types
from typing import List, Dict
from app.core.config import settings

class MentalHealthChatbot:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model_id = 'gemini-flash-latest' 
        else:
            self.client = None
            print("Warning: GOOGLE_API_KEY not found. Chatbot will use fallback logic.")

        self.system_prompt = (
            "Eres MindGuard AI, un asistente virtual especializado en apoyo emocional y "
            "primeros auxilios psicológicos. Tu personalidad es la de un psicólogo clínico "
            "empático, cálido y profesional. Utilizas técnicas de escucha activa, validación "
            "emocional y preguntas abiertas para ayudar al usuario a explorar sus sentimientos.\n\n"
            "REGLAS CRÍTICAS:\n"
            "1. NO des diagnósticos médicos definitivos.\n"
            "2. Si detectas riesgo de autolesión o suicidio, prioriza la seguridad y sugiere contactar a emergencias (Línea 113 en Perú).\n"
            "3. Mantén respuestas concisas pero profundas (máximo 3 párrafos).\n"
            "4. Tu objetivo es guiar una conversación fluida para entender el estado del usuario (ánimo, energía, sueño, ansiedad).\n"
            "5. NO repitas patrones mecánicos. Responde directamente a lo que el usuario dice."
        )

    def get_greeting(self) -> str:
        return (
            "Hola, soy MindGuard 🌙\n"
            "Este es un espacio seguro donde podemos conversar sobre cómo te has sentido últimamente. "
            "No hay respuestas correctas o incorrectas, solo tu verdad.\n\n"
            "¿Cómo te encuentras el día de hoy?"
        )

    async def get_response(self, messages: List[Dict[str, str]], step_name: str = None) -> str:
        if not self.client:
            return "Lo siento, mi conexión con el motor de IA no está activa. ¿Podrías intentar más tarde?"

        try:
            # Convertir historial al formato de google-genai
            contents = []
            
            # El primer mensaje debe ser el system prompt o incluirlo en el contexto
            # En la nueva SDK, se puede pasar como parte de la configuración o del primer mensaje
            
            for m in messages:
                role = "user" if m["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part(text=m["content"])]))
            
            # Configuración con el system prompt
            config = types.GenerateContentConfig(
                system_instruction=self.system_prompt,
                temperature=0.7,
            )
            
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=config
            )
            
            return response.text
        except Exception as e:
            return "Parece que tengo dificultades para procesar esto ahora. ¿Me podrías contar un poco más con otras palabras?"

    def analyze_session(self, messages: List[Dict[str, str]]):
        full_text = " ".join([m["content"] for m in messages if m["role"] == "user"])
        return full_text

chatbot_service = MentalHealthChatbot()
