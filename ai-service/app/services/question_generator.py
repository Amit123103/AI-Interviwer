from app.services.llm_service import llm_service
import json
import logging

logger = logging.getLogger(__name__)

# Reusing the global model name if possible, or define here
MODEL_NAME = "llama3.1:8b" 

def generate_coding_questions(resume_text: str, count: int = 3, difficulty: str = "Medium", topic: str = "General") -> list:
    """
    Generates a list of coding questions based on the resume and parameters.
    Returns: List of dicts { title, description, difficulty, starterCode, testCases, tags }
    """
    
    prompt = f"""
    You are a Senior Technical Interviewer creating a coding assessment.
    
    CANDIDATE CONTEXT:
    Resume Summary: {resume_text[:2000]}...
    Target Difficulty: {difficulty}
    Target Topic: {topic}
    
    TASK:
    Generate {count} unique coding questions.
    - If the user has a specific stack (e.g., Python/Django), try to include 1 relevant practical question.
    - Otherwise, focus on Data Structures & Algorithms suitable for the difficulty level.
    - Ensure questions are distinct from each other.
    
    OUTPUT FORMAT (JSON ARRAY ONLY):
    [
        {{
            "title": "Problem Title",
            "slug": "url-friendly-slug-unique",
            "description": "Markdown description of the problem. Include examples.",
            "difficulty": "{difficulty}",
            "tags": ["Array", "HashMap"],
            "starterCode": {{
                "python": "def solve():\\n    pass",
                "javascript": "function solve() {{}}"
            }},
            "testCases": [
                {{ "input": "arg1", "output": "expected1", "isHidden": false, "explanation": "Case 1" }},
                {{ "input": "arg2", "output": "expected2", "isHidden": true }}
            ]
        }}
    ]
    """
    
    try:
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a Coding Interview Question Generator. Output valid JSON array only. No Markdown formatting around the JSON."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        content = response['message']['content']
        questions = json.loads(content)
        
        # Validate/Patch structure if needed
        if isinstance(questions, dict) and 'questions' in questions:
            questions = questions['questions']
            
        return questions
        
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        # Fallback question if LLM fails
        return [{
            "title": "Reverse a String",
            "slug": "reverse-string-fallback",
            "description": "Write a function that reverses a string. The input string is given as an array of characters.",
            "difficulty": "Easy",
            "tags": ["String"],
            "starterCode": {
                "python": "def reverseString(s):\n    pass",
                "javascript": "var reverseString = function(s) {\n};"
            },
            "testCases": [
                { "input": "\"hello\"", "output": "\"olleh\"", "isHidden": false }
            ]
        }]
