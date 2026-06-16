import numpy as np
import base64
from typing import Dict, Any, List, Optional

# Graceful imports — mediapipe/opencv may not be available on cloud platforms
try:
    import cv2
    import mediapipe as mp
    from mediapipe.python.solutions import hands as mp_hands
    HAS_MEDIAPIPE = True
except (ImportError, AttributeError):
    HAS_MEDIAPIPE = False
    print("⚠️  mediapipe/opencv not available — gesture detection disabled")

class HandGestureDetector:
    """
    Advanced hand gesture detector for "perfect" writing and drawing:
    - Feature: Moving average smoothing for jitter-free (x, y) coordinates.
    - Feature: Multi-point gesture heuristics (Pinch, Draw, Swipe).
    - Mode: Real-time optimized for WebSocket use.
    """

    def __init__(self, smoothing_factor: int = 5):
        if not HAS_MEDIAPIPE:
            self.hands = None
            return
            
        self.mp_hands = mp_hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7, # Higher confidence for "perfect" detection
            min_tracking_confidence=0.7
        )
        
        # Smoothing buffers
        self.x_history: List[float] = []
        self.y_history: List[float] = []
        self.smoothing_factor = smoothing_factor

    def _smooth(self, x: float, y: float) -> tuple[float, float]:
        """Apply simple moving average to stabilize coordinates."""
        self.x_history.append(x)
        self.y_history.append(y)
        
        if len(self.x_history) > self.smoothing_factor:
            self.x_history.pop(0)
            self.y_history.pop(0)
            
        return sum(self.x_history) / len(self.x_history), sum(self.y_history) / len(self.y_history)

    def process_frame(self, base64_image_data: str) -> Optional[Dict[str, Any]]:
        if not HAS_MEDIAPIPE or self.hands is None:
            return {"action": "none", "error": "Hand tracking unavailable"}
        
        try:
            # Decode base64 to OpenCV image
            header, content = base64_image_data.split(',') if ',' in base64_image_data else ("", base64_image_data)
            nparr = np.frombuffer(base64.b64decode(content), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None
                
            # Convert to RGB for MediaPipe
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = self.hands.process(img_rgb)
            
            if not results.multi_hand_landmarks:
                # Clear history if hand lost
                self.x_history.clear()
                self.y_history.clear()
                return {"action": "none"}
                
            landmarks = results.multi_hand_landmarks[0].landmark
            
            # ─── Landmark Extraction ───
            index_tip = landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_TIP]
            thumb_tip = landmarks[self.mp_hands.HandLandmark.THUMB_TIP]
            middle_tip = landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            ring_tip = landmarks[self.mp_hands.HandLandmark.RING_FINGER_TIP]
            pinky_tip = landmarks[self.mp_hands.HandLandmark.PINKY_TIP]
            wrist = landmarks[self.mp_hands.HandLandmark.WRIST]
            
            # Smooth coordinates of Index Finger Tip (the pointer)
            # Use raw coordinates for logic, smoothed for output
            sm_x, sm_y = self._smooth(index_tip.x, index_tip.y)
            
            # ─── Gesture Heuristics ───
            # Helper to check if finger is folded (tip is below PIP)
            is_index_folded = index_tip.y > landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_PIP].y
            is_middle_folded = middle_tip.y > landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_PIP].y
            is_ring_folded = ring_tip.y > landmarks[self.mp_hands.HandLandmark.RING_FINGER_PIP].y
            is_pinky_folded = pinky_tip.y > landmarks[self.mp_hands.HandLandmark.PINKY_PIP].y
            
            # 1. Closed Fist -> PAUSE / HALT
            if is_index_folded and is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "pause", "x": sm_x, "y": sm_y}
                
            # 2. Open Palm -> ERASE / SWIPE
            # An open palm has all fingers extended upward relative to their bases
            if not (is_index_folded or is_middle_folded or is_ring_folded or is_pinky_folded):
                return {"action": "erase_swipe", "x": sm_x, "y": sm_y}
                
            # 3. Two Finger Up -> HIGHLIGHT (Index + Middle extended)
            if (not is_index_folded) and (not is_middle_folded) and is_ring_folded and is_pinky_folded:
                 return {"action": "highlight", "x": sm_x, "y": sm_y}
            
            # 4. "Pinch" Gesture (Thumb + Index close) -> PRECISION ERASE or PICK
            dist_pinch = np.sqrt((index_tip.x - thumb_tip.x)**2 + (index_tip.y - thumb_tip.y)**2)
            if dist_pinch < 0.05:
                return {"action": "pinch", "x": sm_x, "y": sm_y}

            # 5. Pointing / WRITING (Only Index extended)
            # This is the "perfect" drawing state
            if (not is_index_folded) and is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "draw", "x": sm_x, "y": sm_y, "precision": 1.0}
            
            return {"action": "track", "x": sm_x, "y": sm_y}
            
        except Exception as e:
            print(f"[Detector] Error processing frame: {e}")
            return {"action": "error", "message": str(e)}

# Singleton instance
gesture_detector = HandGestureDetector()
