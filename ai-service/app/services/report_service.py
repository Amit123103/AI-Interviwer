from app.services.llm_service import llm_service
import json
from typing import List, Dict, Any

class ReportService:
    def __init__(self, model_name="llama3.1:8b"):
        self.model_name = model_name

    def generate_final_report(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a professional performance report based on the entire interview session.
        Accepts optional speech_analysis data for voice/emotion scoring.
        """
        # Support both naming conventions
        evaluations = session_data.get("evaluations") or session_data.get("evaluation_history") or []
        transcript = session_data.get("transcript", [])
        student_profile = session_data.get("student_profile", {})
        sector = session_data.get("sector", "General")
        target_company = session_data.get("target_company", "General")
        speech_analysis = session_data.get("speech_analysis", {})

        # Aggregate scores
        if not evaluations:
            return {"error": "No evaluations found for this session."}

        def get_score(e, key):
            val = e.get('evaluation', {}).get('metrics', {}).get(key, 50)
            return val / 10 if val > 10 else val

        avg_metrics = {
            "relevance": sum(get_score(e, 'relevance') for e in evaluations) / len(evaluations),
            "technical_correctness": sum(get_score(e, 'technical_correctness') for e in evaluations) / len(evaluations),
            "clarity_structure": sum(get_score(e, 'clarity_structure') for e in evaluations) / len(evaluations),
            "confidence": sum(get_score(e, 'confidence') for e in evaluations) / len(evaluations),
            "communication": sum(get_score(e, 'communication') for e in evaluations) / len(evaluations),
            "concept_coverage": sum(get_score(e, 'concept_coverage') for e in evaluations) / len(evaluations),
        }

        overall_score = sum(avg_metrics.values()) / 6

        # Build voice analysis section for the prompt
        voice_section = ""
        voice_summary = {}
        if speech_analysis:
            confidence_data = speech_analysis.get("confidence", {})
            pace_data = speech_analysis.get("pace", {})
            filler_data = speech_analysis.get("filler_words", {})
            clarity_data = speech_analysis.get("clarity", {})

            voice_summary = {
                "confidence_score": confidence_data.get("score", 0),
                "confidence_level": confidence_data.get("level", "unknown"),
                "speaking_pace_wpm": pace_data.get("wpm", 0),
                "pace_rating": pace_data.get("rating", "unknown"),
                "filler_word_count": filler_data.get("total_count", 0),
                "filler_ratio": filler_data.get("ratio", 0),
                "clarity_score": clarity_data.get("score", 0),
                "detected_emotions": speech_analysis.get("emotions", []),
                "stress_indicators": speech_analysis.get("stress_level", "unknown"),
            }

            voice_section = f"""
        VOICE & EMOTION ANALYSIS:
        - Confidence Score: {voice_summary['confidence_score']:.0%} ({voice_summary['confidence_level']})
        - Speaking Pace: {voice_summary['speaking_pace_wpm']} WPM ({voice_summary['pace_rating']})
        - Filler Word Ratio: {voice_summary['filler_ratio']:.1%} ({voice_summary['filler_word_count']} total)
        - Clarity Score: {voice_summary['clarity_score']:.0%}
        - Detected Emotions: {', '.join(voice_summary['detected_emotions']) if voice_summary['detected_emotions'] else 'N/A'}
        - Stress Level: {voice_summary['stress_indicators']}
        """

        prompt = f"""
        Generate a professional interview performance report for {student_profile.get('fullName', 'the candidate')}.

        INTERVIEW STATS:
        - Domain: {sector}
        - Target: {target_company}
        - Overall Score: {overall_score:.1f}/100
        - Metric Averages: {json.dumps(avg_metrics)}
        {voice_section}
        TRANSCRIPT SUMMARY:
        {transcript[:10]} ... (truncated)

        CONSTRUCT THE REPORT:
        1. Executive Summary (Professional tone, mention voice/confidence if data available)
        2. Strengths (3 concrete points)
        3. Areas for Improvement (3 concrete points)
        4. Hiring Recommendation (Strong Hire / Hire / Lean Hire / No Hire)
        5. Voice & Delivery Feedback (if voice data available)
        6. Suggested Learning Resources

        OUTPUT FORMAT (JSON ONLY):
        {{
            "executive_summary": "...",
            "strengths": ["...", "...", "..."],
            "improvement_areas": ["...", "...", "..."],
            "hiring_recommendation": "Strong Hire | Hire | Lean Hire | No Hire",
            "voice_delivery_feedback": "Feedback on speaking pace, confidence, filler words, and clarity",
            "learning_resources": [
                {{"topic": "...", "resource_url": "...", "reason": "..."}}
            ],
            "readiness_level": "Developing | Job Ready | Interview Ready"
        }}
        """

        try:
            api_key = session_data.get("api_key")
            response = llm_service.chat(messages=[
                {"role": "system", "content": "You are a Senior Talent Strategist and Technical Recruiter."},
                {"role": "user", "content": prompt}
            ], format='json', override_api_key=api_key)

            report_data = json.loads(response['message']['content'])
            
            # Map metrics to what the Node server expects (snake_case)
            mapped_metrics = {
                "relevance": avg_metrics["relevance"],
                "technical_correctness": avg_metrics["technical_correctness"],
                "clarity_structure": avg_metrics["clarity_structure"],
                "confidence": avg_metrics["confidence"],
                "communication": avg_metrics["communication"],
                "concept_coverage": avg_metrics["concept_coverage"]
            }

            result = {
                "overall_score": round(overall_score, 1),
                "metrics": mapped_metrics,
                "scores": {
                    "technical": round(avg_metrics["technical_correctness"], 1),
                    "communication": round(avg_metrics["communication"], 1),
                    "confidence": round(avg_metrics["confidence"], 1)
                },
                **report_data
            }
            # Always include voice_summary if speech data was provided
            if voice_summary:
                result["voice_analysis"] = voice_summary
            return result
        except Exception as e:
            print(f"Report Generation Error: {e}")
            return {"error": str(e)}

# Singleton instance
report_service = ReportService()
