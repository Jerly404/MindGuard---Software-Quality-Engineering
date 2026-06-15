from typing import Dict, List

from app.services.clinical_ai import ClinicalAIService


class AIServiceWrapper:
    def __init__(self):
        self.unified_ai = ClinicalAIService()

    async def generate_daily_report(self, messages: List[Dict[str, str]]) -> Dict:
        return await self.unified_ai.generate_daily_report(messages)


ai_report_service = AIServiceWrapper()
