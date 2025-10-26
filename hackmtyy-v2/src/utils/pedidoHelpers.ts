import type { PedidoCatering, ItemPedido, Producto, Aerolinea } from '../types';
import { analizarBotellaAutomaticamente } from '../utils/bottleAnalysis';

/**
 * Crea un ItemPedido a partir de un Producto, con análisis automático de bottle handling
 * para bebidas alcohólicas según los criterios de la aerolínea
 */
export function crearItemPedido(
  producto: Producto,
  cantidad: number,
  aerolinea: Aerolinea
): ItemPedido {
  const itemBase: ItemPedido = {
    categoria: producto.categoria,
    productoId: producto.idProducto,
    nombre: producto.nombre,
    marca: producto.marca,
    cantidad,
    volumenUnitario: producto.tamano,
    contenidoAlcohol: producto.gradosAlcohol,
    requiereEmpaqueEspecial: producto.empaqueRequerido
  };

  // Si es bebida alcohólica, realizar análisis automático
  if (producto.categoria === "BebidasAlcoholicas" && producto.controlCalidad) {
    const analisis = analizarBotellaAutomaticamente(producto, aerolinea);
    return {
      ...itemBase,
      decisionBottleHandling: analisis.decision,
      razonDecision: analisis.razon
    };
  }

  return itemBase;
}

/**
 * Crea un pedido de catering completo con análisis automático de todas las botellas
 */
export function crearPedidoCatering(
  idPedido: string,
  aerolinea: Aerolinea,
  vuelo: string,
  origen: string,
  destino: string,
  productosConCantidad: Array<{ producto: Producto; cantidad: number }>
): PedidoCatering {
  // Crear items con análisis automático
  const items = productosConCantidad.map(({ producto, cantidad }) =>
    crearItemPedido(producto, cantidad, aerolinea)
  );

  // Calcular volumen total de alcohol
  const volumenTotalAlcohol = productosConCantidad.reduce((total, { producto, cantidad }) => {
    if (producto.categoria === "BebidasAlcoholicas" && producto.unidadMedida === "ml") {
      return total + (producto.tamano / 1000) * cantidad; // Convertir a litros
    }
    return total;
  }, 0);

  return {
    idPedido,
    aerolinea: aerolinea.codigo,
    vuelo,
    fecha: new Date().toISOString(),
    origen,
    destino,
    items,
    volumenTotalAlcohol: Number(volumenTotalAlcohol.toFixed(2)),
    estado: "pendiente",
    fechaCreacion: new Date().toISOString()
  };
}

/**
 * Ejemplo de función para generar estadísticas de un pedido
 */
export function obtenerEstadisticasPedido(pedido: PedidoCatering) {
  const stats = {
    totalItems: pedido.items.length,
    totalBebidasAlcoholicas: 0,
    decisiones: {
      reutilizar: 0,
      rellenar: 0,
      desechar: 0
    },
    volumenAlcohol: pedido.volumenTotalAlcohol
  };

  pedido.items.forEach(item => {
    if (item.categoria === "BebidasAlcoholicas") {
      stats.totalBebidasAlcoholicas++;
      if (item.decisionBottleHandling) {
        stats.decisiones[item.decisionBottleHandling]++;
      }
    }
  });

  return stats;
}
