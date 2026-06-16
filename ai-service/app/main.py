from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
import time
import threading
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Global state
_ai_ready = False
_startup_time = time.time()
MODEL_NAME = os.getenv("NVIDIA_MODEL", "openai/gpt-oss-120b")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ai_ready
    # Defer heavy model imports slightly to allow uvicorn to bind to port faster
    print(f"\n🚀 NVIDIA AI Service Bootstrap Initiated")
    
    def background_warmup():
        global _ai_ready
        try:
            from app.services.llm_service import llm_service
            from app.api.interview import load_stt_model
            
            print(f"   [SYNC] Performing NVIDIA Handshake...")
            llm_service.chat(messages=[{"role": "user", "content": "hi"}], options={"max_tokens": 1})
            _ai_ready = True
            print(f"   [SUCCESS] AI Service fully functional (Model: {MODEL_NAME})")
            
            print("   [SYNC] Preloading Whisper STT (Tiny)...")
            load_stt_model()
            print("   [SUCCESS] Speech components ready.")
        except Exception as e:
            print(f"   [ERROR] Warmup failed: {e}")

    threading.Thread(target=background_warmup, daemon=True).start()
    yield
    print("\n🛑 AI Service Terminated.")

# Instantiate App
app = FastAPI(title="NVIDIA AI Interviewer", lifespan=lifespan)

# Standard Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Priority Routes (Define first for fastest health) ─────────────────
@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    """Ultra-light health ping for start_all.bat"""
    return {
        "status": "online",
        "ready": _ai_ready,
        "uptime": f"{int(time.time() - _startup_time)}s",
        "model": MODEL_NAME
    }

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"service": "NVIDIA AI Interviewer", "status": "active"}

# ─── Modular Routers (Include the rest) ───────────────────────────────
# We'll import these inside the lifespan or just ensure uvicorn is fast.
# In FastAPI, routers are usually defined at startup, so we'll keep them here
# but ensure the health endpoint is above them.

from app.api.reports import router as reports_router
from app.api.resume import router as resume_router
from app.api.interview import router as interview_router
from app.api.onsite import router as onsite_router
from app.api.speak import router as speak_router
from app.api.stt import router as stt_router
from app.api.negotiation import router as negotiation_router
from app.api.technical import router as technical_router
from app.api.adaptive import router as adaptive_router
from app.endpoints_coding import router as coding_router
from app.api.gesture import router as gesture_router
from app.api.mentor import router as mentor_router
from app.api.quiz import router as quiz_router
from app.api.project_builder import router as project_builder_router

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(reports_router) # New analytics endpoint
app.include_router(onsite_router)
app.include_router(speak_router)
app.include_router(stt_router)
app.include_router(negotiation_router)
app.include_router(technical_router)
app.include_router(adaptive_router)
app.include_router(coding_router)
app.include_router(gesture_router)
app.include_router(mentor_router)
app.include_router(quiz_router)
app.include_router(project_builder_router)

@app.get("/favicon.ico")
async def favicon():
    return Response(content=b"", media_type="image/x-icon")

@app.get("/health/deep")
async def health_deep():
    """Confirm NVIDIA reachability."""
    from app.services.llm_service import llm_service
    try:
        await llm_service.chat_async(messages=[{"role": "user", "content": "1+1"}], options={"max_tokens":1})
        return {"status": "healthy", "nvidia": "reachable"}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    # We use workers=1 for dev stability on Windows
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
