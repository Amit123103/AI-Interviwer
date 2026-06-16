import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.gesture_detector import gesture_detector as detector

router = APIRouter(prefix="/gesture", tags=["Gesture"])

@router.websocket("/gesture-track")
async def gesture_websocket(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected for gesture tracking")
    
    try:
        while True:
            # Receive base64 string from client
            data = await websocket.receive_text()
            
            # Run processing in a thread to not block asyncio
            # For maximum performance we could use asyncio.to_thread
            result = await asyncio.to_thread(detector.process_frame, data)
            
            if result:
                await websocket.send_json(result)
            else:
                await websocket.send_json({"action": "none"})
                
    except WebSocketDisconnect:
        print("WebSocket disconnected for gesture tracking")
    except Exception as e:
        print(f"WebSocket error: {e}")
