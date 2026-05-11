from transformers import pipeline
import torch
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ClinicalService:
    @staticmethod
    def get_phq9_level(score: int) -> str:
        if score <= 4: return "Mínimo"
        if score <= 9: return "Leve"
        if score <= 14: return "Moderado"
        if score <= 19: return "Moderadamente Grave"
        return "Grave"

    @staticmethod
    def get_gad7_level(score: int) -> str:
        if score <= 4: return "Mínimo"
        if score <= 9: return "Leve"
        if score <= 14: return "Moderado"
        return "Grave" # Escala estándar: 15+ es Grave

class AIService:
    def __init__(self):
        # Intentamos cargar el modelo, si falla usamos lógica de respaldo
        self.active = False
        try:
            self.classifier = pipeline(
                "sentiment-analysis", 
                model="symanto/sn-xlm-roberta-base-snli-mnli-anli-xnli",
                device=-1
            )
            self.active = True
            print("AI Model loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load AI model (XLM-R). Using keyword-based fallback. Error: {e}")
            self.classifier = None
        
        self.executor = ThreadPoolExecutor(max_workers=1)

    async def analyze_text(self, text: str) -> dict:
        # Palabras clave de alto riesgo en español
        high_risk_keywords = [
            "suicidio", "morir", "matarme", "quitarme la vida", "autolesion", 
            "no quiero vivir", "terminar con todo", "pastillas para dormir", 
            "ahorcarme", "cortarme", "despedida", "suicidarme"
        ]
        text_lower = (text or "").lower()
        has_alert = any(word in text_lower for word in high_risk_keywords)
        
        # Detección de factores y emociones (Punto 3 y 5)
        factors_map = {
            "insomnio": ["dormir", "sueño", "noche", "descanso"],
            "apego emocional": ["ella", "él", "no responde", "escribió", "pareja"],
            "pensamientos repetitivos": ["pensar", "vueltas", "mente", "repetitivo"],
            "fatiga emocional": ["cansado", "harto", "agotado", "energía"],
            "sobrepensamiento": ["sobrepensar", "pensando demasiado", "ciclo"]
        }
        
        detected_factors = []
        for factor, keywords in factors_map.items():
            if any(kw in text_lower for kw in keywords):
                detected_factors.append(factor)

        # Emociones (simulado con scores basados en keywords + modelo)
        emotions = {
            "tristeza": 0.1,
            "ansiedad": 0.1,
            "estrés": 0.1,
            "sobrepensamiento": 0.1,
            "agotamiento_mental": 0.1
        }
        
        if "triste" in text_lower or "vacío" in text_lower: emotions["tristeza"] += 0.7
        if "miedo" in text_lower or "ansioso" in text_lower: emotions["ansiedad"] += 0.7
        if "harto" in text_lower or "presión" in text_lower: emotions["estrés"] += 0.7
        if "sobrepensar" in text_lower: emotions["sobrepensamiento"] += 0.8
        if "cansado" in text_lower: emotions["agotamiento_mental"] += 0.6

        if not self.active or not text or len(text) < 5:
            label, score = "FALLBACK", 0.5
        else:
            try:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(self.executor, self._run_inference, text)
                label, score = result['label'], result['score']
            except:
                label, score = "ERROR", 0.0

        sentiment = "DISTRESS" if (has_alert or label in ['contradiction', 'neutral'] or emotions["tristeza"] > 0.5 or emotions["ansiedad"] > 0.5) else "STABLE"

        # Generar interpretación (Punto 6)
        interpretacion = "Durante la conversación detecté señales de "
        interpretacion += ", ".join([f for f in detected_factors[:3]]) if detected_factors else "algunos desafíos emocionales"
        interpretacion += ". Parece que tu estado actual está influenciado por pensamientos recurrentes que afectan tu tranquilidad."

        return {
            "label": label,
            "score": score,
            "sentiment": sentiment,
            "has_alert": has_alert,
            "emociones_detectadas": emotions,
            "factores_detectados": detected_factors,
            "riesgo_emocional": "alto" if has_alert else ("moderado" if sentiment == "DISTRESS" else "bajo"),
            "patrones": ["rumiación mental" if emotions["sobrepensamiento"] > 0.5 else "preocupación afectiva"],
            "interpretacion": interpretacion,
            "recomendacion": "Hoy intenta reducir el tiempo pendiente de estímulos externos y enfoca tu atención en algo físico y presente como caminar o escribir lo que sientes."
        }

    def _run_inference(self, text: str) -> dict:
        if self.classifier:
            result = self.classifier(text)[0]
            return {"label": result['label'], "score": result['score']}
        return {"label": "NONE", "score": 0.0}

clinical_service = ClinicalService()
ai_service = AIService()
