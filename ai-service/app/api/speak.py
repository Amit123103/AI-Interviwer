from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import edge_tts
import io
import base64

router = APIRouter(prefix="/speak", tags=["TTS"])

class SpeakRequest(BaseModel):
    text: str
    persona: str = "Friendly Mentor"
    voice: str = ""  # "Male" or "Female" — overrides persona-based voice
    api_key: str = None

@router.post("")
async def speak(request: SpeakRequest):
    try:
        # User's explicit voice choice takes priority
        if request.voice.lower() == "male":
            voice = "en-GB-RyanNeural"
        elif request.voice.lower() == "female":
            voice = "en-US-EmmaNeural"
        else:
            # Fallback to persona-based mapping
            voice_map = {
                "Friendly Mentor": "en-US-EmmaNeural",
                "Strict Lead": "en-GB-RyanNeural",
                "Stress Tester": "en-US-GuyNeural"
            }
            voice = voice_map.get(request.persona, "en-US-EmmaNeural")
        
        communicate = edge_tts.Communicate(request.text, voice)
        mp3_fp = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_fp.write(chunk["data"])
        
        audio_base64 = base64.b64encode(mp3_fp.getvalue()).decode('utf-8')
        return {"audio_base64": audio_base64, "text": request.text}
    except Exception as e:
        print(f"Error in /speak: {e}")
        raise HTTPException(status_code=500, detail=str(e))
