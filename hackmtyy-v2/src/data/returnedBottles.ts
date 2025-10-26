import type { BotellaDevuelta } from '../types';

/**
 * Ejemplos de botellas devueltas con diferentes escenarios
 * Incluye spirits, wine, beer y non_alcoholic con diferentes acciones recomendadas
 */

export const botellasDevueltasEjemplos: BotellaDevuelta[] = [
  // ==========================================
  // EJEMPLO 1: Spirit con sello intacto (AA) → REUTILIZAR
  // ==========================================
  {
    idBotella: "b1",
    idProducto: "LIQU_1001", // Whisky Chivas
    tipo: "spirits",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 700,
    porcentajeRestante: 93.3333,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "buena",
    fechaProduccion: "2023-01-15",
    lugarRecogida: "galley",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b1.jpg",
    vuelo: "AA100",
    destinoPais: "MEX",
    horaRegistro: "2025-11-05T12:00:00Z",
    empleadoId: "E101",
    accionRecomendada: "REUTILIZAR",
    reglaAplicada: "porcentajeRestante(93.33) >= minPercentForReuse(90) y selloIntegridad=intacto; allowReuse=true",
    datosAuditoria: {
      empleadoId: "E101",
      timestamp: "2025-11-05T12:00:10Z",
      fotos: [
        "https://cdn.example.com/bottles/b1_seal.jpg",
        "https://cdn.example.com/bottles/b1_label.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 2: Spirit 30% (AA) → RELLENAR (con agregación)
  // ==========================================
  {
    idBotella: "b2",
    idProducto: "LIQU_1002", // Vodka Absolut
    tipo: "spirits",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 225,
    porcentajeRestante: 30.0,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "buena",
    fechaProduccion: "2024-03-10",
    lugarRecogida: "base",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b2.jpg",
    vuelo: "AA101",
    destinoPais: "USA",
    horaRegistro: "2025-11-05T13:10:00Z",
    empleadoId: "E102",
    accionRecomendada: "RELLENAR",
    reglaAplicada: "allowRefillAggregation=true; se agruparon b2+b7+b9 para completar 750ml => RELLENAR (agregación)",
    reutilizacionAgregada: {
      seUsoAgregacion: true,
      botellasUsadas: ["b2", "b7", "b9"],
      cantidadResultante_ml: 750
    },
    datosAuditoria: {
      empleadoId: "E102",
      timestamp: "2025-11-05T13:10:30Z",
      fotos: [
        "https://cdn.example.com/bottles/b2_before.jpg",
        "https://cdn.example.com/bottles/b2_b7_b9_combined.jpg",
        "https://cdn.example.com/bottles/b2_after.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 3: Vino 40% (EK) → DESECHAR (política fija)
  // ==========================================
  {
    idBotella: "b3",
    idProducto: "LIQU_1005", // Vino Tinto Cabernet
    tipo: "wine",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 300,
    porcentajeRestante: 40.0,
    sellado: false,
    selloIntegridad: "rotura",
    estadoEtiqueta: "buena",
    fechaProduccion: "2023-09-20",
    fechaCaducidad: "2027-09-20",
    lugarRecogida: "galley",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b3.jpg",
    vuelo: "EK500",
    destinoPais: "UAE",
    horaRegistro: "2025-11-05T14:00:00Z",
    empleadoId: "E120",
    accionRecomendada: "DESECHAR",
    reglaAplicada: "Tipo=wine en discardTypes => DESECHAR (regla corporativa fija: vino siempre se desecha)",
    datosAuditoria: {
      empleadoId: "E120",
      timestamp: "2025-11-05T14:00:05Z",
      fotos: [
        "https://cdn.example.com/bottles/b3_seal_damaged.jpg",
        "https://cdn.example.com/bottles/b3_disposal.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 4: Non-alcoholic (AA) → REUTILIZAR
  // ==========================================
  {
    idBotella: "b4",
    idProducto: "BEB_2001", // Agua Evian
    tipo: "non_alcoholic",
    volumenOriginal_ml: 500,
    volumenRestante_ml: 450,
    porcentajeRestante: 90.0,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "buena",
    lugarRecogida: "base",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b4.jpg",
    vuelo: "AA200",
    destinoPais: "MEX",
    horaRegistro: "2025-11-05T15:00:00Z",
    empleadoId: "E130",
    accionRecomendada: "REUTILIZAR",
    reglaAplicada: "non_alcoholic y porcentajeRestante(90) >= minPercentForReuse(90) => REUTILIZAR",
    datosAuditoria: {
      empleadoId: "E130",
      timestamp: "2025-11-05T15:00:10Z",
      fotos: [
        "https://cdn.example.com/bottles/b4_check.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 5: Cerveza (DL) → DESECHAR
  // ==========================================
  {
    idBotella: "b5",
    idProducto: "LIQU_1007", // Cerveza Heineken
    tipo: "beer",
    volumenOriginal_ml: 330,
    volumenRestante_ml: 200,
    porcentajeRestante: 60.6,
    sellado: false,
    selloIntegridad: "no_verificado",
    estadoEtiqueta: "buena",
    fechaProduccion: "2025-08-15",
    fechaCaducidad: "2026-08-15",
    lugarRecogida: "galley",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b5.jpg",
    vuelo: "DL456",
    destinoPais: "FRA",
    horaRegistro: "2025-11-05T16:00:00Z",
    empleadoId: "E140",
    accionRecomendada: "DESECHAR",
    reglaAplicada: "Tipo=beer en discardTypes => DESECHAR (regla corporativa fija: cerveza siempre se desecha)",
    datosAuditoria: {
      empleadoId: "E140",
      timestamp: "2025-11-05T16:00:08Z",
      fotos: [
        "https://cdn.example.com/bottles/b5_open.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 6: Spirit destino prohibido (AA) → DESECHAR
  // ==========================================
  {
    idBotella: "b6",
    idProducto: "LIQU_1001",
    tipo: "spirits",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 600,
    porcentajeRestante: 80.0,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "buena",
    lugarRecogida: "base",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b6.jpg",
    vuelo: "AA888",
    destinoPais: "IR", // Irán - destino prohibido
    horaRegistro: "2025-11-05T17:00:00Z",
    empleadoId: "E150",
    accionRecomendada: "DESECHAR",
    reglaAplicada: "destinoPais(IR) en destinosProhibidos => DESECHAR",
    datosAuditoria: {
      empleadoId: "E150",
      timestamp: "2025-11-05T17:00:12Z",
      fotos: [
        "https://cdn.example.com/bottles/b6_restricted_dest.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 7: Spirit etiqueta dañada (AA) → DESECHAR
  // ==========================================
  {
    idBotella: "b7",
    idProducto: "LIQU_1004", // Gin Bombay
    tipo: "spirits",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 250,
    porcentajeRestante: 33.33,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "ilegible",
    lugarRecogida: "galley",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b7.jpg",
    vuelo: "AA300",
    destinoPais: "CAN",
    horaRegistro: "2025-11-05T18:00:00Z",
    empleadoId: "E160",
    accionRecomendada: "DESECHAR",
    reglaAplicada: "requireGoodLabel=true y estadoEtiqueta=ilegible => DESECHAR",
    datosAuditoria: {
      empleadoId: "E160",
      timestamp: "2025-11-05T18:00:15Z",
      fotos: [
        "https://cdn.example.com/bottles/b7_damaged_label.jpg"
      ],
      versionRegla: "v3.0"
    }
  },

  // ==========================================
  // EJEMPLO 8: Spirit para RELLENAR directo (DL)
  // ==========================================
  {
    idBotella: "b8",
    idProducto: "LIQU_1008", // Tequila
    tipo: "spirits",
    volumenOriginal_ml: 750,
    volumenRestante_ml: 600,
    porcentajeRestante: 80.0,
    sellado: true,
    selloIntegridad: "intacto",
    estadoEtiqueta: "buena",
    fechaProduccion: "2024-06-10",
    lugarRecogida: "base",
    fotoEvidenceUrl: "https://cdn.example.com/bottles/b8.jpg",
    vuelo: "DL789",
    destinoPais: "MEX",
    horaRegistro: "2025-11-05T19:00:00Z",
    empleadoId: "E170",
    accionRecomendada: "RELLENAR",
    reglaAplicada: "allowRefill=true y porcentajeRestante(80) >= minPercentForRefill(75) => RELLENAR",
    relleno: {
      loteDestino: "LOT_20251105_TEQUILA_A",
      cantidadResultante_ml: 750
    },
    datosAuditoria: {
      empleadoId: "E170",
      timestamp: "2025-11-05T19:00:20Z",
      fotos: [
        "https://cdn.example.com/bottles/b8_before_refill.jpg",
        "https://cdn.example.com/bottles/b8_refill_process.jpg",
        "https://cdn.example.com/bottles/b8_after_refill.jpg"
      ],
      versionRegla: "v3.0"
    }
  }
];

/**
 * Obtener botella por ID
 */
export function getBotellaById(idBotella: string): BotellaDevuelta | undefined {
  return botellasDevueltasEjemplos.find(b => b.idBotella === idBotella);
}

/**
 * Obtener botellas por acción
 */
export function getBotellasByAccion(accion: string): BotellaDevuelta[] {
  return botellasDevueltasEjemplos.filter(b => b.accionRecomendada === accion);
}

/**
 * Obtener botellas por tipo
 */
export function getBotellasByTipo(tipo: string): BotellaDevuelta[] {
  return botellasDevueltasEjemplos.filter(b => b.tipo === tipo);
}

/**
 * Obtener botellas por vuelo
 */
export function getBotellasByVuelo(vuelo: string): BotellaDevuelta[] {
  return botellasDevueltasEjemplos.filter(b => b.vuelo === vuelo);
}

/**
 * Calcular porcentaje restante
 */
export function calcularPorcentajeRestante(volumenOriginal: number, volumenRestante: number): number {
  if (volumenOriginal === 0) return 0;
  return Number(((volumenRestante / volumenOriginal) * 100).toFixed(4));
}
