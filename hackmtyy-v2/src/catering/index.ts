/**
 * Punto de entrada principal para el sistema de catering aéreo
 * Exporta todas las funciones, tipos y datos necesarios
 */

// ============================================
// TIPOS
// ============================================
export type {
  // Tipos básicos
  AlcoholDecisionOption,
  Role,
  Item,
  Trolley,
  Flight,
  FlightsDB,
  
  // Tipos de catering
  ProductCategory,
  AlcoholPolicy,
  Aerolinea,
  QualityControl,
  Producto,
  ItemPedido,
  PedidoCatering,
  Inventario,
  
  // Colecciones
  AerolineasCollection,
  ProductosCollection,
  PedidosCateringCollection,
  InventarioCollection
} from '../types';

// ============================================
// FIREBASE CONFIG
// ============================================
export { db, auth } from '../firebase/config';
export { COLLECTIONS } from '../firebase/utils';

// ============================================
// FUNCIONES CRUD - AEROLÍNEAS
// ============================================
export {
  createAerolinea,
  getAerolinea,
  getAllAerolineas,
  updateAerolinea
} from '../firebase/utils';

// ============================================
// FUNCIONES CRUD - PRODUCTOS
// ============================================
export {
  createProducto,
  getProducto,
  getAllProductos,
  getProductosByCategoria,
  updateProducto
} from '../firebase/utils';

// ============================================
// FUNCIONES CRUD - PEDIDOS DE CATERING
// ============================================
export {
  createPedidoCatering,
  getPedidoCatering,
  getAllPedidosCatering,
  getPedidosByAerolinea,
  getPedidosByVuelo,
  updatePedidoCatering,
  validarPoliticasAlcohol
} from '../firebase/utils';

// ============================================
// FUNCIONES CRUD - INVENTARIO
// ============================================
export {
  createInventario,
  getInventario,
  getInventarioByProducto,
  getInventarioByUbicacion,
  updateInventario,
  actualizarStockPorPedido,
  getProductosStockBajo
} from '../firebase/utils';

// ============================================
// FUNCIONES GENÉRICAS
// ============================================
export {
  setDocument,
  getDocument,
  getAllDocuments,
  queryDocuments,
  updateDocument,
  deleteDocument
} from '../firebase/utils';

// ============================================
// INICIALIZACIÓN Y ESTADÍSTICAS
// ============================================
export {
  initializeFirebaseData,
  initializeIfEmpty,
  checkExistingData,
  getDataStatistics,
  printStatistics
} from '../firebase/initializeData';

// ============================================
// DATOS ESTÁTICOS
// ============================================
export {
  aerolineasData,
  getAerolineaByCode,
  destinoPermiteAlcohol,
  PAISES_SIN_ALCOHOL
} from '../data/airlines';

export {
  productosData,
  getProductosByCategoria as getProductosByCategoriaStatic,
  getProductoById,
  getBebidasAlcoholicas,
  calcularVolumenTotalAlcohol
} from '../data/products';

export {
  pedidosCateringData,
  getPedidosByAerolinea as getPedidosByAerolineaStatic,
  getPedidoByVuelo,
  getPedidosByEstado,
  generarIdPedido
} from '../data/orders';

export {
  inventarioData,
  getInventarioByProducto as getInventarioByProductoStatic,
  getInventarioByUbicacion as getInventarioByUbicacionStatic,
  getProductosConAlerta,
  getStockTotalProducto,
  UBICACIONES
} from '../data/inventory';

// ============================================
// COMPONENTES
// ============================================
export { default as CateringDashboard } from '../components/CateringDashboard';

// ============================================
// CONSTANTES ÚTILES
// ============================================

/**
 * Límite estándar de volumen de alcohol por pasajero según FAA/TSA
 */
export const LIMITE_ALCOHOL_PASAJERO = 5; // Litros

/**
 * Contenido máximo de alcohol permitido por volumen
 */
export const MAX_CONTENIDO_ALCOHOL = 70; // Porcentaje

/**
 * Estados posibles de un pedido
 */
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  EN_PREPARACION: 'en_preparacion',
  LISTO: 'listo',
  DESPACHADO: 'despachado'
} as const;

/**
 * Categorías de productos
 */
export const CATEGORIAS = {
  BEBIDAS_ALCOHOLICAS: 'BebidasAlcoholicas',
  BEBIDAS_NO_ALCOHOLICAS: 'BebidasNoAlcoholicas',
  SNACKS: 'Snacks',
  DUTY_FREE: 'DutyFree',
  EQUIPO_CABINA: 'EquipoCabina',
  DOCUMENTACION: 'Documentacion',
  COMIDAS: 'Comidas'
} as const;
