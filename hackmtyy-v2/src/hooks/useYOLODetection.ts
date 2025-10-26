/**
 * Custom Hook para detección de objetos en tiempo real con YOLO
 * Maneja la conexión WebSocket con el servidor backend
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Tipos para las detecciones
export interface Detection {
  bbox: number[]; // [x1, y1, x2, y2]
  confidence: number;
  class: string;
  class_id: number;
}

export interface Warning {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DetectionResult {
  success: boolean;
  detections: Detection[];
  counts: Record<string, number>;
  warnings: Warning[];
  total_objects: number;
  timestamp?: string;
  error?: string;
}

interface UseYOLODetectionOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  fps?: number; // Frames por segundo a enviar
}

export const useYOLODetection = (options: UseYOLODetectionOptions = {}) => {
  const {
    serverUrl = 'ws://localhost:8000/ws/detect',
    autoConnect = true,
    fps = 5, // 5 frames por segundo por defecto
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  /**
   * Conectar al servidor WebSocket
   */
  const connect = useCallback(() => {
    // Evitar múltiples conexiones
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Ya conectado al servidor YOLO');
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      console.log('Conexión en progreso...');
      return;
    }

    try {
      console.log('Conectando a servidor YOLO:', serverUrl);
      const ws = new WebSocket(serverUrl);

      ws.onopen = () => {
        console.log('✓ Conectado al servidor YOLO');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: DetectionResult = JSON.parse(event.data);
          setLastDetection(data);
          setIsProcessing(false);

          if (data.error) {
            console.error('Error del servidor:', data.error);
            setError(data.error);
          } else {
            console.log('Detecciones recibidas:', data.total_objects);
          }
        } catch (err) {
          console.error('Error al parsear respuesta:', err);
          setIsProcessing(false);
        }
      };

      ws.onerror = (event) => {
        console.error('Error en WebSocket:', event);
        setError('Error de conexión con el servidor. ¿Está corriendo el backend?');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('Desconectado del servidor YOLO');
        setIsConnected(false);
        wsRef.current = null;
        
        // Reconexión automática (solo si fue cierre inesperado)
        if (!event.wasClean && autoConnect) {
          console.log('Intentando reconectar en 3 segundos...');
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error al crear WebSocket:', err);
      setError('No se pudo conectar al servidor');
    }
  }, [serverUrl, autoConnect]);

  /**
   * Desconectar del servidor
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Capturar frame del video y enviarlo al servidor
   */
  const captureAndSendFrame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    if (isCapturingRef.current) {
      return; // Ya hay una captura en proceso
    }

    isCapturingRef.current = true;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        isCapturingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Ajustar tamaño del canvas al video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar frame actual del video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a Base64 (JPEG con calidad 0.8 para balance entre calidad y tamaño)
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // Enviar al servidor
      wsRef.current.send(
        JSON.stringify({
          image: imageBase64,
        })
      );
    } catch (err) {
      console.error('Error al capturar frame:', err);
      setError('Error al capturar frame de video');
      setIsProcessing(false);
    } finally {
      isCapturingRef.current = false;
    }
  }, []);

  /**
   * Iniciar captura automática de frames
   */
  const startCapture = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      videoRef.current = video;
      canvasRef.current = canvas;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Capturar frames cada 1000/fps milisegundos
      const interval = 1000 / fps;
      intervalRef.current = setInterval(captureAndSendFrame, interval);
      console.log(`Iniciando captura a ${fps} FPS (cada ${interval}ms)`);
    },
    [fps, captureAndSendFrame]
  );

  /**
   * Detener captura de frames
   */
  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    videoRef.current = null;
    canvasRef.current = null;
    console.log('Captura detenida');
  }, []);

  /**
   * Auto-conectar si está habilitado
   */
  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect();
    }
  }, [autoConnect]); // Solo depende de autoConnect

  /**
   * Limpiar al desmontar
   */
  useEffect(() => {
    return () => {
      // Limpiar timeout de reconexión
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      stopCapture();
      
      // Cerrar WebSocket de forma limpia
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al desmontar

  return {
    // Estado
    isConnected,
    isProcessing,
    lastDetection,
    error,

    // Métodos
    connect,
    disconnect,
    startCapture,
    stopCapture,
    captureAndSendFrame,
  };
};
