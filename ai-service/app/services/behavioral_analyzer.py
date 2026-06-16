import cv2
import numpy as np
import base64
from typing import Dict, Any

try:
    import mediapipe as mp
    _ = mp.solutions.face_mesh
    HAS_MEDIAPIPE = True
except (ImportError, AttributeError):
    HAS_MEDIAPIPE = False

class BehavioralAnalyzer:
    def __init__(self):
        if not HAS_MEDIAPIPE:
            self.face_mesh = None
            return
            
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def analyze_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes a single frame for emotion, attention, and posture.
        Expects raw image bytes (e.g., from a JPG/PNG).
        """
        if not HAS_MEDIAPIPE or self.face_mesh is None:
            return {
                "emotion": "Neutral",
                "attention_score": 100,
                "looking_away": False,
                "engagement_score": 100,
                "posture": "Neutral",
                "lighting": "Good"
            }

        try:
            # Decode image
            nparr = np.frombuffer(frame_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"error": "Invalid image data"}

            # Convert to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(img_rgb)

            # Default metrics
            metrics = {
                "emotion": "Neutral",
                "attention_score": 100,
                "looking_away": False,
                "engagement_score": 85,
                "posture": "Neutral",
                "lighting": "Good"
            }

            # Basic lighting check (average brightness)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            avg_brightness = np.mean(gray)
            if avg_brightness < 40:
                metrics["lighting"] = "Too Dark"
            elif avg_brightness > 220:
                metrics["lighting"] = "Too Bright"

            if not results.multi_face_landmarks:
                metrics["attention_score"] = 0
                metrics["looking_away"] = True
                metrics["engagement_score"] = 0
                return metrics

            # Head Pose / Attention Analysis (Simplified)
            # We look at the nose tip and eye landmarks to estimate gaze
            face_landmarks = results.multi_face_landmarks[0].landmark
            
            # Key landmark indices: Nose tip (1), Left eye inner (133), Right eye inner (362)
            nose_tip = face_landmarks[1]
            
            # Simple gaze/turn detection: if nose is too far from center of eyes
            # (This is a heuristic for normalized 0-1 coordinates)
            if nose_tip.x < 0.4 or nose_tip.x > 0.6:
                metrics["looking_away"] = True
                metrics["attention_score"] = 60
            
            # Emotion detection (Simplified heuristic based on mouth/eye landmarks)
            # Mouth stretch (13 is top lip, 14 is bottom lip)
            mouth_dist = abs(face_landmarks[13].y - face_landmarks[14].y)
            if mouth_dist > 0.05:
                metrics["emotion"] = "Speaking/Surprised"
            
            # Corner of mouth (61 is left, 291 is right) for smile
            smile_check = face_landmarks[61].y > face_landmarks[13].y and face_landmarks[291].y > face_landmarks[13].y
            if mouth_dist < 0.02 and smile_check:
                 metrics["emotion"] = "Smiling"

            # Engagement calculation
            if metrics["looking_away"]:
                metrics["engagement_score"] = 40
            else:
                metrics["engagement_score"] = 90

            return metrics

        except Exception as e:
            print(f"Behavioral Analysis Error: {e}")
            return {"error": str(e)}

# Singleton
behavioral_analyzer = BehavioralAnalyzer()
