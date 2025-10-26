import { useEffect, useRef, useState } from "react";

interface CameraPreviewProps {
  title?: string;
}

const CameraPreview = ({ title }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Este navegador no soporta acceso a la cámara");
        setIsLoading(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, facingMode: "environment" }
        });
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = stream;
          // Algunos navegadores requieren manejar la promesa de play
          videoElement
            .play()
            .then(() => setIsLoading(false))
            .catch(() => {
              setIsLoading(false);
              setWarning(
                "La cámara está disponible pero el video no pudo iniciarse automáticamente. Toca el video para reproducir manualmente."
              );
            });
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
        setError(
          "No se pudo acceder a la cámara. Verifica permisos o que estés en https:// o http://localhost"
        );
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-preview">
      {title && <h3 className="camera-preview__title">{title}</h3>}
      {/* TODO: conectar con modelo de visión para reconocimiento automático */}
      {error ? (
        <div className="camera-preview__error">{error}</div>
      ) : (
        <div className="camera-preview__viewport">
          {isLoading && (
            <div className="camera-preview__loading">Activando cámara…</div>
          )}
          {warning && <div className="camera-preview__warning">{warning}</div>}
          <video
            ref={videoRef}
            className="camera-preview__video"
            autoPlay
            muted
            playsInline
            onClick={() => {
              const videoElement = videoRef.current;
              if (videoElement) {
                videoElement.play().catch(() => {
                  setWarning(
                    "El navegador detuvo la reproducción automática. Usa los controles del sistema para iniciar el video."
                  );
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
