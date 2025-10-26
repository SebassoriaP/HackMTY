# Backend AI - YOLO Detection API

Backend FastAPI con WebSocket para detección de objetos en tiempo real usando YOLOv8.

## 🚀 Instalación

### 1. Crear entorno virtual (recomendado)

```bash
cd backend_ai
python -m venv venv

# Activar en Linux/Mac:
source venv/bin/activate

# Activar en Windows:
venv\Scripts\activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

**Nota:** Si tienes GPU NVIDIA, instala PyTorch con CUDA:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 3. Descargar modelo YOLO (automático al ejecutar)

El modelo `yolov8n.pt` se descargará automáticamente la primera vez que ejecutes el servidor.

## 🏃 Ejecutar Servidor

```bash
python server.py
```

El servidor estará disponible en:
- **WebSocket:** `ws://localhost:8000/ws/detect`
- **HTTP API:** `http://localhost:8000/api/detect`
- **Health Check:** `http://localhost:8000/health`
- **Docs (Swagger):** `http://localhost:8000/docs`

## 📡 Uso del WebSocket

### Desde el Frontend (React/TypeScript)

```typescript
// Conectar al WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/detect');

// Enviar frame
const canvas = document.querySelector('canvas');
const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

ws.send(JSON.stringify({
  image: imageBase64
}));

// Recibir detecciones
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Detecciones:', data.detections);
  console.log('Advertencias:', data.warnings);
};
```

## 📦 Respuesta del Servidor

```json
{
  "success": true,
  "detections": [
    {
      "bbox": [100, 200, 300, 400],
      "confidence": 0.85,
      "class": "bottle",
      "class_id": 39
    }
  ],
  "counts": {
    "bottle": 1,
    "person": 2
  },
  "warnings": [
    {
      "type": "bottle_detected",
      "message": "⚠️ Botella detectada - Debe ser retirada",
      "severity": "high"
    }
  ],
  "total_objects": 3,
  "timestamp": "2025-10-26T10:30:45.123456"
}
```

## 🔧 Configuración

Copia `.env.example` a `.env` y modifica según necesites:

```bash
cp .env.example .env
```

Variables disponibles:
- `YOLO_MODEL`: Modelo a usar (yolov8n.pt, yolov8s.pt, yolov8m.pt)
- `YOLO_DEVICE`: cpu, cuda, o mps (Mac)
- `YOLO_CONF_THRESHOLD`: Umbral de confianza (0.0 - 1.0)

## 🎯 Endpoints

### WebSocket: `/ws/detect`
- **Propósito:** Detección en tiempo real
- **Input:** JSON con campo `image` (Base64)
- **Output:** Detecciones en JSON

### POST: `/api/detect`
- **Propósito:** Detección única (alternativa HTTP)
- **Body:** `{"image": "data:image/jpeg;base64,..."}`
- **Response:** JSON con detecciones

### GET: `/health`
- **Propósito:** Health check
- **Response:** Estado del servidor y modelo

### GET: `/model/info`
- **Propósito:** Información del modelo cargado
- **Response:** Clases, umbral, device, etc.

## 📊 Performance Tips

1. **Usar modelo ligero:** `yolov8n.pt` es el más rápido
2. **Reducir resolución:** Procesa frames a 640x480
3. **Ajustar FPS:** No enviar más de 10-15 frames/segundo
4. **GPU:** Si tienes NVIDIA GPU, cambia `device="cuda"`

## 🐛 Troubleshooting

### Error: "Could not load model"
```bash
# Descargar modelo manualmente
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

### Error: "No module named cv2"
```bash
pip install opencv-python
```

### Error de memoria
- Usa modelo más pequeño (yolov8n.pt)
- Reduce imgsz en yolo_detector.py (640 → 320)
- Procesa menos frames por segundo

## 📝 Estructura

```
backend_ai/
├── server.py              # Servidor FastAPI principal
├── yolo_detector.py       # Wrapper del modelo YOLO
├── requirements.txt       # Dependencias Python
├── .env.example          # Variables de entorno
└── README.md             # Esta documentación
```

## 🔗 Integración con Frontend

Ver documentación en `src/hooks/useYOLODetection.ts` (próximo paso)
