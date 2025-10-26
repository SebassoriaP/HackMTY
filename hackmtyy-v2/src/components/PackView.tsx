import { useState, useEffect } from "react";
import CameraPreview from "./CameraPreview";
import { getAllCarritosCatering } from "../services/carritosCatering";
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
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  // Estado para los productos cargados
  const [products, setProducts] = useState<Product[]>([]);
  const [trolleyLoaded, setTrolleyLoaded] = useState<boolean>(false);
  
  // Estado para almacenar todos los carritos de Firebase
  const [allCarritos, setAllCarritos] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los carritos al montar el componente
  useEffect(() => {
    const loadCarritos = async () => {
      try {
        setLoading(true);
        const carritos = await getAllCarritosCatering();
        setAllCarritos(carritos);
        setError(null);
      } catch (err) {
        console.error("Error al cargar carritos:", err);
        setError("No se pudieron cargar los carritos de la base de datos");
      } finally {
        setLoading(false);
      }
    };
    
    loadCarritos();
  }, []);

  // Simular escaneo QR y buscar en Firebase
  const handleQRScan = () => {
    setIsScanning(true);
    
    // Simulamos un delay de escaneo (2 segundos)
    setTimeout(() => {
      // En producción, aquí obtendrías el QR real de la cámara
      // Por ahora, seleccionamos un carrito aleatorio de los disponibles
      if (allCarritos.length === 0) {
        setError("No hay carritos disponibles en la base de datos");
        setIsScanning(false);
        return;
      }

      // Seleccionamos un carrito al azar (simula escanear su QR)
      const randomCarrito = allCarritos[Math.floor(Math.random() * allCarritos.length)];
      setQrCode(randomCarrito.qr_id);
      
      // Convertimos los artículos del carrito al formato Product
      const productsList = convertArticulosToProducts(randomCarrito.articulos);
      setProducts(productsList);
      setTrolleyLoaded(true);
      setIsScanning(false);
    }, 2000);
  };

  // Función auxiliar para convertir artículos de Firebase a formato Product
  const convertArticulosToProducts = (articulos: any): Product[] => {
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
  };

  // Simular detección automática de IA (se ejecuta cada 3 segundos)
  useEffect(() => {
    if (!trolleyLoaded || products.length === 0) return;

    const interval = setInterval(() => {
      // Simulamos que la IA detecta un producto aleatorio que aún no está detectado
      setProducts((prevProducts) => {
        const undetectedProducts = prevProducts.filter((p) => !p.detected);
        
        if (undetectedProducts.length === 0) {
          clearInterval(interval);
          return prevProducts;
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
  }, [trolleyLoaded, products]);

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
          <span className="status status--info">Cargando carritos de Firebase...</span>
        )}
        {!loading && allCarritos.length > 0 && (
          <span className="status status--success">
            {allCarritos.length} carritos disponibles
          </span>
        )}
      </div>

      {/* Mostrar error si hay problemas con Firebase */}
      {error && !loading && (
        <div className="pack-view__content">
          <div className="status status--error" style={{ width: "100%", textAlign: "center", padding: "16px" }}>
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Paso 1: Escanear QR */}
      {!trolleyLoaded && !loading ? (
        <div className="pack-view__content">
          <section className="pack-view__info">
            <h3>📱 Escanea el código QR del trolley</h3>
            <p>
              Usa la cámara para escanear el código QR único del trolley. 
              Esto cargará automáticamente la lista de productos a empacar desde Firebase.
            </p>
            {allCarritos.length > 0 && (
              <p style={{ fontSize: "0.9rem", color: "#0b8fd8" }}>
                💡 Hay {allCarritos.length} carrito(s) en la base de datos listos para escanear
              </p>
            )}
            
            {/* Simulación de cámara QR */}
            <div className="pack-view__camera">
              <div style={{ 
                background: "#000", 
                borderRadius: "12px", 
                padding: "40px", 
                textAlign: "center",
                color: "#fff"
              }}>
                {isScanning ? (
                  <div>
                    <p style={{ fontSize: "1.5rem", margin: 0 }}>📷 Escaneando...</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                      Apunta al código QR
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: "3rem", margin: 0 }}>📦</p>
                    <p style={{ fontSize: "1.2rem", marginTop: "12px" }}>
                      Vista de cámara QR
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button 
              className="primary-button" 
              onClick={handleQRScan}
              disabled={isScanning || allCarritos.length === 0}
              style={{ width: "100%", marginTop: "16px" }}
            >
              {isScanning ? "Escaneando..." : allCarritos.length === 0 ? "No hay carritos disponibles" : "🔍 Escanear QR (Simulado)"}
            </button>
          </section>
        </div>
      ) : !loading ? (
        /* Paso 2: Mostrar cámara IA y lista de productos */
        <div className="pack-view__content">
          {/* Info del trolley escaneado */}
          <section className="pack-view__info">
            <h3>✅ Trolley: {qrCode}</h3>
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
