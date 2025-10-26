import type { AlcoholAlmacenado } from '../types';

/**
 * Datos de ejemplo para la tabla de Alcohol Almacenado
 * Esta tabla contiene botellas parcialmente usadas que pueden ser reutilizadas o rellenadas
 */

export const alcoholAlmacenadoEjemplo: Omit<AlcoholAlmacenado, 'id'>[] = [
  // ========================================
  // BOTELLAS QUE COINCIDEN CON PEDIDO AA100
  // ========================================
  {
    productoId: 'LIQU_1001', // Whisky Chivas (pedido necesita 5)
    nombreProducto: 'Whisky Chivas Regal 12 años',
    volumenActual_ml: 500,
    volumenOriginal_ml: 750,
    nivelLlenado: 67,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 90, // ← AUMENTADO para cumplir criterio de rellenar (≥85)
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T10:30:00Z',
    ubicacionAlmacen: 'Bodega Principal - A1',
    disponibleParaRellenar: true,
    notas: 'Botella apta para rellenar (67% lleno, limpieza 90)'
  },
  {
    productoId: 'LIQU_1001', // Whisky Chivas (2da botella)
    nombreProducto: 'Whisky Chivas Regal 12 años',
    volumenActual_ml: 688, // 91.7% lleno
    volumenOriginal_ml: 750,
    nivelLlenado: 92, // ← AUMENTADO para cumplir criterio de reutilizar (≥90%)
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 96, // ← AUMENTADO para cumplir criterio (≥95)
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T10:32:00Z',
    ubicacionAlmacen: 'Bodega Principal - A1',
    disponibleParaRellenar: true,
    notas: 'Apta para REUTILIZAR (92% lleno, sellado, limpieza 96)'
  },
  {
    productoId: 'LIQU_1002', // Vodka Absolut (pedido necesita 3)
    nombreProducto: 'Vodka Absolut Original',
    volumenActual_ml: 525, // 70% lleno
    volumenOriginal_ml: 750,
    nivelLlenado: 70, // ← AUMENTADO para cumplir criterio de rellenar (60-89%)
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 88, // ← AUMENTADO para cumplir criterio (≥85)
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T10:35:00Z',
    ubicacionAlmacen: 'Bodega Principal - A2',
    disponibleParaRellenar: true,
    notas: 'Apta para RELLENAR (70% lleno, limpieza 88)'
  },
  {
    productoId: 'LIQU_1007', // Cerveza Heineken (pedido necesita 100)
    nombreProducto: 'Cerveza Heineken Premium Lager',
    volumenActual_ml: 330,
    volumenOriginal_ml: 330,
    nivelLlenado: 100,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 100,
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T11:00:00Z',
    ubicacionAlmacen: 'Bodega Cervezas - C1',
    disponibleParaRellenar: true,
    notas: 'Lata sellada - REUTILIZAR (100% lleno, sellado, limpieza 100)'
  },
  {
    productoId: 'LIQU_1007', // Cerveza Heineken (2da lata)
    nombreProducto: 'Cerveza Heineken Premium Lager',
    volumenActual_ml: 330,
    volumenOriginal_ml: 330,
    nivelLlenado: 100,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 100,
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T11:01:00Z',
    ubicacionAlmacen: 'Bodega Cervezas - C1',
    disponibleParaRellenar: true,
    notas: 'Lata sellada - REUTILIZAR'
  },
  {
    productoId: 'LIQU_1007', // Cerveza Heineken (3ra lata - abierta)
    nombreProducto: 'Cerveza Heineken Premium Lager',
    volumenActual_ml: 250,
    volumenOriginal_ml: 330,
    nivelLlenado: 76,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 10,
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T11:02:00Z',
    ubicacionAlmacen: 'Bodega Cervezas - C1',
    disponibleParaRellenar: false,
    notas: 'Lata abierta - DESECHAR (política: cerveza abierta se desecha)'
  },
  
  // ========================================
  // OTRAS BOTELLAS (de otros productos)
  // ========================================
  {
    productoId: 'LIQU_1003',
    nombreProducto: 'Ron Bacardi Superior',
    volumenActual_ml: 450,
    volumenOriginal_ml: 750,
    nivelLlenado: 60,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 8,
    vueloOrigen: 'AA090',
    fechaAlmacenamiento: '2024-11-04T10:40:00Z',
    ubicacionAlmacen: 'Bodega Principal - A3',
    disponibleParaRellenar: true
  },
  {
    productoId: 'LIQU_1004',
    nombreProducto: 'Gin Bombay Sapphire',
    volumenActual_ml: 550,
    volumenOriginal_ml: 750,
    nivelLlenado: 73,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 9,
    vueloOrigen: 'EK205',
    fechaAlmacenamiento: '2024-11-03T14:20:00Z',
    ubicacionAlmacen: 'Bodega Principal - B1',
    disponibleParaRellenar: true,
    notas: 'Vuelo Emirates - almacenado día anterior'
  },
  {
    productoId: 'LIQU_1005',
    nombreProducto: 'Vino Tinto Cabernet Sauvignon',
    volumenActual_ml: 200,
    volumenOriginal_ml: 750,
    nivelLlenado: 27,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 7,
    vueloOrigen: 'DL505',
    fechaAlmacenamiento: '2024-11-04T08:15:00Z',
    ubicacionAlmacen: 'Bodega Vinos - V1',
    disponibleParaRellenar: false,
    notas: 'Vino abierto - NO apto para rellenar según políticas'
  },
  {
    productoId: 'LIQU_1006',
    nombreProducto: 'Champagne Moët & Chandon',
    volumenActual_ml: 400,
    volumenOriginal_ml: 750,
    nivelLlenado: 53,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 10,
    vueloOrigen: 'LA800',
    fechaAlmacenamiento: '2024-11-03T16:45:00Z',
    ubicacionAlmacen: 'Bodega Vinos - V2',
    disponibleParaRellenar: true,
    notas: 'Sello intacto - apto para reutilizar'
  },
  {
    productoId: 'LIQU_1012',
    nombreProducto: 'Gin Tanqueray London Dry',
    volumenActual_ml: 375,
    volumenOriginal_ml: 750,
    nivelLlenado: 50,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 9,
    vueloOrigen: 'EK205',
    fechaAlmacenamiento: '2024-11-03T12:30:00Z',
    ubicacionAlmacen: 'Bodega Principal - B2',
    disponibleParaRellenar: true,
    notas: 'Exactamente al 50% - óptimo para rellenar'
  }
];

/**
 * Helper: Filtrar alcohol disponible por producto
 */
export function filtrarAlcoholPorProducto(
  productoId: string, 
  alcoholAlmacenado: AlcoholAlmacenado[]
): AlcoholAlmacenado[] {
  return alcoholAlmacenado.filter(
    a => a.productoId === productoId && a.disponibleParaRellenar
  );
}

/**
 * Helper: Calcular volumen total disponible para un producto
 */
export function calcularVolumenDisponible(
  productoId: string,
  alcoholAlmacenado: AlcoholAlmacenado[]
): number {
  return filtrarAlcoholPorProducto(productoId, alcoholAlmacenado)
    .reduce((total, alcohol) => total + alcohol.volumenActual_ml, 0);
}

/**
 * Helper: Estadísticas del almacén
 */
export function obtenerEstadisticasAlmacen(alcoholAlmacenado: AlcoholAlmacenado[]) {
  const disponibles = alcoholAlmacenado.filter(a => a.disponibleParaRellenar);
  const volumenTotal = disponibles.reduce((sum, a) => sum + a.volumenActual_ml, 0);
  
  const porProducto = disponibles.reduce((acc, alcohol) => {
    if (!acc[alcohol.productoId]) {
      acc[alcohol.productoId] = {
        nombre: alcohol.nombreProducto,
        cantidad: 0,
        volumenTotal_ml: 0,
        botellas: []
      };
    }
    acc[alcohol.productoId].cantidad++;
    acc[alcohol.productoId].volumenTotal_ml += alcohol.volumenActual_ml;
    acc[alcohol.productoId].botellas.push(alcohol);
    return acc;
  }, {} as Record<string, { nombre: string; cantidad: number; volumenTotal_ml: number; botellas: AlcoholAlmacenado[] }>);

  return {
    totalBotellas: disponibles.length,
    volumenTotal_ml: volumenTotal,
    volumenTotal_L: Math.round(volumenTotal / 1000 * 100) / 100,
    productosUnicos: Object.keys(porProducto).length,
    porProducto
  };
}
