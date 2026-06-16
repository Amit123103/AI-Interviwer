from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.behavioral_analyzer import behavioral_analyzer

router = APIRouter(tags=["Reports"])

@router.post("/analyze-frame")
@router.post("/reports/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Receives an image frame from the interviewer and returns behavioral metrics.
    Used for real-time engagement and posture tracking.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        frame_bytes = await file.read()
        metrics = behavioral_analyzer.analyze_frame(frame_bytes)
        return metrics
    except Exception as e:
        print(f"Error in analyze-frame endpoint: {e}")
        return {
            "emotion": "Neutral",
            "attention_score": 100,
            "looking_away": False,
            "engagement_score": 80,
            "error": str(e)
        }
