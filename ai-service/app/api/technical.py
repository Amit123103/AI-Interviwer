from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json
from app.services.evaluator import evaluator

router = APIRouter(prefix="/technical", tags=["Technical"])
MODEL_NAME = "llama3.1:8b"

class TechnicalEvaluationRequest(BaseModel):
    user_id: str
    question: str = ""
    student_code: str = ""
    execution_output: str = ""
    duration: int = 0
    violations: int = 0
    is_initial: bool = False
    coding_level: str = "Intermediate"
    department: str = "General"

@router.post("/evaluate")
async def evaluate_technical(request: TechnicalEvaluationRequest):
    try:
        if request.is_initial:
            # Generate first technical question
            prompt = f"Generate a {request.coding_level} level technical interview question for {request.department} department."
            response = llm_service.chat(model=MODEL_NAME, messages=[{"role": "user", "content": prompt}])
            return {"question": response['message']['content'], "difficulty_score": 5}
        
        # Evaluate code
        context = {
            "difficulty": request.coding_level,
            "sector": request.department,
            "job_role": request.department
        }
        evaluation = evaluator.evaluate_answer(request.question, request.student_code, context)
        return {"evaluation": evaluation, "difficulty_score": 7}
    except Exception as e:
        print(f"Error in technical evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
