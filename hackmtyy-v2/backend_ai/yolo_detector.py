"""
YOLO Detector Wrapper
Clase wrapper para manejar el modelo YOLOv8 de forma reutilizable
"""
import cv2
import numpy as np
from ultralytics import YOLO
from typing import Dict, List, Tuple, Optional
import base64


class YOLODetector:
    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.25, device: str = "cpu"):
        """
        Inicializa el detector YOLO
        
        Args:
            model_path: Ruta al modelo YOLO (.pt file)
            conf_threshold: Umbral de confianza para detecciones
            device: 'cpu', 'cuda', o 'mps' (Mac)
        """
        print(f"Cargando modelo YOLO: {model_path} en {device}...")
        self.model = YOLO(model_path)
        self.model.fuse()  # Optimización para inferencia
        self.conf_threshold = conf_threshold
        self.device = device
        print("Modelo YOLO cargado exitosamente ✓")
    
    def detect_from_base64(self, image_base64: str) -> Dict:
        """
        Detecta objetos en una imagen codificada en Base64
        
        Args:
            image_base64: Imagen en formato Base64 string
            
        Returns:
            Dict con detecciones, conteos y advertencias
        """
        try:
            # Decodificar imagen Base64
            image_data = base64.b64decode(image_base64.split(',')[1] if ',' in image_base64 else image_base64)
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"error": "No se pudo decodificar la imagen"}
            
            return self.detect_from_frame(frame)
        
        except Exception as e:
            return {"error": f"Error al procesar imagen: {str(e)}"}
    
    def detect_from_frame(self, frame: np.ndarray) -> Dict:
        """
        Detecta objetos en un frame de OpenCV
        
        Args:
            frame: Imagen como numpy array (BGR)
            
        Returns:
            Dict con detecciones, conteos y advertencias
        """
        try:
            # Convertir BGR a RGB para YOLO
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Realizar inferencia
            results = self.model.predict(
                source=rgb,
                conf=self.conf_threshold,
                device=self.device,
                imgsz=640,
                verbose=False
            )
            
            result = results[0] if isinstance(results, (list, tuple)) else results
            
            # Extraer detecciones
            detections = []
            counts = {}
            
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    # Coordenadas de la caja
                    xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist()
                    conf = float(box.conf[0].cpu().numpy())
                    cls = int(box.cls[0].cpu().numpy())
                    label = self.model.names.get(cls, str(cls))
                    
                    # Agregar detección
                    detections.append({
                        "bbox": xyxy,  # [x1, y1, x2, y2]
                        "confidence": round(conf, 2),
                        "class": label,
                        "class_id": cls
                    })
                    
                    # Contar por clase
                    counts[label] = counts.get(label, 0) + 1
            
            # Verificar advertencias (por ejemplo, "bottle")
            warnings = []
            if counts.get("bottle", 0) > 0:
                warnings.append({
                    "type": "bottle_detected",
                    "message": "⚠️ Botella detectada - Debe ser retirada",
                    "severity": "high"
                })
            
            return {
                "success": True,
                "detections": detections,
                "counts": counts,
                "warnings": warnings,
                "total_objects": len(detections)
            }
        
        except Exception as e:
            return {"error": f"Error en detección: {str(e)}"}
    
    def get_model_info(self) -> Dict:
        """Retorna información del modelo"""
        return {
            "model_type": "YOLOv8",
            "classes": list(self.model.names.values()),
            "num_classes": len(self.model.names),
            "conf_threshold": self.conf_threshold,
            "device": self.device
        }
