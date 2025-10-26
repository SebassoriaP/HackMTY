import type { PedidoCatering } from '../types';

/**
 * Ejemplos de pedidos de catering para diferentes vuelos
 * Incluyen todas las categorías: bebidas, snacks, duty-free, equipo de cabina, documentación
 */

export const pedidosCateringData: PedidoCatering[] = [
  {
    idPedido: "PED_AA100_20251105",
    aerolinea: "AA",
    vuelo: "AA100",
    fecha: "2025-11-05",
    origen: "JFK",
    destino: "LHR",
    items: [
      // Bebidas Alcohólicas
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1001",
        nombre: "Whisky Chivas Regal 12 años",
        marca: "Chivas",
        cantidad: 5,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40,
        requiereEmpaqueEspecial: true
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1002",
        nombre: "Vodka Absolut Original",
        marca: "Absolut",
        cantidad: 3,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1007",
        nombre: "Cerveza Heineken Premium Lager",
        marca: "Heineken",
        cantidad: 100,
        volumenUnitario: 0.33,
        contenidoAlcohol: 5
      },
      // Bebidas No Alcohólicas
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2001",
        nombre: "Agua Mineral Evian",
        cantidad: 200
      },
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2002",
        nombre: "Coca-Cola Regular",
        cantidad: 150
      },
      // Snacks
      {
        categoria: "Snacks",
        productoId: "SNK_3001",
        nombre: "Mix de Nueces Premium",
        cantidad: 180
      },
      // Equipo de Cabina
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5001",
        nombre: "Set Cubiertos Plástico Biodegradable",
        cantidad: 250
      },
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5007",
        nombre: "Manta de Viaje",
        cantidad: 50
      },
      // Documentación
      {
        categoria: "Documentacion",
        productoId: "DOC_6001",
        nombre: "Manifiesto de Catering",
        cantidad: 1
      }
    ],
    volumenTotalAlcohol: 39.75, // (5*0.75) + (3*0.75) + (100*0.33) = 3.75 + 2.25 + 33 = 39 L
    documentosAdjuntos: [
      "/documents/manifest_AA100_20251105.pdf",
      "/documents/export_license_AA100.pdf"
    ],
    estado: "pendiente",
    fechaCreacion: "2025-10-20T10:30:00Z",
    fechaActualizacion: "2025-10-20T10:30:00Z"
  },
  {
    idPedido: "PED_EK202_20251110",
    aerolinea: "EK",
    vuelo: "EK202",
    fecha: "2025-11-10",
    origen: "DXB",
    destino: "JFK",
    items: [
      // Bebidas Alcohólicas
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1006",
        nombre: "Champagne Moët & Chandon",
        marca: "Moët & Chandon",
        cantidad: 20,
        volumenUnitario: 0.75,
        contenidoAlcohol: 12,
        requiereEmpaqueEspecial: "Caja refrigerada"
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1004",
        nombre: "Gin Bombay Sapphire",
        marca: "Bombay",
        cantidad: 8,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1005",
        nombre: "Vino Tinto Cabernet Sauvignon",
        cantidad: 30,
        volumenUnitario: 0.75,
        contenidoAlcohol: 13.5
      },
      // Bebidas No Alcohólicas
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2003",
        nombre: "Jugo de Naranja Natural",
        cantidad: 150
      },
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2004",
        nombre: "Café Espresso Nespresso",
        cantidad: 300
      },
      // Snacks
      {
        categoria: "Snacks",
        productoId: "SNK_3003",
        nombre: "Chocolate Lindt Excellence 70%",
        cantidad: 200
      },
      // Duty-Free
      {
        categoria: "DutyFree",
        productoId: "DTY_4001",
        nombre: "Perfume Chanel No. 5",
        cantidad: 10
      },
      // Equipo de Cabina
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5006",
        nombre: "Kit de Higiene Personal",
        cantidad: 320
      }
    ],
    volumenTotalAlcohol: 43.5, // (20*0.75) + (8*0.75) + (30*0.75) = 15 + 6 + 22.5 = 43.5 L
    documentosAdjuntos: [
      "/documents/manifest_EK202_20251110.pdf",
      "/documents/health_cert_EK202.pdf"
    ],
    estado: "en_preparacion",
    fechaCreacion: "2025-10-22T14:00:00Z",
    fechaActualizacion: "2025-10-23T09:15:00Z"
  },
  {
    idPedido: "PED_DL456_20251108",
    aerolinea: "DL",
    vuelo: "DL456",
    fecha: "2025-11-08",
    origen: "ATL",
    destino: "CDG",
    items: [
      // Bebidas Alcohólicas
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1003",
        nombre: "Ron Bacardi Superior",
        marca: "Bacardi",
        cantidad: 6,
        volumenUnitario: 0.75,
        contenidoAlcohol: 37.5
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1007",
        nombre: "Cerveza Heineken Premium Lager",
        cantidad: 80,
        volumenUnitario: 0.33,
        contenidoAlcohol: 5
      },
      // Bebidas No Alcohólicas
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2001",
        nombre: "Agua Mineral Evian",
        cantidad: 180
      },
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2005",
        nombre: "Té Verde Lipton",
        cantidad: 100
      },
      // Snacks
      {
        categoria: "Snacks",
        productoId: "SNK_3002",
        nombre: "Pretzels Salados",
        cantidad: 150
      },
      {
        categoria: "Snacks",
        productoId: "SNK_3005",
        nombre: "Papas Fritas Pringles Original",
        cantidad: 120
      },
      // Equipo de Cabina
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5002",
        nombre: "Servilletas de Papel Premium",
        cantidad: 400
      },
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5003",
        nombre: "Vaso Plástico 250ml",
        cantidad: 300
      }
    ],
    volumenTotalAlcohol: 30.9, // (6*0.75) + (80*0.33) = 4.5 + 26.4 = 30.9 L
    documentosAdjuntos: [
      "/documents/manifest_DL456_20251108.pdf"
    ],
    estado: "listo",
    fechaCreacion: "2025-10-21T08:45:00Z",
    fechaActualizacion: "2025-10-24T16:30:00Z"
  },
  {
    idPedido: "PED_LA800_20251112",
    aerolinea: "LA",
    vuelo: "LA800",
    fecha: "2025-11-12",
    origen: "SCL",
    destino: "MIA",
    items: [
      // Bebidas Alcohólicas
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1008",
        nombre: "Tequila Jose Cuervo Especial",
        marca: "Jose Cuervo",
        cantidad: 4,
        volumenUnitario: 0.75,
        contenidoAlcohol: 38
      },
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1005",
        nombre: "Vino Tinto Cabernet Sauvignon",
        cantidad: 15,
        volumenUnitario: 0.75,
        contenidoAlcohol: 13.5
      },
      // Bebidas No Alcohólicas
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2002",
        nombre: "Coca-Cola Regular",
        cantidad: 120
      },
      // Snacks
      {
        categoria: "Snacks",
        productoId: "SNK_3004",
        nombre: "Galletas Oreo Mini Pack",
        cantidad: 140
      },
      // Equipo de Cabina
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5001",
        nombre: "Set Cubiertos Plástico Biodegradable",
        cantidad: 200
      },
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5008",
        nombre: "Almohada de Cuello",
        cantidad: 30
      }
    ],
    volumenTotalAlcohol: 14.25, // (4*0.75) + (15*0.75) = 3 + 11.25 = 14.25 L
    documentosAdjuntos: [
      "/documents/manifest_LA800_20251112.pdf",
      "/documents/customs_LA800.pdf"
    ],
    estado: "pendiente",
    fechaCreacion: "2025-10-24T11:20:00Z",
    fechaActualizacion: "2025-10-24T11:20:00Z"
  },
  // Ejemplo de pedido a destino prohibido (para pruebas de validación)
  {
    idPedido: "PED_BA305_20251115",
    aerolinea: "BA",
    vuelo: "BA305",
    fecha: "2025-11-15",
    origen: "LHR",
    destino: "IR", // Irán - destino prohibido para alcohol
    items: [
      // Solo bebidas no alcohólicas para este destino
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2001",
        nombre: "Agua Mineral Evian",
        cantidad: 150
      },
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2002",
        nombre: "Coca-Cola Regular",
        cantidad: 100
      },
      {
        categoria: "BebidasNoAlcoholicas",
        productoId: "BEB_2004",
        nombre: "Café Espresso Nespresso",
        cantidad: 200
      },
      // Snacks
      {
        categoria: "Snacks",
        productoId: "SNK_3001",
        nombre: "Mix de Nueces Premium",
        cantidad: 120
      },
      // Equipo de Cabina
      {
        categoria: "EquipoCabina",
        productoId: "CAB_5001",
        nombre: "Set Cubiertos Plástico Biodegradable",
        cantidad: 180
      }
    ],
    volumenTotalAlcohol: 0, // Sin alcohol por restricción del destino
    documentosAdjuntos: [
      "/documents/manifest_BA305_20251115.pdf"
    ],
    estado: "pendiente",
    fechaCreacion: "2025-10-25T09:00:00Z",
    fechaActualizacion: "2025-10-25T09:00:00Z"
  }
];

/**
 * Función helper para obtener pedidos por aerolínea
 */
export function getPedidosByAerolinea(codigoAerolinea: string): PedidoCatering[] {
  return pedidosCateringData.filter(p => p.aerolinea === codigoAerolinea);
}

/**
 * Función helper para obtener pedidos por vuelo
 */
export function getPedidoByVuelo(vuelo: string): PedidoCatering | undefined {
  return pedidosCateringData.find(p => p.vuelo === vuelo);
}

/**
 * Función helper para obtener pedidos por estado
 */
export function getPedidosByEstado(estado: string): PedidoCatering[] {
  return pedidosCateringData.filter(p => p.estado === estado);
}

/**
 * Función para generar ID único de pedido
 */
export function generarIdPedido(aerolinea: string, vuelo: string, fecha: string): string {
  const fechaLimpia = fecha.replace(/-/g, '');
  return `PED_${vuelo}_${fechaLimpia}`;
}
