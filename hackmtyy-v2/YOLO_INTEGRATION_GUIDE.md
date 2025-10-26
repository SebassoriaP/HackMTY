# 🚀 Guía de Uso: YOLO Detection en PackView

## ✅ Componentes Implementados

### 1. Backend AI (`backend_ai/`)
- ✅ `server.py` - FastAPI con WebSocket
- ✅ `yolo_detector.py` - Wrapper del modelo YOLO
- ✅ Endpoints: `/ws/detect`, `/health`, `/api/detect`

### 2. Frontend Hooks (`src/hooks/`)
- ✅ `useYOLODetection.ts` - Custom hook para WebSocket y captura de frames

### 3. Frontend Components (`src/components/`)
- ✅ `AICamera.tsx` - Cámara con detección en tiempo real
- ✅ `PackView.tsx` - Vista principal (actualizada)
- ✅ `QRScanner.tsx` - Escáner de códigos QR

## 🏃 Cómo Ejecutar

### Paso 1: Iniciar Backend

```bash
# Opción A: Script automático
./start_backend.sh

# Opción B: Manual
cd backend_ai
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Verifica que esté corriendo: http://localhost:8000/health

### Paso 2: Iniciar Frontend

```bash
# Desde la raíz del proyecto
npm run dev
```

### Paso 3: Usar la Aplicación

1. **Abrir** http://localhost:5173 (o el puerto que use Vite)
2. **Navegar** a la vista Pack (PackView)
3. **Escanear QR** del carrito (botón "Iniciar Escaneo QR")
4. **Permitir acceso** a la cámara cuando lo solicite
5. **Ver detecciones** en tiempo real con bounding boxes

## 🎯 Cómo Funciona

```
┌─────────────────────────────────────────────────────────┐
│ PackView Component                                      │
│                                                          │
│  1. Usuario escanea QR del carrito                      │
│     └─> QRScanner → getCarritoByQRId(Firebase)          │
│                                                          │
│  2. Se carga lista de productos del carrito             │
│     └─> setProducts([...])                              │
│                                                          │
│  3. AICamera inicia captura automática                  │
│     └─> useYOLODetection Hook                           │
│         ├─> Conecta WebSocket (ws://localhost:8000)     │
│         ├─> Captura frames del video (5 FPS)            │
│         └─> Envía frames como Base64 al servidor        │
│                                                          │
│  4. Backend procesa frames                              │
│     └─> YOLOv8.predict()                                │
│         └─> Retorna: detections, counts, warnings       │
│                                                          │
│  5. handleDetectionUpdate() matchea objetos             │
│     └─> Compara clases YOLO con productos               │
│         └─> Marca productos como detectados             │
│                                                          │
│  6. UI actualiza en tiempo real                         │
│     ├─> Bounding boxes sobre video                      │
│     ├─> Lista de productos (✅ Detectado / Pendiente)   │
│     └─> Alertas (ej: "Botella detectada")              │
└─────────────────────────────────────────────────────────┘
```

## 📊 Flujo de Datos

```javascript
// Frontend captura frame
const canvas = document.querySelector('canvas');
const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

// Envía via WebSocket
ws.send(JSON.stringify({ image: imageBase64 }));

// Backend responde
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
  "counts": { "bottle": 1 },
  "warnings": [
    {
      "type": "bottle_detected",
      "message": "⚠️ Botella detectada - Debe ser retirada",
      "severity": "high"
    }
  ],
  "total_objects": 1
}

// Frontend procesa
handleDetectionUpdate(detections, counts);
// → Matchea "bottle" con productos del carrito
// → Marca producto como detectado si hay coincidencia
```

## ⚙️ Configuración

### Ajustar FPS (Frames por Segundo)

En `PackView.tsx`:
```tsx
<AICamera 
  fps={5}  // Cambiar aquí (recomendado: 3-10)
  ...
/>
```

### Ajustar Umbral de Confianza

En `backend_ai/server.py`:
```python
detector = YOLODetector(
    model_path="yolov8n.pt",
    conf_threshold=0.25,  # Cambiar aquí (0.0 - 1.0)
    device="cpu"
)
```

### Usar GPU (si tienes NVIDIA)

En `backend_ai/server.py`:
```python
detector = YOLODetector(
    device="cuda"  # Cambiar de "cpu" a "cuda"
)
```

### Personalizar Matching de Productos

En `PackView.tsx`, función `handleDetectionUpdate()`:

```typescript
// Lógica actual (coincidencia por nombre)
if (productNameLower.includes(classNameLower) || 
    classNameLower.includes(productNameLower)) {
  // Marca como detectado
}

// Puedes personalizar:
// - Usar IDs específicos
// - Mapear clases YOLO a SKUs de productos
// - Usar fuzzy matching
// - Etc.
```

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar dependencias
cd backend_ai
pip install -r requirements.txt

# Ver logs detallados
python server.py
```

### Frontend no conecta al WebSocket
- Verificar que backend esté corriendo: http://localhost:8000/health
- Verificar URL en `useYOLODetection.ts`:
  ```typescript
  serverUrl = 'ws://localhost:8000/ws/detect'
  ```

### Cámara no se muestra
- Permitir acceso a la cámara en el navegador
- Usar HTTPS o localhost (requerido por navegadores)
- Verificar que no haya otra app usando la cámara

### Detecciones lentas
- Reducir FPS: `<AICamera fps={3} />`
- Usar modelo más pequeño: `yolov8n.pt` (ya es el más pequeño)
- Reducir resolución de video en `AICamera.tsx`
- Usar GPU en lugar de CPU

### Productos no se marcan como detectados
- Verificar nombres de productos en Firebase
- Revisar lógica de matching en `handleDetectionUpdate()`
- Ver logs del navegador (F12 → Console)
- Ver logs del backend Python

## 📝 Próximos Pasos (Opcional)

1. **Mejorar matching**: Crear mapeo específico de clases YOLO → Productos
2. **Agregar modelo custom**: Entrenar YOLO con tus propios productos
3. **Persistir detecciones**: Guardar en Firebase cuando se completa
4. **Agregar sonidos**: Alertas auditivas cuando se detecta algo
5. **Modo offline**: Usar TensorFlow.js para detección en navegador

## 🎉 Todo Listo!

Ahora tienes un sistema completo de detección de objetos en tiempo real integrado con tu aplicación de empaque de carritos.
