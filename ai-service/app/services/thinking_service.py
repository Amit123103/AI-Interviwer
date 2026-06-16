
from app.services.llm_service import llm_service
import json

class ThinkingService:
    """
    Implements Chain-of-Thought reasoning for the Interviewer.
    Analyzes user responses for quality, depth, and sentiment before the main LLM generates a question.
    """
    
    def __init__(self, model_name="llama3.1:8b"):
        self.model_name = model_name

    def analyze_response(self, question: str, user_answer: str) -> dict:
        """
        [DEPRECATED] Independent LLM analysis is now handled by the Unified Turn Brain in main.py.
        Returns basic heuristics for local fallback.
        """
        # Heuristic for very short answers
        if not user_answer or len(user_answer.split()) < 8:
            return {
                "quality": "Low",
                "completeness": "Incomplete",
                "move": "PROBE",
                "suggestion": "Response is too short. Ask for elaboration."
            }
        
        return {"move": "MOVE_ON", "suggestion": "Proceed normally."}
