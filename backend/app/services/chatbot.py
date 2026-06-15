from typing import Dict, List
from app.services.clinical_ai import ClinicalAIService

class MentalHealthChatbot:
    def __init__(self):
        self.unified_ai = ClinicalAIService()
        self.questions = self.unified_ai.questions

    def get_greeting(self) -> Dict:
        return self.unified_ai.get_greeting()

    async def get_response(self, messages: List[Dict[str, str]], step_name: str = None) -> Dict:
        return await self.unified_ai.get_response(messages, step_name)

chatbot_service = MentalHealthChatbot()
