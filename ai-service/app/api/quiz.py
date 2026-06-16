from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json
import os

router = APIRouter(prefix="/quiz", tags=["Quiz"])
MODEL_NAME = os.getenv("MODEL_NAME") or os.getenv("OLLAMA_MODEL") or "llama3.1:8b"


class QuizSuggestRequest(BaseModel):
    topic: str = "General Knowledge"
    difficulty: str = "Medium"
    count: int = 5
    questionType: str = "multiple_choice"  # "multiple_choice" or "theoretical"


@router.post("/suggest-questions")
async def suggest_quiz_questions(request: QuizSuggestRequest):
    """Generate AI-powered quiz questions based on topic and difficulty."""
    try:
        if request.questionType == "multiple_choice":
            format_instruction = """
            Return a JSON object with a "questions" array. Each question object must have:
            - "text": the question string
            - "type": "multiple_choice"
            - "options": array of 4 option strings
            - "correctAnswer": index of the correct option as a string ("0", "1", "2", or "3")
            """
        else:
            format_instruction = """
            Return a JSON object with a "questions" array. Each question object must have:
            - "text": the question string
            - "type": "theoretical"
            - "options": empty array []
            - "correctAnswer": comma-separated expected keywords for the answer
            """

        prompt = f"""
        You are an expert Quiz Master and Educator.
        
        Generate exactly {request.count} {request.difficulty}-difficulty quiz questions 
        about "{request.topic}".
        
        {format_instruction}
        
        RULES:
        - Questions should be clear, concise, and educational
        - For {request.difficulty} difficulty: {"basic concepts and definitions" if request.difficulty == "Easy" else "applied concepts and problem-solving" if request.difficulty == "Medium" else "advanced scenarios and edge cases"}
        - Make options plausible (no obviously wrong answers)
        - Ensure questions are diverse and cover different aspects of the topic
        
        Return ONLY valid JSON.
        """

        response = llm_service.chat(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are a Quiz Generator AI. Output valid JSON only with well-crafted quiz questions.",
                },
                {"role": "user", "content": prompt},
            ],
            format="json",
            options={"temperature": 0.7, "num_predict": 2000},
        )

        result = json.loads(response["message"]["content"])

        # Normalize the response structure
        questions = result.get("questions", [])

        # Ensure each question has the right structure
        normalized = []
        for q in questions[: request.count]:
            normalized.append(
                {
                    "text": q.get("text", q.get("question", "")),
                    "type": request.questionType,
                    "options": q.get("options", []),
                    "correctAnswer": str(q.get("correctAnswer", "0")),
                }
            )

        return {"success": True, "questions": normalized}

    except Exception as e:
        print(f"Error in quiz suggest-questions: {e}")
        return {"success": False, "error": str(e), "questions": []}
