from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json
import os
import tempfile
import shutil
import whisper
from app.services.tts_service import tts_service
from app.services.report_service import report_service
from app.services.evaluator import evaluator
from app.analyzers.speech_analyzer import SpeechAnalyzer

router = APIRouter(prefix="/interview", tags=["Interview"])
stt_model = None
speech_analyzer = SpeechAnalyzer()

def load_stt_model():
    global stt_model
    if stt_model is None:
        stt_model = whisper.load_model("tiny")
    return stt_model

class InitialGreetingRequest(BaseModel):
    student_profile: dict = {}
    sector: str = "General"
    persona: str = "Friendly Mentor"
    prebuilt_questions: list = []
    api_key: str = None

@router.post("/turn")
async def interview_turn(file: UploadFile = File(...), metadata: str = Form(...)):
    try:
        model = load_stt_model()
        meta = json.loads(metadata)
        api_key = meta.get("api_key")
        
        # 1. Transcribe audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name
        
        result = model.transcribe(temp_path)
        user_text = result["text"]
        os.unlink(temp_path)
        
        # 2. Process turn
        prompt = f"Analyze student response: {user_text}. Context: {metadata}"
        # Inject custom model and key if provided
        response = llm_service.chat(
            messages=[{"role": "user", "content": prompt}],
            override_api_key=api_key
        )
        ai_text = response['message']['content']
        
        # 3. Generate Audio
        audio_base64 = await tts_service.speak(ai_text, meta.get("persona", "Friendly Mentor"))
        
        return {
            "text": ai_text,
            "audio": audio_base64,
            "transcript": user_text
        }
    except Exception as e:
        print(f"Turn Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(request: dict):
    try:
        question = request.get("question", "")
        answer = request.get("answer", "")
        api_key = request.get("api_key")
        context = {
            "difficulty": request.get("difficulty", "Intermediate"),
            "sector": request.get("sector", "General"),
            "job_role": request.get("job_role", "Software Engineer")
        }
        
        # We might need to pass api_key to evaluator.evaluate_answer if it uses LLM
        # For now, we'll assume the evaluator service uses internal LLM or we'll update it later
        evaluation = evaluator.evaluate_answer(question, answer, context, api_key=api_key)
        return {"evaluation": evaluation}
    except Exception as e:
        print(f"Error in evaluate-answer: {e}")
        return {"error": str(e)}

@router.post("/generate-report")
async def generate_report_endpoint(request: dict):
    try:
        # Pass api_key to report service if needed
        report = report_service.generate_final_report(request)
        return report
    except Exception as e:
        print(f"Error in generate-report: {e}")
        return {"error": str(e)}

class DeepScanRequest(BaseModel):
    transcript: list
    event_logs: list
    student_profile: dict = None
    sector: str = "General"
    target_company: str = ""
    job_description: str = ""
    api_key: str = None

@router.post("/deep-scan")
async def deep_scan_endpoint(request: DeepScanRequest):
    try:
        transcript_str = "\n".join([f"{msg['role'].upper()}: {msg['text']}" for msg in request.transcript])
        
        prompt = f"""
        Act as a Highly Critical yet Constructive Post-Interview Analysis Engine.
        Perform a "Deep Scan" of the following session.
        Sector: {request.sector}, Company: {request.target_company}
        
        TRANSCRIPT:
        {transcript_str}
        
        Return JSON with line_by_line_feedback, conceptual_mastery, delivery_analysis, and growth_plan.
        """
        response = llm_service.chat(
            messages=[{"role": "user", "content": prompt}], 
            format='json',
            override_api_key=request.api_key
        )
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error in deep-scan: {e}")
        return {"error": str(e)}

@router.post("/initial-greeting")
async def initial_greeting(request: InitialGreetingRequest):
    try:
        profile = request.student_profile or {}
        name = profile.get("fullName") or profile.get("studentName") or "there"
        role = profile.get("jobRole") or profile.get("dreamCompany") or ""
        
        role_mention = f" for {role}" if role else ""
        sector_label = request.sector if request.sector != "General" else "your"
        
        greetings_by_persona = {
            "Friendly Mentor": f"Hi {name}! Welcome to your {sector_label} interview{role_mention}. I'm your AI interviewer today, and I'm here to help you shine. After each question, just speak your answer naturally — I'll move on when you're done. Ready? Let's begin!",
            "Strict Lead": f"Good day, {name}. Welcome to this {sector_label} interview{role_mention}. I'll be evaluating your responses carefully today. Speak clearly after each question — I'll advance when I detect you've finished. Let's proceed.",
            "Stress Tester": f"Welcome, {name}. This is a {sector_label} interview{role_mention}, and I'll be testing your ability to think under pressure. Answer each question as completely as you can — I'll move forward automatically. Let's get started.",
        }
        
        greeting_text = greetings_by_persona.get(
            request.persona,
            f"Hello {name}! Welcome to your {sector_label} interview{role_mention}. I'm your AI interviewer today. Please speak your answer after each question — I'll automatically move on when I detect a pause. Let's get started!"
        )
        
        audio_base64 = await tts_service.speak(greeting_text, request.persona)
        return {"text": greeting_text, "audio_base64": audio_base64}

    except Exception as e:
        print(f"Error in /initial-greeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CompanyReadinessRequest(BaseModel):
    overall_score: float = 0
    sector: str = "General"
    target_company: str = ""
    job_description: str = ""
    ollama_evaluation: dict = {}
    api_key: str = None

@router.post("/company-readiness")
async def company_readiness(request: CompanyReadinessRequest):
    try:
        company = request.target_company.strip() or "a top tech company"
        ev = request.ollama_evaluation

        metrics_text = "\n".join([
            f"- Relevance:              {ev.get('relevance', 0)}/10",
            f"- Technical Correctness:  {ev.get('technicalCorrectness', 0)}/10",
            f"- Clarity & Structure:    {ev.get('clarityStructure', 0)}/10",
            f"- Confidence:             {ev.get('confidence', 0)}/10",
            f"- Communication:          {ev.get('communication', 0)}/10",
            f"- Concept Coverage:       {ev.get('conceptCoverage', 0)}/10",
        ]) if ev else f"- Overall Score: {request.overall_score}/100"

        prompt = f"""You are a senior hiring consultant who has studied the interview culture of {company}.
Based on {company}'s known hiring bar and interview style, evaluate how ready this candidate is.

SCORES:
{metrics_text}
Overall Score: {request.overall_score}/100

Return a single JSON with fitScore (0-100), verdict, companyInsight, and actionPlan (list of 3 steps)."""

        response = llm_service.chat(
            messages=[{"role": "user", "content": prompt}], 
            format="json",
            override_api_key=request.api_key
        )
        return json.loads(response["message"]["content"])
    except Exception as e:
        print(f"Error in /company-readiness: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sarah-chat")
async def sarah_chat(request: dict):
    try:
        convo = request.get("convo", [])
        resume_text = request.get("resume_text", "")
        api_key = request.get("api_key")
        
        system_prompt = f"""You are a warm, professional job interviewer named "Sarah".
        CRITICAL RULES:
        1. Keep every response to 1-2 SHORT sentences only.
        2. NO bullet points, NO lists, NO asterisks, NO markdown.
        3. Natural conversational language.
        4. Acknowledge the candidate's answer in ONE sentence, then ask ONE question.
        5. MANDATORY: Base EVERY question directly on their CV details.
        
        CV CONTENT:
        {resume_text[:2000]}"""
        
        messages = [{"role": "system", "content": system_prompt}]
        for m in convo:
            role = m.get("role", "user")
            if role == "mentor":
                role = "assistant"
            messages.append({"role": role, "content": m.get("text", "")})
            
        response = llm_service.chat(
            messages=messages, 
            options={"temperature": 0.7},
            override_api_key=api_key
        )
        return {"reply": response['message']['content']}
    except Exception as e:
        print(f"Sarah Chat Error: {e}")
        return {"reply": "I see. Could you elaborate more on your experience in that area?"}

@router.post("/evaluate-full")
async def evaluate_interview_full(request: dict):
    try:
        transcript = request.get("transcript", [])
        student_profile = request.get("student_profile", {})
        sector = request.get("sector", "General")
        api_key = request.get("api_key")
        
        # This calls the internal evaluator service for a comprehensive review
        # We'll assume report_service will be updated or already supports it via underlying LLM calls
        analysis = report_service.generate_final_report(transcript, student_profile, sector)
        return analysis
    except Exception as e:
        print(f"Full Eval Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-speech")
async def analyze_speech_endpoint(request: dict):
    # This one doesn't use LLM directly, so it's fine for now.
    try:
        transcript_text = request.get("transcript_text", "")
        duration_seconds = request.get("duration_seconds", 0)
        audio_features = request.get("audio_features", {})
        
        filler_analysis = speech_analyzer.detect_filler_words(transcript_text)
        pace_analysis = speech_analyzer.calculate_speaking_pace(
            transcript_text, duration_seconds
        ) if duration_seconds > 0 else {"wpm": 0, "rating": "unknown"}
        confidence_analysis = speech_analyzer.analyze_confidence(
            audio_features, transcript_text
        )
        clarity_analysis = speech_analyzer.measure_clarity(
            transcript_text, audio_features
        )

        return {
            "confidence": confidence_analysis,
            "pace": pace_analysis,
            "filler_words": filler_analysis,
            "clarity": clarity_analysis,
            "emotions": audio_features.get("emotions", []),
            "stress_level": audio_features.get("stress_level", "unknown"),
        }
    except Exception as e:
        print(f"Speech Analysis Error: {e}")
        return {"error": str(e)}
