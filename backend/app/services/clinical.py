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
        
        if not self.active or not text or len(text) < 5:
            return {
                "label": "FALLBACK", 
                "score": 0.5, 
                "sentiment": "DISTRESS" if has_alert else "STABLE", 
                "has_alert": has_alert
            }
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(self.executor, self._run_inference, text)
            
            return {
                "label": result['label'],
                "score": result['score'],
                "sentiment": "DISTRESS" if result['label'] in ['contradiction', 'neutral'] and result['score'] < 0.6 else "STABLE",
                "has_alert": has_alert
            }
        except Exception as e:
            print(f"Error during AI inference: {e}")
            return {
                "label": "ERROR", 
                "score": 0.0, 
                "sentiment": "DISTRESS" if has_alert else "STABLE", 
                "has_alert": has_alert
            }

    def _run_inference(self, text: str) -> dict:
        if self.classifier:
            result = self.classifier(text)[0]
            return {"label": result['label'], "score": result['score']}
        return {"label": "NONE", "score": 0.0}

clinical_service = ClinicalService()
ai_service = AIService()
