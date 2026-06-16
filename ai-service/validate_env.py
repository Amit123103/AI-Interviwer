import sys
import importlib

required_libraries = [
    'fastapi', 'uvicorn', 'openai', 'pydantic', 'dotenv', 'requests',
    'numpy', 'cv2', 'mediapipe', 'edge_tts', 'pydub', 'psutil',
    'sentence_transformers', 'langchain_huggingface', 'langchain_community', 'faiss'
]

def check_dependencies():
    missing = []
    for lib in required_libraries:
        try:
            importlib.import_module(lib.replace('-', '_'))
        except ImportError:
            missing.append(lib)
    
    if missing:
        print(f"Wait! You are missing: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("AI Environment is [OK]")
    return True

if __name__ == "__main__":
    if not check_dependencies():
        sys.exit(1)
    sys.exit(0)
