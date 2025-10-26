"""
FastAPI Server with WebSocket for Real-time YOLO Detection
Servidor backend para detección de objetos en tiempo real
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
from datetime import datetime
from typing import Dict, List
from yolo_detector import YOLODetector

# Inicializar FastAPI
app = FastAPI(
    title="YOLO Detection API",
    description="API para detección de objetos en tiempo real con YOLOv8",
    version="1.0.0"
)

# Configurar CORS para permitir requests del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar detector YOLO (se carga al iniciar el servidor)
detector = YOLODetector(
    model_path="yolov8n.pt",  # Modelo ligero para tiempo real
    conf_threshold=0.25,
    device="cpu"  # Cambiar a "cuda" si tienes GPU
)

# Mantener registro de conexiones activas
active_connections: List[WebSocket] = []


class ConnectionManager:
    """Maneja las conexiones WebSocket"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✓ Cliente conectado. Total activos: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"✗ Cliente desconectado. Total activos: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)


manager = ConnectionManager()


@app.get("/")
async def root():
    """Endpoint de prueba"""
    return {
        "message": "YOLO Detection API - Running",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": True,
        "active_connections": len(manager.active_connections),
        "model_info": detector.get_model_info()
    }


@app.get("/model/info")
async def model_info():
    """Obtiene información del modelo YOLO"""
    return detector.get_model_info()


@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    """
    WebSocket endpoint para detección en tiempo real
    
    Flujo:
    1. Cliente se conecta
    2. Cliente envía frames en Base64
    3. Servidor procesa con YOLO
    4. Servidor envía detecciones de vuelta
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Recibir datos del cliente
            data = await websocket.receive_text()
            
            try:
                # Parsear JSON
                message = json.loads(data)
                
                # Verificar que tenga el formato correcto
                if "image" not in message:
                    await manager.send_personal_message({
                        "error": "Missing 'image' field in message"
                    }, websocket)
                    continue
                
                # Extraer imagen Base64
                image_base64 = message["image"]
                
                # Realizar detección
                result = detector.detect_from_base64(image_base64)
                
                # Agregar timestamp
                result["timestamp"] = datetime.now().isoformat()
                
                # Enviar resultado al cliente
                await manager.send_personal_message(result, websocket)
                
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "error": "Invalid JSON format"
                }, websocket)
            
            except Exception as e:
                await manager.send_personal_message({
                    "error": f"Processing error: {str(e)}"
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Cliente desconectado")
    
    except Exception as e:
        print(f"Error en WebSocket: {e}")
        manager.disconnect(websocket)


@app.post("/api/detect")
async def detect_image(request: Dict):
    """
    HTTP endpoint alternativo para detección (no tiempo real)
    
    Body JSON:
    {
        "image": "data:image/jpeg;base64,/9j/4AAQ..."
    }
    """
    try:
        if "image" not in request:
            return JSONResponse(
                status_code=400,
                content={"error": "Missing 'image' field"}
            )
        
        result = detector.detect_from_base64(request["image"])
        result["timestamp"] = datetime.now().isoformat()
        
        return JSONResponse(content=result)
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Iniciando servidor YOLO Detection API...")
    print("📡 WebSocket endpoint: ws://localhost:8000/ws/detect")
    print("🌐 HTTP endpoint: http://localhost:8000/api/detect")
    print("📊 Health check: http://localhost:8000/health")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload en desarrollo
        log_level="info"
    )
