from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json
from app.services.tts_service import tts_service

router = APIRouter(prefix="/negotiation", tags=["Negotiation"])
MODEL_NAME = "llama3.1:8b"

class NegotiationRequest(BaseModel):
    user_id: str
    report_id: str
    current_offer: dict
    user_message: str
    history: list = []
    target_salary: float = 0
    persona: str = "HR Manager"

@router.post("/respond")
async def generate_negotiation_response(request: NegotiationRequest):
    try:
        prompt = f"""
        You are an AI {request.persona} at a reputable company. Negotiate with a candidate.
        Current Offer: {request.current_offer}
        Target Salary: ${request.target_salary}
        Candidate's Message: "{request.user_message}"
        
        Return JSON with response_text, new_offer, sentiment, and is_final.
        """
        
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": f"You are a professional {request.persona}. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        result = json.loads(response['message']['content'])
        result["audio"] = await tts_service.speak(result["response_text"], request.persona)
        return result
    except Exception as e:
        print(f"Error in negotiation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
