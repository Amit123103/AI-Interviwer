from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import re
from app.services.llm_service import llm_service

router = APIRouter(prefix="/project-builder", tags=["Project Builder Core"])

class GenerateProjectRequest(BaseModel):
    category: str
    language: str
    projectIdea: str
    stack: str = ""
    skillLevel: str = "Beginner"

class ValidateModuleRequest(BaseModel):
    studentCode: str
    solutionCode: str
    language: str
    moduleContext: str

class GenerateHintRequest(BaseModel):
    studentCode: str
    language: str
    moduleContext: str
    progressionLevel: int # 1, 2, or 3

def extract_json(resp: str) -> str:
    """Robustly extract JSON block from markdown response."""
    # Try finding markdown code block
    json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", resp, re.DOTALL)
    if json_match:
        return json_match.group(1)
    
    # Try finding the first { and last }
    bracket_match = re.search(r"(\{.*\})", resp, re.DOTALL)
    if bracket_match:
        return bracket_match.group(1)
        
    return resp.strip()

@router.post("/generate")
async def generate_project_curriculum(request: GenerateProjectRequest):
    try:
        system_prompt = """You are an expert coding instructor and curriculum designer. 
Generate a comprehensive, step-by-step project learning curriculum.
CRITICAL: You MUST return valid JSON ONLY. No text before or after the JSON.

JSON Schema:
{
  "projectTitle": "string",
  "language": "string",
  "stack": "string",
  "category": "string",
  "difficulty": "string",
  "estimatedTotalHours": number,
  "description": "string",
  "learningOutcomes": ["string"],
  "prerequisites": ["string"],
  "fileStructure": [{ "path": "string", "description": "string" }],
  "modules": [
    {
      "moduleNumber": number,
      "title": "string",
      "estimatedMinutes": number,
      "conceptsCovered": ["string"],
      "objectives": ["string"],
      "lessonContent": "string (Detailed markdown with code examples)",
      "realWorldAnalogy": "string",
      "steps": [{ "stepNumber": number, "title": "string", "instruction": "string" }],
      "starterCode": [{ "filename": "string", "code": "string", "language": "string" }],
      "solutionCode": [{ "filename": "string", "code": "string", "language": "string" }],
      "expectedOutput": "string",
      "hints": ["vague hint", "technical hint", "near solution hint"],
      "miniChallenge": "optional challenge description"
    }
  ],
  "finalProjectCode": [{ "filename": "string", "code": "string", "language": "string" }],
  "runInstructions": {
    "windows": ["string"],
    "macLinux": ["string"],
    "vscode": { "extensions": ["string"], "steps": ["string"] }
  },
  "readmeContent": "string (Markdown)"
}"""

        user_message = f"Category: {request.category}\nLanguage: {request.language}\nStack: {request.stack}\nProject Idea: {request.projectIdea}\nSkill Level: {request.skillLevel}\n\nGenerate the complete structured curriculum for this project."

        response = await llm_service.chat_async(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            format="json",
            options={"temperature": 0.7, "max_tokens": 8000}
        )

        content = response["message"]["content"]
        return json.loads(extract_json(content))

    except Exception as e:
        print(f"[ProjectBuilder] Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-module")
async def validate_module(request: ValidateModuleRequest):
    try:
        system_prompt = """You are a strict but fair code validator. 
Determine if the student successfully implemented the logic described in the module context.
Ignore stylistic differences. Focus on functional correctness.
Return ONLY JSON:
{
  "passed": boolean,
  "feedback": "string",
  "missingParts": ["string"]
}"""

        user_message = f"Language: {request.language}\nModule Context: {request.moduleContext}\n\n--- SOLUTION CODE ---\n{request.solutionCode}\n\n--- STUDENT CODE ---\n{request.studentCode}"

        response = await llm_service.chat_async(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            format="json",
            options={"temperature": 0.2, "max_tokens": 1000}
        )

        return json.loads(extract_json(response["message"]["content"]))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hint")
async def generate_hint(request: GenerateHintRequest):
    try:
        system_prompt = """You are an encouraging coding tutor.
Provide a progressive hint based on the level requested (1=concept, 2=technical, 3=near solution).
Return ONLY JSON:
{
  "hint": "string",
  "progressiveLevel": number
}"""

        user_message = f"Language: {request.language}\nModule Context: {request.moduleContext}\nLevel Requested: {request.progressionLevel}\n\n--- STUDENT CODE ---\n{request.studentCode}"

        response = await llm_service.chat_async(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            format="json",
            options={"temperature": 0.5, "max_tokens": 500}
        )

        return json.loads(extract_json(response["message"]["content"]))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
