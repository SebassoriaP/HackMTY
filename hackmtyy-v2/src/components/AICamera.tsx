/**
 * AI Camera Component
 * Muestra video en vivo con detecciones de YOLO en tiempo real
 */
import { useEffect, useRef, useState } from 'react';
import { useYOLODetection, Detection } from '../hooks/useYOLODetection';

interface AICameraProps {
  onDetectionUpdate?: (detections: Detection[], counts: Record<string, number>) => void;
  showBoundingBoxes?: boolean;
  showWarnings?: boolean;
  fps?: number;
}

const AICamera = ({ 
  onDetectionUpdate, 
  showBoundingBoxes = true,
  showWarnings = true,
  fps = 5
}: AICameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const {
    isConnected,
    isProcessing,
    lastDetection,
    error: serverError,
    startCapture,
    stopCapture,
  } = useYOLODetection({ fps, autoConnect: true });

  /**
   * Inicializar cámara
   */
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Cámara trasera en móviles
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    initCamera();

    return () => {
      // Cleanup: detener stream de cámara
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /**
   * Iniciar captura cuando cámara y servidor estén listos
   */
  useEffect(() => {
    if (isCameraReady && isConnected && videoRef.current && canvasRef.current) {
      startCapture(videoRef.current, canvasRef.current);
    }
    // No incluimos startCapture/stopCapture en deps para evitar re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraReady, isConnected]);

  /**
   * Actualizar callback con nuevas detecciones
   */
  useEffect(() => {
    if (lastDetection && lastDetection.success && onDetectionUpdate) {
      onDetectionUpdate(lastDetection.detections, lastDetection.counts);
    }
  }, [lastDetection, onDetectionUpdate]);

  /**
   * Dibujar bounding boxes en el overlay canvas
   */
  useEffect(() => {
    if (!showBoundingBoxes || !lastDetection || !overlayCanvasRef.current || !videoRef.current) {
      return;
    }

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Ajustar tamaño del overlay al video
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular ratio de escala (video real vs video mostrado)
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    // Dibujar cada detección
    lastDetection.detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;

      // Escalar coordenadas
      const scaledX1 = x1 * scaleX;
      const scaledY1 = y1 * scaleY;
      const scaledX2 = x2 * scaleX;
      const scaledY2 = y2 * scaleY;

      // Color basado en la clase
      const color = getColorForClass(detection.class);

      // Dibujar bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        scaledX1,
        scaledY1,
        scaledX2 - scaledX1,
        scaledY2 - scaledY1
      );

      // Dibujar label con fondo
      const label = `${detection.class} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;

      // Fondo del label
      ctx.fillStyle = color;
      ctx.fillRect(
        scaledX1,
        scaledY1 - textHeight - 4,
        textMetrics.width + 8,
        textHeight + 4
      );

      // Texto del label
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, scaledX1 + 4, scaledY1 - 8);
    });
  }, [lastDetection, showBoundingBoxes]);

  /**
   * Obtener color para una clase
   */
  const getColorForClass = (className: string): string => {
    const colors: Record<string, string> = {
      bottle: '#FF0000',
      cup: '#FF6B00',
      fork: '#00FF00',
      knife: '#00FF00',
      spoon: '#00FF00',
      bowl: '#0080FF',
      person: '#FFFF00',
    };
    return colors[className] || '#FF00FF';
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
      {/* Estado de conexión */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            background: isConnected ? '#22c55e' : '#ef4444',
            color: '#fff',
          }}
        >
          {isConnected ? '🟢 YOLO Conectado' : '🔴 YOLO Desconectado'}
        </span>
        {isProcessing && (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: '#3b82f6',
              color: '#fff',
            }}
          >
            ⚙️ Procesando...
          </span>
        )}
      </div>

      {/* Advertencias */}
      {showWarnings && lastDetection?.warnings && lastDetection.warnings.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 48,
          left: 8,
          right: 8,
          zIndex: 10,
        }}>
          {lastDetection.warnings.map((warning, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                background: warning.severity === 'high' ? '#ef4444' : '#f59e0b',
                color: '#fff',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {warning.message}
            </div>
          ))}
        </div>
      )}

      {/* Conteo de objetos */}
      {lastDetection && lastDetection.counts && Object.keys(lastDetection.counts).length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          padding: '12px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.875rem',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Objetos detectados:</div>
          {Object.entries(lastDetection.counts).map(([className, count]) => (
            <div key={className} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: getColorForClass(className) }}>●</span>
              <span>{className}: {count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Video container */}
      <div style={{
        position: 'relative',
        width: '100%',
        background: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />

        {/* Overlay canvas para bounding boxes */}
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Canvas oculto para captura de frames */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Errores */}
        {(cameraError || serverError) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '80%',
          }}>
            ⚠️ {cameraError || serverError}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICamera;
