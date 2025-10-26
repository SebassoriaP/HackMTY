/**
 * Context para manejar datos de catering desde Firebase
 */

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import type { 
  Aerolinea, 
  Producto, 
  PedidoCatering, 
  Inventario,
  BotellaDevuelta 
} from "../types";
import {
  getAllAerolineas,
  getAllProductos,
  getAllPedidosCatering,
  getAllInventario,
  getAllBotellasDevueltas,
  getPedidosByAerolinea,
  getProductosByCategoria
} from "../firebase/utils";

interface CateringContextValue {
  // Datos
  aerolineas: Aerolinea[];
  productos: Producto[];
  pedidos: PedidoCatering[];
  inventario: Inventario[];
  botellas: BotellaDevuelta[];
  
  // Estados de carga
  loading: boolean;
  error: string | null;
  
  // Funciones de consulta
  getPedidoById: (idPedido: string) => PedidoCatering | undefined;
  getProductoById: (idProducto: string) => Producto | undefined;
  getAerolineaByCodigo: (codigo: string) => Aerolinea | undefined;
  getPedidosByAerolinea: (codigoAerolinea: string) => Promise<PedidoCatering[]>;
  getProductosByCategoria: (categoria: string) => Promise<Producto[]>;
  
  // Función de recarga
  reloadData: () => Promise<void>;
}

const CateringContext = createContext<CateringContextValue | undefined>(undefined);

export const CateringProvider = ({ children }: PropsWithChildren) => {
  const [aerolineas, setAerolineas] = useState<Aerolinea[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCatering[]>([]);
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [botellas, setBotellas] = useState<BotellaDevuelta[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Cargando datos esenciales desde Firebase...');
      
      // Solo cargar aerolíneas y productos inicialmente (necesarios para la app)
      const [
        aerolineasData,
        productosData
      ] = await Promise.all([
        getAllAerolineas(),
        getAllProductos()
      ]);
      
      setAerolineas(aerolineasData);
      setProductos(productosData);
      
      console.log('✅ Datos esenciales cargados:', {
        aerolineas: aerolineasData.length,
        productos: productosData.length
      });
      
      // Cargar el resto en segundo plano (no bloqueante)
      Promise.all([
        getAllPedidosCatering(),
        getAllInventario(),
        getAllBotellasDevueltas()
      ]).then(([pedidosData, inventarioData, botellasData]) => {
        setPedidos(pedidosData);
        setInventario(inventarioData);
        setBotellas(botellasData);
        console.log('✅ Datos adicionales cargados:', {
          pedidos: pedidosData.length,
          inventario: inventarioData.length,
          botellas: botellasData.length
        });
      }).catch(err => {
        console.warn('⚠️ Error al cargar datos adicionales:', err);
      });
      
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPedidoById = useCallback(
    (idPedido: string) => pedidos.find(p => p.idPedido === idPedido),
    [pedidos]
  );

  const getProductoById = useCallback(
    (idProducto: string) => productos.find(p => p.idProducto === idProducto),
    [productos]
  );

  const getAerolineaByCodigo = useCallback(
    (codigo: string) => aerolineas.find(a => a.codigo === codigo),
    [aerolineas]
  );

  const getPedidosByAerolineaHandler = useCallback(
    async (codigoAerolinea: string) => {
      try {
        return await getPedidosByAerolinea(codigoAerolinea);
      } catch (err) {
        console.error('Error al obtener pedidos por aerolínea:', err);
        return [];
      }
    },
    []
  );

  const getProductosByCategoriaHandler = useCallback(
    async (categoria: string) => {
      try {
        return await getProductosByCategoria(categoria);
      } catch (err) {
        console.error('Error al obtener productos por categoría:', err);
        return [];
      }
    },
    []
  );

  const value: CateringContextValue = {
    aerolineas,
    productos,
    pedidos,
    inventario,
    botellas,
    loading,
    error,
    getPedidoById,
    getProductoById,
    getAerolineaByCodigo,
    getPedidosByAerolinea: getPedidosByAerolineaHandler,
    getProductosByCategoria: getProductosByCategoriaHandler,
    reloadData: loadData
  };

  return (
    <CateringContext.Provider value={value}>
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#1a237e',
          color: 'white',
          zIndex: 9999,
          fontSize: '18px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🍾✈️</h1>
            <h2 style={{ marginBottom: '10px' }}>Centro de Catering Aéreo</h2>
            <p>Cargando datos desde Firebase...</p>
            <div style={{ 
              marginTop: '20px', 
              width: '200px', 
              height: '4px', 
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <div style={{
                width: '50%',
                height: '100%',
                backgroundColor: 'white',
                animation: 'loading 1.5s ease-in-out infinite'
              }}></div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#f44336',
          color: 'white',
          zIndex: 9999,
          padding: '15px 30px',
          borderRadius: '5px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          maxWidth: '500px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <strong>⚠️ Error:</strong> {error}
            <button 
              onClick={() => {
                setError(null);
                loadData();
              }}
              style={{
                marginLeft: '15px',
                padding: '5px 15px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#f44336',
                border: 'none',
                borderRadius: '3px',
                fontWeight: 'bold'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      {children}
    </CateringContext.Provider>
  );
};

export const useCateringContext = (): CateringContextValue => {
  const ctx = useContext(CateringContext);
  if (!ctx) {
    throw new Error("useCateringContext debe usarse dentro de CateringProvider");
  }
  return ctx;
};
