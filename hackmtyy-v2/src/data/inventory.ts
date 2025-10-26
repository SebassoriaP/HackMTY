import type { Inventario } from '../types';

/**
 * Datos de inventario por producto y ubicación
 * Incluye control de stock, fechas de caducidad y alertas
 */

export const inventarioData: Inventario[] = [
  // ============================================
  // BEBIDAS ALCOHÓLICAS - Almacén Central
  // ============================================
  {
    id: "INV_LIQU_1001_AC",
    productoId: "LIQU_1001",
    ubicacion: "Almacén Central",
    cantidadDisponible: 350,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CHV-2025-Q3",
    fechaCaducidad: "2030-12-31",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1002_AC",
    productoId: "LIQU_1002",
    ubicacion: "Almacén Central",
    cantidadDisponible: 420,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "ABS-2025-08",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1003_AC",
    productoId: "LIQU_1003",
    ubicacion: "Almacén Central",
    cantidadDisponible: 280,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "BAC-2025-09",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1004_AC",
    productoId: "LIQU_1004",
    ubicacion: "Almacén Central",
    cantidadDisponible: 180,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "BOM-2025-07",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1005_AC",
    productoId: "LIQU_1005",
    ubicacion: "Almacén Central",
    cantidadDisponible: 550,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CYT-2025-10",
    fechaCaducidad: "2027-10-15",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1006_AC",
    productoId: "LIQU_1006",
    ubicacion: "Almacén Central",
    cantidadDisponible: 120,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "MOE-2025-09",
    fechaCaducidad: "2028-06-30",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1007_AC",
    productoId: "LIQU_1007",
    ubicacion: "Almacén Central",
    cantidadDisponible: 2100,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "HEI-2025-10",
    fechaCaducidad: "2026-04-20",
    alertaStock: false
  },
  {
    id: "INV_LIQU_1008_AC",
    productoId: "LIQU_1008",
    ubicacion: "Almacén Central",
    cantidadDisponible: 210,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CUE-2025-08",
    alertaStock: false
  },

  // ============================================
  // BEBIDAS NO ALCOHÓLICAS - Almacén Central
  // ============================================
  {
    id: "INV_BEB_2001_AC",
    productoId: "BEB_2001",
    ubicacion: "Almacén Central",
    cantidadDisponible: 3800,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "EVI-2025-10",
    alertaStock: false
  },
  {
    id: "INV_BEB_2002_AC",
    productoId: "BEB_2002",
    ubicacion: "Almacén Central",
    cantidadDisponible: 2950,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "COK-2025-10",
    fechaCaducidad: "2026-08-15",
    alertaStock: false
  },
  {
    id: "INV_BEB_2003_AC",
    productoId: "BEB_2003",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1100,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "TRO-2025-10",
    fechaCaducidad: "2025-11-30",
    alertaStock: false
  },
  {
    id: "INV_BEB_2004_AC",
    productoId: "BEB_2004",
    ubicacion: "Almacén Central",
    cantidadDisponible: 750,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "NES-2025-09",
    fechaCaducidad: "2026-12-31",
    alertaStock: false
  },
  {
    id: "INV_BEB_2005_AC",
    productoId: "BEB_2005",
    ubicacion: "Almacén Central",
    cantidadDisponible: 600,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "LIP-2025-10",
    fechaCaducidad: "2026-10-30",
    alertaStock: false
  },

  // ============================================
  // SNACKS - Almacén Central
  // ============================================
  {
    id: "INV_SNK_3001_AC",
    productoId: "SNK_3001",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1850,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "PLN-2025-10",
    fechaCaducidad: "2026-03-15",
    alertaStock: false
  },
  {
    id: "INV_SNK_3002_AC",
    productoId: "SNK_3002",
    ubicacion: "Almacén Central",
    cantidadDisponible: 2200,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "SNY-2025-10",
    fechaCaducidad: "2026-05-20",
    alertaStock: false
  },
  {
    id: "INV_SNK_3003_AC",
    productoId: "SNK_3003",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1500,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "LIN-2025-09",
    fechaCaducidad: "2026-09-30",
    alertaStock: false
  },
  {
    id: "INV_SNK_3004_AC",
    productoId: "SNK_3004",
    ubicacion: "Almacén Central",
    cantidadDisponible: 2800,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "ORE-2025-10",
    fechaCaducidad: "2026-07-10",
    alertaStock: false
  },
  {
    id: "INV_SNK_3005_AC",
    productoId: "SNK_3005",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1900,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "PRI-2025-10",
    fechaCaducidad: "2026-06-25",
    alertaStock: false
  },

  // ============================================
  // DUTY-FREE - Almacén Central
  // ============================================
  {
    id: "INV_DTY_4001_AC",
    productoId: "DTY_4001",
    ubicacion: "Almacén Central",
    cantidadDisponible: 45,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CHA-2025-08",
    alertaStock: false
  },
  {
    id: "INV_DTY_4002_AC",
    productoId: "DTY_4002",
    ubicacion: "Almacén Central",
    cantidadDisponible: 38,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "EST-2025-09",
    alertaStock: false
  },
  {
    id: "INV_DTY_4003_AC",
    productoId: "DTY_4003",
    ubicacion: "Almacén Central",
    cantidadDisponible: 28,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CAS-2025-09",
    alertaStock: false
  },

  // ============================================
  // EQUIPO DE CABINA - Almacén Central
  // ============================================
  {
    id: "INV_CAB_5001_AC",
    productoId: "CAB_5001",
    ubicacion: "Almacén Central",
    cantidadDisponible: 7500,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "ECO-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5002_AC",
    productoId: "CAB_5002",
    ubicacion: "Almacén Central",
    cantidadDisponible: 6200,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "AIR-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5003_AC",
    productoId: "CAB_5003",
    ubicacion: "Almacén Central",
    cantidadDisponible: 12000,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "AIS-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5004_AC",
    productoId: "CAB_5004",
    ubicacion: "Almacén Central",
    cantidadDisponible: 3800,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "SKY-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5005_AC",
    productoId: "CAB_5005",
    ubicacion: "Almacén Central",
    cantidadDisponible: 3200,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "FLA-2025-09",
    alertaStock: false
  },
  {
    id: "INV_CAB_5006_AC",
    productoId: "CAB_5006",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1900,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "SKC-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5007_AC",
    productoId: "CAB_5007",
    ubicacion: "Almacén Central",
    cantidadDisponible: 1150,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "CLO-2025-09",
    alertaStock: false
  },
  {
    id: "INV_CAB_5008_AC",
    productoId: "CAB_5008",
    ubicacion: "Almacén Central",
    cantidadDisponible: 780,
    ultimoInventario: "2025-10-24T08:00:00Z",
    lote: "TRA-2025-09",
    alertaStock: false
  },

  // ============================================
  // INVENTARIO EN BASES REGIONALES
  // ============================================
  
  // Base JFK
  {
    id: "INV_LIQU_1001_JFK",
    productoId: "LIQU_1001",
    ubicacion: "Base JFK",
    cantidadDisponible: 85,
    ultimoInventario: "2025-10-24T06:00:00Z",
    lote: "CHV-2025-Q3",
    alertaStock: false
  },
  {
    id: "INV_BEB_2001_JFK",
    productoId: "BEB_2001",
    ubicacion: "Base JFK",
    cantidadDisponible: 650,
    ultimoInventario: "2025-10-24T06:00:00Z",
    lote: "EVI-2025-10",
    alertaStock: false
  },
  {
    id: "INV_CAB_5001_JFK",
    productoId: "CAB_5001",
    ubicacion: "Base JFK",
    cantidadDisponible: 1200,
    ultimoInventario: "2025-10-24T06:00:00Z",
    lote: "ECO-2025-10",
    alertaStock: false
  },

  // Base DXB (Dubai)
  {
    id: "INV_LIQU_1006_DXB",
    productoId: "LIQU_1006",
    ubicacion: "Base DXB",
    cantidadDisponible: 45,
    ultimoInventario: "2025-10-24T10:00:00Z",
    lote: "MOE-2025-09",
    fechaCaducidad: "2028-06-30",
    alertaStock: false
  },
  {
    id: "INV_BEB_2003_DXB",
    productoId: "BEB_2003",
    ubicacion: "Base DXB",
    cantidadDisponible: 280,
    ultimoInventario: "2025-10-24T10:00:00Z",
    lote: "TRO-2025-10",
    fechaCaducidad: "2025-11-30",
    alertaStock: false
  },
  {
    id: "INV_CAB_5006_DXB",
    productoId: "CAB_5006",
    ubicacion: "Base DXB",
    cantidadDisponible: 480,
    ultimoInventario: "2025-10-24T10:00:00Z",
    lote: "SKC-2025-10",
    alertaStock: false
  },

  // Base ATL (Atlanta)
  {
    id: "INV_LIQU_1003_ATL",
    productoId: "LIQU_1003",
    ubicacion: "Base ATL",
    cantidadDisponible: 65,
    ultimoInventario: "2025-10-24T07:00:00Z",
    lote: "BAC-2025-09",
    alertaStock: false
  },
  {
    id: "INV_SNK_3002_ATL",
    productoId: "SNK_3002",
    ubicacion: "Base ATL",
    cantidadDisponible: 420,
    ultimoInventario: "2025-10-24T07:00:00Z",
    lote: "SNY-2025-10",
    fechaCaducidad: "2026-05-20",
    alertaStock: false
  },

  // Base SCL (Santiago)
  {
    id: "INV_LIQU_1008_SCL",
    productoId: "LIQU_1008",
    ubicacion: "Base SCL",
    cantidadDisponible: 32,
    ultimoInventario: "2025-10-24T09:00:00Z",
    lote: "CUE-2025-08",
    alertaStock: true // Stock bajo
  },
  {
    id: "INV_SNK_3004_SCL",
    productoId: "SNK_3004",
    ubicacion: "Base SCL",
    cantidadDisponible: 380,
    ultimoInventario: "2025-10-24T09:00:00Z",
    lote: "ORE-2025-10",
    fechaCaducidad: "2026-07-10",
    alertaStock: false
  }
];

/**
 * Función helper para obtener inventario por producto
 */
export function getInventarioByProducto(productoId: string): Inventario[] {
  return inventarioData.filter(inv => inv.productoId === productoId);
}

/**
 * Función helper para obtener inventario por ubicación
 */
export function getInventarioByUbicacion(ubicacion: string): Inventario[] {
  return inventarioData.filter(inv => inv.ubicacion === ubicacion);
}

/**
 * Función helper para obtener productos con alerta de stock
 */
export function getProductosConAlerta(): Inventario[] {
  return inventarioData.filter(inv => inv.alertaStock === true);
}

/**
 * Función para calcular stock total de un producto
 */
export function getStockTotalProducto(productoId: string): number {
  const inventarios = getInventarioByProducto(productoId);
  return inventarios.reduce((total, inv) => total + inv.cantidadDisponible, 0);
}

/**
 * Lista de ubicaciones disponibles
 */
export const UBICACIONES = [
  "Almacén Central",
  "Base JFK",
  "Base DXB",
  "Base ATL",
  "Base SCL",
  "Base LHR",
  "Base CDG",
  "Base FRA"
] as const;
