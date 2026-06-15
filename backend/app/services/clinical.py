from app.services.clinical_ai import ClinicalAIService

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

clinical_service = ClinicalService()
# Delegate to the unified service
ai_service = ClinicalAIService()
