import type { Producto, Aerolinea, DecisionBottleHandling } from '../types';

/**
 * Resultado del análisis automático de una botella alcohólica
 */
export interface BottleAnalysisResult {
  decision: DecisionBottleHandling;
  razon: string;
}

/**
 * Analiza automáticamente una botella alcohólica según los criterios de calidad
 * de la aerolínea y retorna la decisión (reutilizar, rellenar o desechar)
 * 
 * @param producto - El producto (botella) a analizar
 * @param aerolinea - La aerolínea con sus criterios de calidad
 * @returns Decisión automática y razón
 */
export function analizarBotellaAutomaticamente(
  producto: Producto,
  aerolinea: Aerolinea
): BottleAnalysisResult {
  
  // Solo analizar bebidas alcohólicas
  if (producto.categoria !== "BebidasAlcoholicas" || !producto.controlCalidad) {
    return {
      decision: "reutilizar",
      razon: "Producto no requiere análisis de calidad de alcohol"
    };
  }

  const { controlCalidad } = producto;
  const { criteriosCalidad } = aerolinea.politicasAlcohol;

  // REGLA CORPORATIVA: Vinos y cervezas abiertos SIEMPRE se desechan
  const esVinoOCerveza = producto.nombre.toLowerCase().includes('vino') || 
                         producto.nombre.toLowerCase().includes('cerveza') ||
                         producto.nombre.toLowerCase().includes('prosecco') ||
                         producto.nombre.toLowerCase().includes('champagne');
  
  if (esVinoOCerveza && 
      controlCalidad.sealStatus === "abierto" && 
      criteriosCalidad.descartarVinosCervezasAbiertas) {
    return {
      decision: "desechar",
      razon: `Política corporativa: ${producto.nombre} abierto debe descartarse`
    };
  }

  // VERIFICAR CRITERIOS DE REUTILIZAR
  const cumpleReutilizar = 
    (controlCalidad.fillLevel || 0) >= criteriosCalidad.reutilizar.fillLevelMin &&
    criteriosCalidad.reutilizar.sealStatus.includes(controlCalidad.sealStatus) &&
    (controlCalidad.cleanlinessScore || 0) >= criteriosCalidad.reutilizar.cleanlinessScoreMin &&
    (controlCalidad.labelCondition ? 
      criteriosCalidad.reutilizar.labelCondition.includes(controlCalidad.labelCondition) : 
      true);

  if (cumpleReutilizar) {
    return {
      decision: "reutilizar",
      razon: `Cumple criterios de ${aerolinea.codigo}: ${controlCalidad.fillLevel}% llenado, sello ${controlCalidad.sealStatus}, limpieza ${controlCalidad.cleanlinessScore}/100`
    };
  }

  // VERIFICAR CRITERIOS DE RELLENAR
  const cumpleRellenar = 
    (controlCalidad.fillLevel || 0) >= criteriosCalidad.rellenar.fillLevelMin &&
    (controlCalidad.fillLevel || 0) <= criteriosCalidad.rellenar.fillLevelMax &&
    criteriosCalidad.rellenar.sealStatus.includes(controlCalidad.sealStatus) &&
    (controlCalidad.cleanlinessScore || 0) >= criteriosCalidad.rellenar.cleanlinessScoreMin &&
    (controlCalidad.labelCondition ? 
      criteriosCalidad.rellenar.labelCondition.includes(controlCalidad.labelCondition) : 
      true);

  if (cumpleRellenar) {
    const metodoRellenado = criteriosCalidad.rellenar.permitirAgregacion 
      ? "puede combinarse con otras botellas" 
      : "rellenar desde botella externa nueva";
    
    return {
      decision: "rellenar",
      razon: `${controlCalidad.fillLevel}% llenado - ${metodoRellenado} (${aerolinea.codigo})`
    };
  }

  // POR DEFECTO: DESECHAR
  const razones: string[] = [];
  if ((controlCalidad.fillLevel || 0) < criteriosCalidad.rellenar.fillLevelMin) {
    razones.push(`llenado muy bajo (${controlCalidad.fillLevel}%)`);
  }
  if ((controlCalidad.cleanlinessScore || 0) < criteriosCalidad.rellenar.cleanlinessScoreMin) {
    razones.push(`limpieza insuficiente (${controlCalidad.cleanlinessScore}/100)`);
  }
  if (controlCalidad.labelCondition === "deteriorado" && 
      !criteriosCalidad.rellenar.labelCondition.includes("deteriorado")) {
    razones.push("etiqueta deteriorada");
  }

  return {
    decision: "desechar",
    razon: `No cumple criterios de ${aerolinea.codigo}: ${razones.join(', ')}`
  };
}

/**
 * Analiza múltiples productos alcohólicos de un pedido
 * 
 * @param productos - Array de productos del pedido
 * @param aerolinea - Aerolínea con criterios de calidad
 * @returns Map con el ID del producto y su análisis
 */
export function analizarProductosPedido(
  productos: Producto[],
  aerolinea: Aerolinea
): Map<string, BottleAnalysisResult> {
  const resultados = new Map<string, BottleAnalysisResult>();
  
  productos.forEach(producto => {
    const analisis = analizarBotellaAutomaticamente(producto, aerolinea);
    resultados.set(producto.idProducto, analisis);
  });
  
  return resultados;
}

/**
 * Obtiene estadísticas de las decisiones tomadas
 */
export function obtenerEstadisticasDecisiones(
  decisiones: Map<string, BottleAnalysisResult>
): {
  reutilizar: number;
  rellenar: number;
  desechar: number;
  total: number;
} {
  const stats = {
    reutilizar: 0,
    rellenar: 0,
    desechar: 0,
    total: decisiones.size
  };

  decisiones.forEach(({ decision }) => {
    stats[decision]++;
  });

  return stats;
}
