from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service

router = APIRouter(prefix="/mentor", tags=["Mentor Core"])

class MentorChatRequest(BaseModel):
    convo: list
    resume_text: str = ""
    api_key: str = None

@router.post("/chat")
async def mentor_chat(request: MentorChatRequest):
    try:
        # Construct the conversation history
        # We use a system prompt that enforces the "Perfect & Professional" tone requested by the user
        system_prompt = f"""You are 'Sarah', a world-class AI Career Mentor and Placement Strategist.
        
        YOUR PERSONALITY:
        - Highly Professional yet deeply encouraging.
        - Strategic: You provide advanced technical and career roadmaps.
        - Strategic Depth: You use high reasoning effort to analyze technical challenges.
        - Concise: No fluff. Give actionable steps.

        NVIDIA POWERED:
        You are powered by NVIDIA NIM (Mistral Small 119B). You are extremely intelligent and analytical.

        CONTEXT:
        USER CV/BACKGROUND: {request.resume_text[:2000]}
        
        GOAL: Make the user 'Tech Placement' ready with strategic precision.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        for m in request.convo:
            role = m.get("role", "user")
            if role == "mentor":
                role = "assistant"
            
            # Handle both 'content' and 'text' keys from various frontend implementations
            content = m.get("content") or m.get("text", "")
            
            messages.append({
                "role": role, 
                "content": content
            })
            
        # Using exact parameters requested for Mistral Small 119B with optional override
        response = await llm_service.chat_async(
            messages=messages, 
            options={
                "temperature": 0.10, 
                "max_tokens": 16384,
                "reasoning_effort": "high"
            },
            override_api_key=request.api_key
        )
        
        return {"reply": response['message']['content']}
    except Exception as e:
        print(f"[MentorAPI] Error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Sarah is temporarily unavailable, but she'll be back to guide you shortly."
        )
