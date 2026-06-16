
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import llm_service
import json

router = APIRouter()
MODEL_NAME = "llama3.1:8b"

class HintRequest(BaseModel):
    problem_title: str
    problem_description: str
    user_code: str
    language: str

class AnalyzeRequest(BaseModel):
    problem_title: str
    user_code: str
    language: str

@router.post("/coding/hint")
async def generate_coding_hint(request: HintRequest):
    try:
        prompt = f"""
        You are an expert Coding Tutor. The student is solving the problem "{request.problem_title}".
        
        PROBLEM DESCRIPTION:
        {request.problem_description[:1000]}...
        
        STUDENT'S CURRENT CODE ({request.language}):
        {request.user_code}
        
        TASK:
        Provide a helpful, progressive hint. 
        - Do NOT reveal the full solution.
        - Do NOT write code. 
        - Use the Socratic method: Ask a guiding question or point out a logic flaw/edge case they might have missed.
        - If the code is empty, suggest a starting approach (e.g., "Think about using a Hash Map here...").
        - Keep it brief (2-3 sentences max).
        """
        
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a helpful Coding Tutor. Give brief, guiding hints without spoiling the answer."},
            {"role": "user", "content": prompt}
        ])
        
        return {"hint": response['message']['content']}
    except Exception as e:
        print(f"Error generating coding hint: {e}")
        return {"error": str(e)}

@router.post("/coding/analyze")
async def analyze_code(request: AnalyzeRequest):
    try:
        prompt = f"""
        Analyze the following {request.language} code for the problem "{request.problem_title}".
        
        CODE:
        {request.user_code}
        
        TASK:
        1. Determine Time Complexity (Big O).
        2. Determine Space Complexity (Big O).
        3. Identify 1-2 clean code improvements (variable naming, modularity, etc.).
        
        Return JSON format:
        {{
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)",
            "improvements": ["Suggestion 1", "Suggestion 2"],
            "rating": "Good/Average/Needs Improvement"
        }}
        """
        
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a Senior Software Engineer conducting Code Review. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error analyzing code: {e}")
        # Fallback in case of JSON parse error or LLM failure
        return {
            "timeComplexity": "Unknown",
            "spaceComplexity": "Unknown",
            "improvements": ["Could not analyze code structure."],
            "rating": "Unknown"
        }

class AutoFixRequest(BaseModel):
    problem_title: str
    user_code: str
    language: str
    error_message: str = ""

@router.post("/coding/autofix")
async def auto_fix_code(request: AutoFixRequest):
    """AI suggests specific code fixes and optimizations."""
    try:
        prompt = f"""
        You are an expert {request.language} developer and code optimizer.
        
        PROBLEM: "{request.problem_title}"
        
        STUDENT'S CODE ({request.language}):
        ```
        {request.user_code}
        ```
        
        {f'ERROR: {request.error_message}' if request.error_message else ''}
        
        TASK:
        Analyze this code and suggest concrete fixes and optimizations.
        
        Return JSON format:
        {{
            "fixes": [
                {{
                    "type": "bug" | "optimization" | "style",
                    "line": "approximate line or code snippet",
                    "issue": "What's wrong",
                    "suggestion": "How to fix it",
                    "improvedCode": "The corrected code snippet (just the relevant part)"
                }}
            ],
            "overallScore": 1-10,
            "summary": "One line summary of code quality"
        }}
        
        Keep fixes practical and specific. Max 3 fixes.
        """
        
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a Senior Code Reviewer. Output valid JSON only with concrete, actionable fixes."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error in auto-fix: {e}")
        return {
            "fixes": [],
            "overallScore": 0,
            "summary": "Could not analyze code."
        }

class EdgeCaseRequest(BaseModel):
    problem_title: str
    problem_description: str = ""
    user_code: str
    language: str

@router.post("/coding/edge-cases")
async def generate_edge_cases(request: EdgeCaseRequest):
    """AI generates tricky edge-case test inputs for the given problem."""
    try:
        prompt = f"""
        You are an expert competitive programmer and test engineer.
        
        PROBLEM: "{request.problem_title}"
        {f'DESCRIPTION: {request.problem_description[:500]}' if request.problem_description else ''}
        
        STUDENT'S CODE ({request.language}):
        ```
        {request.user_code}
        ```
        
        TASK:
        Generate 3-5 tricky edge-case test inputs that might break this solution.
        Think about: empty inputs, single elements, duplicates, negative numbers, 
        maximum/minimum values, sorted/reverse-sorted arrays, etc.
        
        Return JSON format:
        {{
            "edgeCases": [
                {{
                    "input": "The test input (e.g., nums = [1], target = 1)",
                    "expectedBehavior": "What should happen",
                    "whyTricky": "Why this case is important to test"
                }}
            ],
            "vulnerabilities": ["List of potential weaknesses in the code"]
        }}
        """
        
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a QA Engineer specializing in edge cases. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error generating edge cases: {e}")
        return {
            "edgeCases": [],
            "vulnerabilities": ["Could not analyze code for edge cases."]
        }

