from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.consultation import Transcript, Consultation
import uuid

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        pass

manager = ConnectionManager()

@router.websocket("/{room_id}")
async def signaling_endpoint(websocket: WebSocket, room_id: str, db: Session = Depends(get_db)):
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Persist transcripts if they are of final type
            if message.get("type") == "transcript":
                data_item = message.get("data")
                if data_item:
                    transcript_entry = Transcript(
                        id=str(uuid.uuid4()),
                        consultation_id=room_id, # room_id is the consultation_id
                        speaker=data_item.get("speaker"),
                        text=data_item.get("text"),
                        timestamp=data_item.get("timestamp"),
                        source=data_item.get("source")
                    )
                    db.add(transcript_entry)
                    db.commit()
            
            await manager.broadcast(room_id, message, websocket)
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast(room_id, {"type": "user-disconnected"}, websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(room_id, websocket)
