from app.services.llm_service import llm_service
import json
import re
from typing import Dict, Any

class InterviewEvaluator:
    def __init__(self, model_name="llama3.1:8b"):
        self.model_name = model_name

    def evaluate_answer(self, question: str, answer: str, context: Dict[str, Any] = None, api_key: str = None) -> Dict[str, Any]:
        """
        Evaluates a single interview answer based on 6 key metrics.
        """
        difficulty = context.get("difficulty", "Intermediate") if context else "Intermediate"
        sector = context.get("sector", "General") if context else "General"
        job_role = context.get("job_role", "Software Engineer") if context else "Software Engineer"

        prompt = f"""
        Evaluate the following interview response for a {job_role} position.
        
        [QUESTION]: {question}
        [ANSWER]: {answer}
        [CONTEXT]: Level: {difficulty}, Domain: {sector}
        
        Provide a detailed score (0-100) for each of these 6 metrics:
        1. Relevance to Question (Did they actually answer it?)
        2. Technical Correctness (Are the facts/concepts accurate?)
        3. Clarity and Structure (Is the explanation logical and structured? e.g., STAR method)
        4. Confidence (Does the tone imply mastery or hesitation?)
        5. Communication Quality (Articulation, vocabulary, and conciseness)
        6. Keyword/Concept Coverage (Did they mention key terms: {sector}-specific?)
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "metrics": {{
                "relevance": 0-100,
                "technical_correctness": 0-100,
                "clarity_structure": 0-100,
                "confidence": 0-100,
                "communication": 0-100,
                "concept_coverage": 0-100
            }},
            "overall_score": 0-100,
            "feedback": "A professional paragraph with strengths and specific areas to improve.",
            "followup_tip": "One-line advice for the next turn."
        }}
        """
        
        try:
            response = llm_service.chat(messages=[
                {"role": "system", "content": "You are an Expert Technical Interviewer. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ], format='json', override_api_key=api_key)
            
            return json.loads(response['message']['content'])
        except Exception as e:
            print(f"Evaluation Error: {e}")
            return self._error_response()

    def _error_response(self):
        return {
            "metrics": {
                "relevance": 50, "technical_correctness": 50, "clarity_structure": 50,
                "confidence": 50, "communication": 50, "concept_coverage": 50
            },
            "overall_score": 50,
            "feedback": "Evaluation failed due to system error.",
            "followup_tip": "Keep going!"
        }

# Singleton instance
evaluator = InterviewEvaluator()
