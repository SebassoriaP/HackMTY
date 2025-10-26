import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (qrCode: string) => void;
  onScanError?: (error: string) => void;
}

// Bandera global para prevenir múltiples instancias (persiste entre renders)
let globalScannerInstance: Html5Qrcode | null = null;
let isGloballyInitialized = false;

const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef<boolean>(false); // Prevenir múltiples escaneos

  useEffect(() => {
    // Inicializar el escáner cuando el componente se monta
    const initScanner = async () => {
      // Si ya está inicializado globalmente, no hacer nada
      if (isGloballyInitialized) {
        console.log("Escáner ya inicializado globalmente, omitiendo...");
        return;
      }
      
      isGloballyInitialized = true;
      
      try {
        // Limpiar cualquier instancia previa antes de crear una nueva
        const qrReaderElement = document.getElementById("qr-reader");
        if (qrReaderElement) {
          qrReaderElement.innerHTML = ""; // Limpiar contenido previo
        }

        // Crear instancia del escáner
        globalScannerInstance = new Html5Qrcode("qr-reader");
        setIsScanning(true);

        // Configuración del escáner
        const config = {
          fps: 10, // Frames por segundo
          qrbox: { width: 250, height: 250 }, // Tamaño del área de escaneo
        };

        // Iniciar el escaneo
        await globalScannerInstance.start(
          { facingMode: "environment" }, // Usar cámara trasera en móviles
          config,
          (decodedText: string) => {
            // Cuando se detecta un QR exitosamente
            // Prevenir múltiples llamadas
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            
            console.log("QR detectado:", decodedText);
            
            // Detener y limpiar inmediatamente
            stopScanner().then(() => {
              onScanSuccess(decodedText);
            });
          },
          (errorMessage: string) => {
            // Errores menores durante el escaneo (ignorar)
            // console.log("Escaneando...", errorMessage);
          }
        );
      } catch (err: any) {
        console.error("Error al iniciar escáner:", err);
        const errorMsg = "No se pudo acceder a la cámara. Verifica los permisos.";
        setError(errorMsg);
        isGloballyInitialized = false; // Resetear si falla
        if (onScanError) {
          onScanError(errorMsg);
        }
      }
    };

    initScanner();

    // Cleanup: detener el escáner cuando el componente se desmonta
    return () => {
      console.log("Limpiando escáner QR...");
      hasScannedRef.current = false; // Resetear flag de escaneo
      
      // Detener y limpiar de forma asíncrona
      const cleanup = async () => {
        await stopScanner();
      };
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intencionalmente vacío - solo se ejecuta al montar

  const stopScanner = async () => {
    if (globalScannerInstance) {
      try {
        // Primero detener el escaneo
        if (isScanning) {
          await globalScannerInstance.stop();
          console.log("Escáner detenido");
          setIsScanning(false);
        }
        // Luego limpiar el DOM
        await globalScannerInstance.clear();
        console.log("Escáner limpiado");
        globalScannerInstance = null;
        isGloballyInitialized = false; // Resetear flag global
        
        // Limpiar también el elemento del DOM por las dudas
        const qrReaderElement = document.getElementById("qr-reader");
        if (qrReaderElement) {
          qrReaderElement.innerHTML = "";
        }
      } catch (err) {
        console.error("Error al detener/limpiar escáner:", err);
        // Forzar limpieza aunque haya error
        try {
          if (globalScannerInstance) {
            globalScannerInstance.clear();
            globalScannerInstance = null;
          }
          isGloballyInitialized = false;
          // Limpiar DOM manualmente
          const qrReaderElement = document.getElementById("qr-reader");
          if (qrReaderElement) {
            qrReaderElement.innerHTML = "";
          }
        } catch (e) {
          console.error("Error forzando limpieza:", e);
        }
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {error ? (
        <div
          style={{
            padding: "20px",
            background: "#fdeaea",
            color: "#b3261e",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            id="qr-reader"
            style={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />
          <p
            style={{
              textAlign: "center",
              color: "#0b8fd8",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            📷 Apunta la cámara al código QR del carrito
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
