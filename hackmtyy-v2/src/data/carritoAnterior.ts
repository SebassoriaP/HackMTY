import type { AlcoholAlmacenado } from '../types';

/**
 * Datos simulados del CARRITO DE CATERING del vuelo anterior
 * Estas son las botellas que quedaron después del último vuelo
 * Se pesarán en la báscula para determinar si se reutilizan, rellenan o desechan
 */

export interface BotellaCarritoAnterior {
  productoId: string;
  nombreProducto: string;
  pesoActual_ml: number;
  pesoOriginal_ml: number;
  nivelLlenado: number;
  estadoSello: 'sellado' | 'abierto';
  estadoEtiqueta: 'buena' | 'dañada' | 'ilegible';
  limpiezaScore: number; // 0-10
  vueloOrigen: string;
  posicionCarrito: string; // Ej: "Fila 1, Posición A"
}

/**
 * Carrito del vuelo AA090 (vuelo anterior)
 * Este es el carrito que regresó con botellas remanentes
 */
export const carritoAnteriorEjemplo: BotellaCarritoAnterior[] = [
  // ========================================
  // WHISKY CHIVAS REGAL (LIQU_1001)
  // ========================================
  {
    productoId: 'LIQU_1001',
    nombreProducto: 'Whisky Chivas Regal 12 años',
    pesoActual_ml: 688,
    pesoOriginal_ml: 750,
    nivelLlenado: 92,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 96,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 1, Posición A'
  },
  {
    productoId: 'LIQU_1001',
    nombreProducto: 'Whisky Chivas Regal 12 años',
    pesoActual_ml: 500,
    pesoOriginal_ml: 750,
    nivelLlenado: 67,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 90,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 1, Posición B'
  },
  {
    productoId: 'LIQU_1001',
    nombreProducto: 'Whisky Chivas Regal 12 años',
    pesoActual_ml: 225,
    pesoOriginal_ml: 750,
    nivelLlenado: 30,
    estadoSello: 'abierto',
    estadoEtiqueta: 'dañada',
    limpiezaScore: 75,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 1, Posición C'
  },

  // ========================================
  // VODKA ABSOLUT (LIQU_1002)
  // ========================================
  {
    productoId: 'LIQU_1002',
    nombreProducto: 'Vodka Absolut Original',
    pesoActual_ml: 525,
    pesoOriginal_ml: 750,
    nivelLlenado: 70,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 88,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 2, Posición A'
  },
  {
    productoId: 'LIQU_1002',
    nombreProducto: 'Vodka Absolut Original',
    pesoActual_ml: 150,
    pesoOriginal_ml: 750,
    nivelLlenado: 20,
    estadoSello: 'abierto',
    estadoEtiqueta: 'dañada',
    limpiezaScore: 65,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 2, Posición B'
  },

  // ========================================
  // HEINEKEN (LIQU_1007)
  // ========================================
  {
    productoId: 'LIQU_1007',
    nombreProducto: 'Cerveza Heineken Premium Lager',
    pesoActual_ml: 330,
    pesoOriginal_ml: 330,
    nivelLlenado: 100,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 100,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 3, Posición A'
  },
  {
    productoId: 'LIQU_1007',
    nombreProducto: 'Cerveza Heineken Premium Lager',
    pesoActual_ml: 330,
    pesoOriginal_ml: 330,
    nivelLlenado: 100,
    estadoSello: 'sellado',
    estadoEtiqueta: 'buena',
    limpiezaScore: 100,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 3, Posición B'
  },
  {
    productoId: 'LIQU_1007',
    nombreProducto: 'Cerveza Heineken Premium Lager',
    pesoActual_ml: 250,
    pesoOriginal_ml: 330,
    nivelLlenado: 76,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 85,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 3, Posición C'
  },

  // ========================================
  // OTRAS BOTELLAS (de otros productos)
  // ========================================
  {
    productoId: 'LIQU_1003',
    nombreProducto: 'Ron Bacardi Superior',
    pesoActual_ml: 450,
    pesoOriginal_ml: 750,
    nivelLlenado: 60,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 82,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 4, Posición A'
  },
  {
    productoId: 'LIQU_1004',
    nombreProducto: 'Gin Bombay Sapphire',
    pesoActual_ml: 600,
    pesoOriginal_ml: 750,
    nivelLlenado: 80,
    estadoSello: 'abierto',
    estadoEtiqueta: 'buena',
    limpiezaScore: 92,
    vueloOrigen: 'AA090',
    posicionCarrito: 'Fila 4, Posición B'
  }
];

/**
 * Helper: Filtrar botellas del carrito por producto
 */
export function filtrarCarritoPorProducto(
  productoId: string,
  carritoAnterior: BotellaCarritoAnterior[]
): BotellaCarritoAnterior[] {
  return carritoAnterior.filter(b => b.productoId === productoId);
}

/**
 * Helper: Obtener estadísticas del carrito
 */
export function obtenerEstadisticasCarrito(carritoAnterior: BotellaCarritoAnterior[]) {
  const totalBotellas = carritoAnterior.length;
  const volumenTotal = carritoAnterior.reduce((sum, b) => sum + b.pesoActual_ml, 0);
  
  const porProducto = carritoAnterior.reduce((acc, botella) => {
    if (!acc[botella.productoId]) {
      acc[botella.productoId] = {
        nombre: botella.nombreProducto,
        cantidad: 0,
        volumenTotal_ml: 0,
        botellas: []
      };
    }
    acc[botella.productoId].cantidad++;
    acc[botella.productoId].volumenTotal_ml += botella.pesoActual_ml;
    acc[botella.productoId].botellas.push(botella);
    return acc;
  }, {} as Record<string, { nombre: string; cantidad: number; volumenTotal_ml: number; botellas: BotellaCarritoAnterior[] }>);

  return {
    totalBotellas,
    volumenTotal_ml: volumenTotal,
    volumenTotal_L: Math.round(volumenTotal / 1000 * 100) / 100,
    productosUnicos: Object.keys(porProducto).length,
    porProducto
  };
}
