import { useState, useEffect, useCallback } from "react";
import CameraPreview from "./CameraPreview";
import QRScanner from "./QRScanner";
import { getCarritoByQRId } from "../services/carritosCatering";
import { Project } from "../types/carritosCatering";

// Tipos para los productos
interface Product {
  id: string;
  name: string;
  quantity: number;
  detected: boolean;
}

const PackView = () => {
  // Estado para el código QR escaneado
  const [qrCode, setQrCode] = useState<string>("");
  const [showScanner, setShowScanner] = useState<boolean>(false);
  
  // Estado para los productos cargados
  const [products, setProducts] = useState<Product[]>([]);
  const [trolleyLoaded, setTrolleyLoaded] = useState<boolean>(false);
  
  // Estado para loading y errores
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [carritoInfo, setCarritoInfo] = useState<Project | null>(null);

  // Iniciar escaneo de QR
  const handleStartScan = () => {
    setShowScanner(true);
    setError(null);
  };

  // Función auxiliar para convertir artículos de Firebase a formato Product
  const convertArticulosToProducts = useCallback((articulos: any): Product[] => {
    if (!articulos || typeof articulos !== 'object') {
      return [];
    }

    // Si articulos es un array
    if (Array.isArray(articulos)) {
      return articulos.map((item, index) => ({
        id: item.id || item.sku || `ART-${index}`,
        name: item.name || item.nombre || item.descripcion || "Producto sin nombre",
        quantity: item.quantity || item.cantidad || item.qty || 1,
        detected: false
      }));
    }

    // Si articulos es un objeto con propiedades
    return Object.entries(articulos).map(([key, value]: [string, any]) => ({
      id: value.id || value.sku || key,
      name: value.name || value.nombre || value.descripcion || key,
      quantity: value.quantity || value.cantidad || value.qty || 1,
      detected: false
    }));
  }, []);

  // Manejar QR escaneado exitosamente
  const handleQRSuccess = useCallback(async (scannedQR: string) => {
    console.log("QR Escaneado:", scannedQR);
    
    // Inmediatamente ocultar el scanner para evitar re-renders
    setShowScanner(false);
    setLoading(true);
    setError(null);

    try {
      // Buscar el carrito en Firebase usando el QR ID
      const carrito = await getCarritoByQRId(scannedQR);
      
      if (!carrito) {
        setError(`No se encontró ningún carrito con el código QR: ${scannedQR}`);
        setLoading(false);
        return;
      }

      // Convertir artículos a formato Product ANTES de actualizar estados
      const productsList = convertArticulosToProducts(carrito.articulos);
      
      // Actualizar todos los estados en batch (React los agrupa automáticamente)
      setQrCode(carrito.qr_id);
      setCarritoInfo(carrito);
      setProducts(productsList);
      setTrolleyLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error("Error al buscar carrito:", err);
      setError("Error al buscar el carrito en la base de datos");
      setLoading(false);
    }
  }, [convertArticulosToProducts]);

  // Manejar error en el escaneo
  const handleQRError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setShowScanner(false);
  }, []);

  // Simular detección automática de IA (se ejecuta cada 3 segundos)
  useEffect(() => {
    if (!trolleyLoaded || products.length === 0) return;

    const interval = setInterval(() => {
      // Simulamos que la IA detecta un producto aleatorio que aún no está detectado
      setProducts((prevProducts) => {
        const undetectedProducts = prevProducts.filter((p) => !p.detected);
        
        if (undetectedProducts.length === 0) {
          return prevProducts; // No hay cambios, no hay re-render
        }

        // Seleccionamos un producto al azar para "detectar"
        const randomIndex = Math.floor(Math.random() * undetectedProducts.length);
        const productToDetect = undetectedProducts[randomIndex];

        return prevProducts.map((p) =>
          p.id === productToDetect.id ? { ...p, detected: true } : p
        );
      });
    }, 3000); // Cada 3 segundos detecta un producto

    return () => clearInterval(interval);
  }, [trolleyLoaded]); // Removemos 'products' de las dependencias para evitar loop

  // Calcular progreso
  const detectedCount = products.filter((p) => p.detected).length;
  const totalCount = products.length;
  const isComplete = detectedCount === totalCount && totalCount > 0;

  // Resetear todo
  const handleReset = () => {
    setQrCode("");
    setProducts([]);
    setTrolleyLoaded(false);
  };

  return (
    <div className="pack-view">
      <div className="pack-view__header">
        <h2>🤖 Empaque Inteligente con IA</h2>
        {loading && (
          <span className="status status--info">Buscando carrito en Firebase...</span>
        )}
      </div>

      {/* Mostrar error si hay problemas */}
      {error && (
        <div className="pack-view__content">
          <div className="status status--error" style={{ width: "100%", textAlign: "center", padding: "16px" }}>
            ⚠️ {error}
          </div>
          <button 
            className="secondary-button" 
            onClick={() => {
              setError(null);
              setShowScanner(false);
            }}
            style={{ width: "100%", marginTop: "16px" }}
          >
            🔄 Intentar de nuevo
          </button>
        </div>
      )}

      {/* Paso 1: Escanear QR */}
      {!trolleyLoaded && !loading && !showScanner ? (
        <div className="pack-view__content">
          <section className="pack-view__info">
            <h3>📱 Escanea el código QR del carrito</h3>
            <p>
              Usa la cámara para escanear el código QR único del carrito. 
              El sistema buscará automáticamente el carrito en Firebase y cargará la lista de productos.
            </p>
            
            <div style={{ 
              background: "#e7f3ff", 
              padding: "16px", 
              borderRadius: "12px",
              marginTop: "16px"
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                💡 <strong>Cómo funciona:</strong>
              </p>
              <ol style={{ marginTop: "8px", paddingLeft: "20px", fontSize: "0.9rem" }}>
                <li>Presiona "Iniciar Escaneo QR"</li>
                <li>Permite el acceso a la cámara</li>
                <li>Apunta al código QR del carrito</li>
                <li>El sistema buscará el carrito automáticamente</li>
              </ol>
            </div>

            <button 
              className="primary-button" 
              onClick={handleStartScan}
              style={{ width: "100%", marginTop: "16px" }}
            >
              📷 Iniciar Escaneo QR
            </button>
          </section>
        </div>
      ) : null}

      {/* Mostrar escáner QR */}
      {showScanner && !trolleyLoaded && (
        <div className="pack-view__content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <section className="pack-view__info" style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            padding: 32,
            maxWidth: 380,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h3 style={{ marginBottom: 16 }}>📷 Escaneo de Código QR</h3>
            <div style={{ width: "100%", maxWidth: 320, margin: "0 auto 16px auto" }}>
              <QRScanner 
                onScanSuccess={handleQRSuccess}
                onScanError={handleQRError}
              />
            </div>
            <button 
              className="secondary-button" 
              onClick={() => setShowScanner(false)}
              style={{ width: "100%", marginTop: "16px" }}
            >
              ❌ Cancelar escaneo
            </button>
          </section>
        </div>
      )}

      {/* Paso 2: Mostrar cámara IA y lista de productos */}
      {trolleyLoaded && !loading ? (
        /* Paso 2: Mostrar cámara IA y lista de productos */
        <div className="pack-view__content">
          {/* Info del trolley escaneado */}
          <section className="pack-view__info">
            <h3>✅ Carrito QR: {qrCode}</h3>
            {carritoInfo && (
              <div style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Pedido:</strong> {carritoInfo.idPedido}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Tipo:</strong> {carritoInfo.tipo}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Vuelo:</strong> {carritoInfo.vuelo}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Estado:</strong> {carritoInfo.estado}
                </p>
              </div>
            )}
            <p>
              La IA está monitoreando la estación de trabajo. 
              Coloca los productos en el área visible de la cámara.
            </p>
            <div className="status status--info">
              Detectados: {detectedCount} / {totalCount}
            </div>
          </section>

          {/* Workspace con cámara y lista */}
          <div className="pack-view__workspace">
            {/* Cámara con IA simulada */}
            <div className="pack-view__camera">
              <CameraPreview title="🎥 Cámara con IA - Detección Automática" />
              <div style={{
                background: "#e7f3ff",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                marginTop: "8px"
              }}>
                💡 <strong>Simulación:</strong> La IA detecta productos automáticamente cada 3 segundos
              </div>
            </div>

            {/* Lista de productos */}
            <div className="pack-checklist">
              <h3 style={{ marginTop: 0 }}>📋 Lista de Productos</h3>
              <div className="pack-checklist__table">
                <div className="pack-checklist__header">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Estado</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="pack-checklist__row">
                    <span style={{ fontWeight: product.detected ? "600" : "normal" }}>
                      {product.detected && "✅ "}
                      {product.name}
                    </span>
                    <span>{product.quantity}</span>
                    <span>
                      {product.detected ? (
                        <span className="status status--success">Detectado</span>
                      ) : (
                        <span className="status status--info">Pendiente</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mensaje de completado */}
          {isComplete && (
            <div className="pack-view__done">
              🎉 TROLLEY COMPLETO - TODOS LOS PRODUCTOS DETECTADOS ✅
            </div>
          )}

          {/* Botón para resetear */}
          <button 
            className="secondary-button" 
            onClick={handleReset}
            style={{ width: "100%", marginTop: "16px" }}
          >
            🔄 Escanear otro trolley
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PackView;
