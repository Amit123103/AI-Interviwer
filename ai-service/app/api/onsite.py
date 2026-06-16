from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json
import base64
import io
import os
import edge_tts

router = APIRouter(prefix="/onsite", tags=["Onsite"])
MODEL_NAME = os.getenv("NVIDIA_MODEL") or os.getenv("OLLAMA_MODEL") or "llama3.1:8b"

class OnsiteInteractionRequest(BaseModel):
    user_id: str
    round_id: str
    company: str
    round_type: str
    history: list
    user_input: str
    context: str = ""

@router.post("/chat")
async def onsite_chat(request: OnsiteInteractionRequest):
    try:
        persona_map = {
            "coding": "Senior Staff Engineer",
            "system-design": "Principal Architect",
            "behavioral": "Hiring Manager"
        }
        persona = persona_map.get(request.round_type, "Interviewer")
        
        system_prompt = f"You are a {persona} at {request.company}. Conduct a {request.round_type} interview. Be concise one question at a time."
        
        messages = [{"role": "system", "content": system_prompt}] + request.history + [{"role": "user", "content": request.user_input}]
        response = llm_service.chat(model=MODEL_NAME, messages=messages)
        ai_text = response['message']['content']
        
        voice = "en-US-EmmaNeural"
        communicate = edge_tts.Communicate(ai_text, voice)
        mp3_fp = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_fp.write(chunk["data"])
        
        return {
            "text": ai_text,
            "audio": base64.b64encode(mp3_fp.getvalue()).decode(),
        }
    except Exception as e:
        print(f"Error in onsite-chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class OnsiteDecisionRequest(BaseModel):
    reports: list
    company: str
    role: str

@router.post("/decision")
async def generate_onsite_decision(request: OnsiteDecisionRequest):
    try:
        context_str = json.dumps(request.reports)
        prompt = f"Act as Hiring Committee at {request.company}. Decisions based on reports: {context_str}"
        response = llm_service.chat(model=MODEL_NAME, messages=[{"role": "user", "content": prompt}], format='json')
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error in onsite-decision: {e}")
        raise HTTPException(status_code=500, detail=str(e))
