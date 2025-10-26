# 🧪 Prueba Rápida del Backend AI

## Paso 1: Iniciar el Servidor

```bash
# Desde la raíz del proyecto
./start_backend.sh
```

O manualmente:

```bash
cd backend_ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

## Paso 2: Verificar que funciona

### Opción A: Navegador
Abre: http://localhost:8000/health

Deberías ver:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "active_connections": 0,
  "model_info": {...}
}
```

### Opción B: curl
```bash
curl http://localhost:8000/health
```

### Opción C: Docs interactivos
Abre: http://localhost:8000/docs

## Paso 3: Probar WebSocket

### Usando JavaScript en la consola del navegador:

```javascript
// Conectar al WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/detect');

ws.onopen = () => {
  console.log('✓ Conectado al servidor YOLO');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Respuesta:', data);
};

// Crear una imagen de prueba (captura de canvas)
// Asumiendo que tienes un <canvas> en la página
const canvas = document.querySelector('canvas');
if (canvas) {
  const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
  ws.send(JSON.stringify({ image: imageBase64 }));
}
```

## Paso 4: Probar HTTP Endpoint

```bash
# Necesitas una imagen en Base64
curl -X POST "http://localhost:8000/api/detect" \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

## 🎯 Siguiente Paso

Ahora integra el WebSocket en tu frontend React:

1. Crear hook `useYOLODetection` en `src/hooks/`
2. Crear componente `AICamera` que capture frames
3. Integrar en `PackView.tsx`

¿Quieres que te ayude con la integración del frontend? 🚀
