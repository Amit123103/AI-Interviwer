"""
Resume Intelligence Service
Deep resume analysis for personalized interview question generation.
Extracts structured profile data, technical pillars, and generates
targeted questions based on skills, projects, education, and experience.
"""

import re
import os
import json
from app.services.llm_service import llm_service

MODEL_NAME = os.getenv("NVIDIA_MODEL") or os.getenv("OLLAMA_MODEL") or "llama3.1:8b"


from app.services.vector_store import vector_manager

class ResumeIntelligence:
    """Extracts structured data from resumes and generates personalized questions using RAG."""

    # Common tech skills for keyword matching fallback
    TECH_SKILLS = {
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
        'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
        'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django',
        'flask', 'spring', 'fastapi', 'rails',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
        'git', 'ci/cd', 'jenkins', 'github actions', 'linux',
        'rest api', 'graphql', 'microservices', 'system design',
        'machine learning', 'deep learning', 'nlp', 'computer vision',
        'data structures', 'algorithms', 'agile', 'scrum'
    }

    EXPERIENCE_KEYWORDS = {
        'intern': 'Intern',
        'internship': 'Intern',
        'junior': 'Junior',
        'associate': 'Junior',
        'mid': 'Mid-level',
        'senior': 'Senior',
        'lead': 'Senior',
        'principal': 'Senior',
        'staff': 'Senior',
        'architect': 'Senior',
        'manager': 'Senior',
        'director': 'Senior',
        'vp': 'Senior',
        'fresher': 'Intern',
        'entry level': 'Junior',
        'entry-level': 'Junior',
    }

    def _clean_json(self, response_text: str) -> dict:
        """Robustly parse JSON from LLM response, handling markdown blocks."""
        try:
            # Try direct parse
            return json.loads(response_text)
        except json.JSONDecodeError:
            try:
                # Extract from markdown code block
                match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
                if match:
                    return json.loads(match.group(1))
                
                # Try finding first { and last }
                start = response_text.find('{')
                end = response_text.rfind('}')
                if start != -1 and end != -1:
                    return json.loads(response_text[start:end+1])
            except Exception as e:
                print(f"Failed to clean/parse JSON: {e}")
            
            return {}

    def extract_skills_from_text(self, text: str) -> list:
        """Fast keyword-based skill extraction (no LLM needed)."""
        text_lower = text.lower()
        found = []
        for skill in self.TECH_SKILLS:
            if skill in text_lower:
                found.append(skill.title() if len(skill) > 3 else skill.upper())
        return found[:15]  # Cap at 15

    def detect_experience_level(self, text: str) -> str:
        """Quick experience level detection from resume text."""
        text_lower = text.lower()
        for keyword, level in self.EXPERIENCE_KEYWORDS.items():
            if keyword in text_lower:
                return level

        # Heuristic: count years mentioned
        years = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)', text_lower)
        if years:
            max_years = max(int(y) for y in years)
            if max_years >= 7:
                return 'Senior'
            elif max_years >= 3:
                return 'Mid-level'
            elif max_years >= 1:
                return 'Junior'
        return 'Mid-level'

    def extract_projects(self, text: str) -> list:
        """Extract project names and descriptions from resume text."""
        projects = []
        # Look for common project section patterns
        project_patterns = [
            r'(?:project|projects)\s*[:\-–]\s*(.+?)(?:\n\n|\Z)',
            r'(?:^|\n)([A-Z][A-Za-z\s]+?)\s*[\-–|]\s*(.+?)(?:\n|$)',
        ]
        
        lines = text.split('\n')
        in_project_section = False
        current_project = None
        
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                in_project_section = False
                continue
            
            if re.match(r'(?i)(projects?|personal projects?|key projects?|notable projects?)', line_stripped):
                in_project_section = True
                continue
            
            if in_project_section and line_stripped:
                # Look for project title patterns
                match = re.match(r'^[•\-\*]\s*(.+?)(?:\s*[\-–|:]\s*(.+))?$', line_stripped)
                if match:
                    projects.append({
                        'name': match.group(1).strip(),
                        'description': (match.group(2) or '').strip()
                    })
                elif len(line_stripped) < 80 and not line_stripped.startswith((' ', '\t')):
                    projects.append({'name': line_stripped, 'description': ''})
        
        return projects[:5]  # Cap at 5 projects

    def analyze_resume_deep(self, resume_text: str, job_role: str = "", target_company: str = "", api_key: str = None) -> dict:
        """
        Deep resume analysis using LLM.
        Returns structured profile with skills, projects, education, experience.
        """
        if not resume_text or len(resume_text.strip()) < 20:
            return self._empty_analysis()

        # Fast extraction first (no LLM)
        quick_skills = self.extract_skills_from_text(resume_text)
        experience_level = self.detect_experience_level(resume_text)
        projects = self.extract_projects(resume_text)

        # LLM-powered deep analysis
        try:
            # Use RAG to get relevant context
            context = ""
            if vector_manager.vector_db:
                relevant_docs = vector_manager.query(f"technical pillars for {job_role or 'software engineering'} roles", k=5)
                context = "\n".join([doc.page_content for doc in relevant_docs])
            else:
                context = resume_text[:2500]

            prompt = f"""Extract vitals and focus areas from this resume.
RESUME EXCERPT:
{context}

ROLE: {job_role or 'Engineer'}
COMPANY: {target_company or 'General'}

INSTRUCTIONS FOR STUDENTS:
- If this is a student, highlight University Projects, Hackathons, and GPA.
- Prioritize technical core competencies over professional history if experience is limited.

Return JSON:
{{
    "technical_pillars": ["Top 3 specialties"],
    "key_skills": ["Top 8 skills"],
    "projects": [
        {{"name": "Project Name", "tech_stack": ["techs"], "impact": "Brief impact", "complexity": "E/M/H"}}
    ],
    "experience_summary": "1 sentence narrative",
    "education": "University & Degree",
    "gpa": "If found",
    "strengths": ["3 strengths"],
    "level": "Fresher/Junior/Mid/Senior",
    "question_focus_areas": ["5 interview topics"]
}}"""

            response = llm_service.chat(
                messages=[
                    {"role": "system", "content": "You are a fast Resume Parser. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                format='json',
                options={"num_predict": 400, "temperature": 0.1},
                override_api_key=api_key
            )

            llm_analysis = self._clean_json(response['message']['content'])

            return {
                "technical_pillars": llm_analysis.get("technical_pillars", quick_skills[:3]),
                "key_skills": llm_analysis.get("key_skills", quick_skills),
                "projects": llm_analysis.get("projects", [{"name": p['name'], "tech_stack": [], "impact": p['description'], "complexity": "Medium"} for p in projects]),
                "experience_summary": llm_analysis.get("experience_summary", ""),
                "education": llm_analysis.get("education", ""),
                "strengths": llm_analysis.get("strengths", []),
                "gaps": llm_analysis.get("gaps", []),
                "level": llm_analysis.get("level", experience_level),
                "question_focus_areas": llm_analysis.get("question_focus_areas", []),
                "quick_skills": quick_skills,  # Always include fast-extracted skills
            }

        except Exception as e:
            print(f"LLM resume analysis failed: {e}")
            return {
                "technical_pillars": quick_skills[:3] if quick_skills else ["General Software Engineering"],
                "key_skills": quick_skills,
                "projects": [{"name": p['name'], "tech_stack": [], "impact": p['description'], "complexity": "Medium"} for p in projects],
                "experience_summary": "",
                "education": "",
                "strengths": [],
                "gaps": [],
                "level": experience_level,
                "question_focus_areas": quick_skills[:5],
                "quick_skills": quick_skills,
            }

    def _empty_analysis(self) -> dict:
        return {
            "technical_pillars": ["General Software Engineering"],
            "key_skills": [],
            "projects": [],
            "experience_summary": "",
            "education": "",
            "strengths": [],
            "gaps": [],
            "level": "Mid-level",
            "question_focus_areas": [],
            "quick_skills": [],
        }

    def generate_personalized_questions(
        self,
        resume_analysis: dict,
        total_questions: int = 7,
        difficulty: str = "Intermediate",
        sector: str = "General",
        persona: str = "Friendly Mentor",
        job_description: str = "",
        target_company: str = "",
        interview_type: str = "Mixed",
        api_key: str = None
    ) -> dict:
        """
        Generate personalized interview questions with metadata.
        Each question includes category, difficulty, and follow-up seeds.
        """
        pillars = resume_analysis.get("technical_pillars", ["General"])
        skills = resume_analysis.get("key_skills", [])
        projects = resume_analysis.get("projects", [])
        level = resume_analysis.get("level", "Mid-level")
        gaps = resume_analysis.get("gaps", [])
        focus_areas = resume_analysis.get("question_focus_areas", [])

        # Build question distribution
        distribution = self._get_question_distribution(total_questions, interview_type)

        # Check if we are in "Instant Mode" (no resume data)
        is_instant = not skills and not projects
        
        if is_instant:
            # specialized prompt for Role-based instant interview
            prompt = f"""Generate exactly {total_questions} interview questions for a {difficulty} level {sector} role.
            
ROLE: {sector}
DIFFICULTY: {difficulty}
TYPE: {interview_type}

RULES:
1. Return exactly {total_questions} questions.
2. Mix technical, behavioral, and situational questions.
3. Include 2 brief follow-up seeds for each.
4. Output valid JSON only.

OUTPUT FORMAT:
{{
    "questions": [
        {{
            "text": "The interview question?",
            "category": "technical|behavioral|situational",
            "difficulty": "{difficulty}",
            "followup_seeds": ["followup 1", "followup 2"]
        }}
    ]
}}"""
        else:
            prompt = f"""Generate exactly {total_questions} interview questions based on this profile.

PROFILE:
- Level: {level}
- Education: {resume_analysis.get('education', 'N/A')}
- Pillars: {', '.join(pillars)}
- Skills: {', '.join(skills[:8])}
- Projects: {json.dumps(projects[:2], indent=1)}
- Focus: {', '.join(focus_areas[:5])}

CONTEXT:
- Company/Goal: {target_company or 'Tech Recruiter'}
- Type: {interview_type}
- Difficulty: {difficulty}

SPECIAL INSTRUCTIONS FOR STUDENT INTERVIEW:
- If level is Fresher or Junior, ask deep conceptual questions about their core skills.
- Ask at least one question specifically referencing a project mentioned above.
- Be encouraging but rigorous.

RULES:
1. Return exactly {total_questions} questions.
2. Questions must be specific to the projects and skills mentioned.
3. Include 2 brief follow-up seeds for each.
4. Output valid JSON only.

OUTPUT FORMAT:
{{
    "questions": [
        {{
            "text": "Main question?",
            "category": "technical|project|behavioral",
            "difficulty": "Easy|Medium|Hard",
            "followup_seeds": ["followup 1", "followup 2"]
        }}
    ]
}}"""

        try:
            response = llm_service.chat(
                messages=[
                    {"role": "system", "content": "You are a professional interviewer. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                format='json',
                options={"num_predict": 800, "temperature": 0.2},
                override_api_key=api_key
            )


            result = self._clean_json(response['message']['content'])
            questions = result.get("questions", [])

            # Ensure we have the right number
            if len(questions) < total_questions:
                # Pad with generic questions
                generic = self._get_generic_questions(total_questions - len(questions), skills, level)
                questions.extend(generic)

            return {
                "questions": questions[:total_questions],
                "resume_analysis": {
                    "level": level,
                    "pillars": pillars,
                    "skills_detected": len(skills),
                    "projects_found": len(projects),
                }
            }

        except Exception as e:
            print(f"Question generation failed: {e}")
            return {
                "questions": self._get_generic_questions(total_questions, skills, level),
                "resume_analysis": {
                    "level": level,
                    "pillars": pillars,
                    "skills_detected": len(skills),
                    "projects_found": len(projects),
                }
            }

    def _get_question_distribution(self, total: int, interview_type: str) -> dict:
        """Calculate how many questions of each type to generate."""
        if interview_type == "Technical":
            return {
                "technical": max(1, int(total * 0.4)),
                "project": max(1, int(total * 0.3)),
                "problem_solving": max(1, int(total * 0.2)),
                "behavioral": max(0, total - int(total * 0.4) - int(total * 0.3) - int(total * 0.2))
            }
        elif interview_type == "HR & Behavioral":
            return {
                "behavioral": max(1, int(total * 0.5)),
                "project": max(1, int(total * 0.2)),
                "problem_solving": max(1, int(total * 0.2)),
                "technical": max(0, total - int(total * 0.5) - int(total * 0.2) - int(total * 0.2))
            }
        else:  # Mixed
            return {
                "technical": max(1, int(total * 0.3)),
                "project": max(1, int(total * 0.25)),
                "behavioral": max(1, int(total * 0.25)),
                "problem_solving": max(0, total - int(total * 0.3) - int(total * 0.25) - int(total * 0.25))
            }

    def _get_generic_questions(self, count: int, skills: list, level: str) -> list:
        """Fallback generic questions with metadata."""
        pool = [
            {
                "text": "Could you introduce yourself and walk me through your background?",
                "category": "behavioral",
                "difficulty": "Easy",
                "expected_depth": "Moderate",
                "followup_seeds": ["What motivated you to pursue this career path?", "What's the most impactful project you've worked on?"],
                "evaluation_criteria": "Clear narrative, relevant highlights, good communication"
            },
            {
                "text": f"Tell me about your experience with {skills[0] if skills else 'your primary technology'}. How have you used it in production?",
                "category": "technical",
                "difficulty": "Medium",
                "expected_depth": "Deep",
                "followup_seeds": ["What challenges did you face?", "How would you do it differently now?"],
                "evaluation_criteria": "Practical knowledge, real-world application"
            },
            {
                "text": "Describe a technically challenging problem you solved. Walk me through your approach.",
                "category": "problem_solving",
                "difficulty": "Medium",
                "expected_depth": "Deep",
                "followup_seeds": ["What alternatives did you consider?", "How did you validate your solution?"],
                "evaluation_criteria": "Problem decomposition, systematic thinking, trade-off analysis"
            },
            {
                "text": "Tell me about a project that didn't go as planned. What happened and what did you learn?",
                "category": "behavioral",
                "difficulty": "Medium",
                "expected_depth": "Moderate",
                "followup_seeds": ["How did it affect your approach to future projects?", "What would you do differently?"],
                "evaluation_criteria": "Self-awareness, learning ability, honesty"
            },
            {
                "text": "How do you approach debugging a complex issue in production?",
                "category": "problem_solving",
                "difficulty": "Medium",
                "expected_depth": "Deep",
                "followup_seeds": ["What tools do you use?", "Tell me about a specific debugging war story."],
                "evaluation_criteria": "Systematic debugging, tool knowledge, composure under pressure"
            },
            {
                "text": "If you had to design a scalable web application from scratch, how would you architect it?",
                "category": "technical",
                "difficulty": "Hard",
                "expected_depth": "Deep",
                "followup_seeds": ["How would you handle 10x traffic growth?", "What database would you choose and why?"],
                "evaluation_criteria": "Architecture knowledge, scalability thinking, trade-off awareness"
            },
            {
                "text": "How do you stay updated with the latest technology trends? Give me a recent example.",
                "category": "behavioral",
                "difficulty": "Easy",
                "expected_depth": "Brief",
                "followup_seeds": ["How do you decide which technologies to invest time in?", "Have you applied any recent learning to your work?"],
                "evaluation_criteria": "Continuous learning, practical application"
            },
            {
                "text": "Describe how you handle disagreements with team members about technical decisions.",
                "category": "behavioral",
                "difficulty": "Medium",
                "expected_depth": "Moderate",
                "followup_seeds": ["Can you give a specific example?", "How do you build consensus?"],
                "evaluation_criteria": "Collaboration, communication, conflict resolution"
            },
            {
                "text": "What are your strengths and areas where you'd like to improve as an engineer?",
                "category": "behavioral",
                "difficulty": "Easy",
                "expected_depth": "Moderate",
                "followup_seeds": ["What steps are you taking to improve?", "How have your strengths contributed to team success?"],
                "evaluation_criteria": "Self-awareness, growth mindset, honesty"
            },
            {
                "text": "Where do you see yourself in 3-5 years, and how does this role fit into that plan?",
                "category": "behavioral",
                "difficulty": "Easy",
                "expected_depth": "Brief",
                "followup_seeds": ["What skills do you want to develop?", "What type of projects excite you most?"],
                "evaluation_criteria": "Career clarity, motivation, alignment with role"
            }
        ]

        return pool[:count]
