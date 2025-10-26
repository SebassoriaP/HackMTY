export type AlcoholDecisionOption = "tirar" | "reusar" | "mezclar";

export type Role = "PICK" | "PACK";

export interface Item {
  sku: string;
  name: string;
  qty: number;
  alcohol: boolean;
  // Decisión automática de bottle handling (solo para items alcohólicos)
  bottleDecision?: DecisionBottleHandling;
  bottleReason?: string;
}

export interface Trolley {
  id: string;
  mesa: string;
  items: Item[];
}

export interface Flight {
  trolleys: Trolley[];
}

export type FlightsDB = Record<string, Flight>;

// ===============================================
// FIREBASE CATERING SYSTEM TYPES
// ===============================================

// Categorías de productos
export type ProductCategory = 
  | "BebidasAlcoholicas" 
  | "BebidasNoAlcoholicas" 
  | "Snacks" 
  | "DutyFree" 
  | "EquipoCabina" 
  | "Documentacion"
  | "Comidas";

// Políticas de Alcohol de Aerolíneas
export interface AlcoholPolicy {
  maxVolumenPorPasajero: number; // Litros
  requisitosEmpaque: string; // ej. "Envases originales sellados"
  destinosProhibidos: string[]; // Códigos de países (ej. ["IR", "SA"])
  documentacionRequerida: string[]; // ej. ["manifiesto de catering", "factura de exportación"]
  protocolosInventario: string; // ej. "conteo diario de stock, auditoría mensual"
  
  // Criterios de Control de Calidad para Alcohol Bottle Handling
  criteriosCalidad: {
    // REUTILIZAR: Criterios para usar la botella tal cual
    reutilizar: {
      fillLevelMin: number; // % mínimo de llenado (ej. 90)
      sealStatus: ("sellado" | "abierto")[]; // Estados de sello permitidos
      cleanlinessScoreMin: number; // Score mínimo de limpieza (0-100)
      labelCondition: ("excelente" | "bueno" | "deteriorado")[]; // Condiciones de etiqueta permitidas
    };
    
    // RELLENAR: Criterios para rellenar desde botella externa o agregar contenido
    rellenar: {
      fillLevelMin: number; // % mínimo de llenado (ej. 50)
      fillLevelMax: number; // % máximo de llenado (ej. 89)
      sealStatus: ("sellado" | "abierto")[]; // Estados de sello permitidos
      cleanlinessScoreMin: number; // Score mínimo de limpieza
      labelCondition: ("excelente" | "bueno" | "deteriorado")[]; // Condiciones de etiqueta permitidas
      permitirAgregacion: boolean; // Permitir combinar contenido de múltiples botellas
    };
    
    // DESECHAR: Cualquier botella que no cumpla los criterios anteriores se desecha
    // Regla especial: Vinos y cervezas abiertas SIEMPRE se desechan
    descartarVinosCervezasAbiertas: boolean; // true = política corporativa estricta
  };
}

// Aerolínea
export interface Aerolinea {
  codigo: string; // IATA/ICAO (ej. "AA", "EK")
  nombre: string;
  politicasAlcohol: AlcoholPolicy;
  direccionOficinas?: string;
  tiposCabina?: string[]; // ej. ["First", "Business", "Economy"]
}

// Control de Calidad para Bebidas (basado en dataset de botellas)
export interface QualityControl {
  fillLevel?: number; // Porcentaje de llenado (0-100)
  sealStatus: "sellado" | "abierto"; // Estado del sello
  cleanlinessScore?: number; // Score de limpieza (0-100)
  labelCondition?: "excelente" | "bueno" | "deteriorado";
  inspectionDate?: string; // Fecha de inspección
}

// Producto
export interface Producto {
  idProducto: string; // ej. "LIQU_1001"
  nombre: string;
  marca?: string;
  categoria: ProductCategory;
  tamano: number; // ml o gramos
  unidadMedida: "ml" | "L" | "g" | "kg" | "unidad";
  gradosAlcohol?: number; // Porcentaje (solo para bebidas alcohólicas)
  controlCalidad?: QualityControl; // Para bebidas alcohólicas principalmente
  empaqueRequerido?: string; // ej. "caja de cartón", "bolsa sellada"
  stockMinimo?: number;
  stockMaximo?: number;
  precio?: number;
  imagenUrl?: string;
}

// Decisiones de manejo de botellas alcohólicas
export type DecisionBottleHandling = "reutilizar" | "rellenar" | "desechar";

// Estado de procesamiento de botella en estación de análisis
export type EstadoProcesamientoBottle = "pendiente" | "en_analisis" | "procesada";

// Ítem de Pedido (dentro de un pedido de catering)
export interface ItemPedido {
  categoria: ProductCategory;
  productoId: string; // Referencia a Productos
  nombre: string;
  marca?: string;
  cantidad: number;
  volumenUnitario?: number; // ml o L (para bebidas)
  contenidoAlcohol?: number; // % o proof
  requiereEmpaqueEspecial?: boolean | string;
  
  // Para bebidas alcohólicas: NO se establece al crear pedido
  // Se establece durante el procesamiento en estación de bottle handling
  bottleHandlingStatus?: EstadoProcesamientoBottle;
  decisionBottleHandling?: DecisionBottleHandling;
  razonDecision?: string;
  
  // Metadata del procesamiento (V2)
  metadata?: {
    cantidadOriginal?: number;
    cantidadReutilizada?: number;
    cantidadRellenada?: number;
    cantidadDesechada?: number;
    accionBotella?: AccionBotella;
    razonDecision?: string;
  };
}

// Pedido/Carga de Catering
export interface PedidoCatering {
  idPedido: string;
  aerolinea: string; // Código de aerolínea
  vuelo: string;
  fecha: string; // ISO date string
  origen: string; // Código aeropuerto (ej. "JFK")
  destino: string; // Código aeropuerto (ej. "LHR")
  items: ItemPedido[];
  volumenTotalAlcohol: number; // Litros totales de alcohol
  documentosAdjuntos?: string[]; // URLs o referencias a documentos
  estado?: "pendiente" | "en_preparacion" | "listo" | "despachado";
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// Inventario
export interface Inventario {
  id?: string;
  productoId: string; // Referencia a Productos
  ubicacion: string; // ej. "Almacén Central", "Base JFK"
  cantidadDisponible: number;
  ultimoInventario: string; // ISO date string
  lote?: string;
  fechaCaducidad?: string; // ISO date string (para perecederos)
  alertaStock?: boolean; // true si está por debajo del mínimo
}

// Tipos para Firebase Collections
export type AerolineasCollection = Record<string, Aerolinea>;
export type ProductosCollection = Record<string, Producto>;
export type PedidosCateringCollection = Record<string, PedidoCatering>;
export type InventarioCollection = Record<string, Inventario>;

// ===============================================
// SISTEMA DE PROCESAMIENTO DE BOTELLAS EN TIEMPO REAL
// ===============================================

// Medición en tiempo real de una botella en la báscula
export interface MedicionBottle {
  fillLevel: number; // % medido en tiempo real por báscula
  pesoActual: number; // gramos
  pesoEsperado: number; // gramos (lleno)
  sealStatus: "sellado" | "abierto";
  cleanlinessScore: number; // 0-100 (inspección visual o sensor)
  labelCondition: "excelente" | "bueno" | "deteriorado";
  timestamp: string; // ISO date
}

// Registro de procesamiento de botella individual
export interface BottleProcessingRecord {
  id: string; // UUID único
  pedidoId: string;
  productoId: string;
  medicion: MedicionBottle;
  aerolineaCodigo: string;
  
  // Decisión tomada
  decision: DecisionBottleHandling;
  razonDecision: string;
  
  // Si decision = "rellenar"
  rellenado?: {
    botellaOrigenId?: string; // ID de botella desde donde se rellena
    enEspera: boolean; // true si no hay botella disponible para rellenar
    volumenAgregado?: number; // ml agregados
    fechaRellenado?: string;
  };
  
  // Si decision = "reutilizar"
  reutilizado?: {
    aprobadoPor: string; // ID empleado
    fechaAprobacion: string;
  };
  
  // Si decision = "desechar"
  desechado?: {
    motivoDescarte: string;
    contenedorDesechos: string;
    fechaDescarte: string;
  };
  
  procesadoPor: string; // ID del empleado
  fechaProcesamiento: string;
  estacionId: string; // ID de la estación de bottle handling
}

// Botella en espera de rellenado
export interface BottleAwaitingRefill {
  id: string;
  productoId: string;
  pedidoId: string;
  volumenActual: number; // ml
  volumenNecesario: number; // ml para completar
  fechaRegistro: string;
  estacionId: string;
}

// Colección de registros de procesamiento
export type BottleProcessingCollection = Record<string, BottleProcessingRecord>;
export type BottlesAwaitingRefillCollection = Record<string, BottleAwaitingRefill>;

// ===============================================
// SISTEMA DE MANEJO DE BOTELLAS DEVUELTAS (LEGACY)
// ===============================================

// Tipos de botellas
export type TipoBotella = "spirits" | "wine" | "beer" | "non_alcoholic";

// Acciones posibles para botellas devueltas
export type AccionBotella = "REUTILIZAR" | "RELLENAR" | "DESECHAR";

// Estados de integridad del sello
export type SelloIntegridad = "intacto" | "rotura" | "no_verificado";

// Estados de la etiqueta
export type EstadoEtiqueta = "buena" | "dañada" | "ilegible";

// ===============================================
// SISTEMA DE ALCOHOL ALMACENADO (NUEVA TABLA)
// ===============================================

export interface AlcoholAlmacenado {
  id: string;
  productoId: string;
  nombreProducto: string;
  volumenActual_ml: number;
  volumenOriginal_ml: number;
  nivelLlenado: number; // Porcentaje 0-100
  estadoSello: "sellado" | "abierto";
  estadoEtiqueta: "buena" | "dañada" | "ilegible";
  limpiezaScore: number; // 0-10
  vueloOrigen: string;
  fechaAlmacenamiento: string;
  ubicacionAlmacen: string;
  disponibleParaRellenar: boolean;
  notas?: string;
}

// Lugar de recogida
export type LugarRecogida = "base" | "galley";

// Políticas de manejo de botellas por aerolínea (extendido)
export interface PoliticasBotellas {
  allowRefill: boolean; // Permite rellenar desde lote externo
  allowReuse: boolean; // Permite reutilizar sin rellenar
  allowRefillAggregation: boolean; // Permite combinar botellas parciales
  maxRefillAggregationBottles: number; // Máximo de botellas a combinar
  minPercentForReuse: number; // Porcentaje mínimo para reutilizar (0-100)
  minPercentForRefill: number; // Porcentaje mínimo para rellenar (0-100)
  discardTypes: TipoBotella[]; // Tipos que siempre se desechan (wine, beer)
  requireSealIntact: boolean; // Requiere sello intacto
  requireGoodLabel: boolean; // Requiere etiqueta en buen estado
}

// Datos de auditoría
export interface DatosAuditoria {
  empleadoId: string;
  timestamp: string; // ISO date
  fotos: string[]; // URLs de fotos de evidencia
  versionRegla: string; // Versión del algoritmo de decisión
}

// Información de relleno
export interface InfoRelleno {
  loteDestino: string;
  cantidadResultante_ml: number;
}

// Información de reutilización por agregación
export interface InfoReutilizacionAgregada {
  seUsoAgregacion: boolean;
  botellasUsadas: string[]; // IDs de botellas combinadas
  cantidadResultante_ml: number;
}

// Botella devuelta
export interface BotellaDevuelta {
  idBotella: string;
  idProducto: string;
  tipo: TipoBotella;
  volumenOriginal_ml: number;
  volumenRestante_ml: number;
  porcentajeRestante: number; // Calculado: (volumenRestante/volumenOriginal)*100
  sellado: boolean;
  selloIntegridad: SelloIntegridad;
  estadoEtiqueta: EstadoEtiqueta;
  fechaProduccion?: string; // ISO date
  fechaCaducidad?: string; // ISO date
  lugarRecogida: LugarRecogida;
  fotoEvidenceUrl: string; // URL principal de evidencia
  vuelo: string;
  destinoPais: string; // Código de país
  horaRegistro: string; // ISO date
  empleadoId: string;
  
  // Decisión automática
  accionRecomendada?: AccionBotella;
  reglaAplicada?: string;
  
  // Datos adicionales
  datosAuditoria?: DatosAuditoria;
  relleno?: InfoRelleno;
  reutilizacionAgregada?: InfoReutilizacionAgregada;
}

// Resultado de decisión
export interface DecisionBotella {
  accion: AccionBotella;
  reglaAplicada: string;
  relleno?: InfoRelleno;
  reutilizacionAgregada?: InfoReutilizacionAgregada;
}

// Aerolínea extendida con políticas de botellas
export interface AerolineaExtendida extends Aerolinea {
  politicasBotellas?: PoliticasBotellas;
}

// Colección de botellas devueltas
export type BotellasDevueltasCollection = Record<string, BotellaDevuelta>;
