import PyPDF2
from io import BytesIO

def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

import os
import json
from app.services.llm_service import llm_service

MODEL_NAME = "llama3.1:8b"

def parse_resume_content(text: str):
    try:
        response = llm_service.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a professional resume parser. Extract structured data from the resume text and return it as JSON."},
            {"role": "user", "content": f"Extract the following fields: skills, projects, internships, tools, certifications, and achievements from this resume text:\n\n{text}"}
        ], format='json')
        
        parsed_data = json.loads(response['message']['content'])
        return parsed_data
    except Exception as e:
        print(f"Error parsing resume with AI: {e}")
        return {
            "skills": [],
            "projects": [],
            "internships": [],
            "tools": [],
            "certifications": [],
            "achievements": []
        }
