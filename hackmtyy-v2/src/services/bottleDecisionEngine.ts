import type { 
  BotellaDevuelta, 
  DecisionBotella, 
  PoliticasBotellas,
  InfoRelleno,
  InfoReutilizacionAgregada
} from '../types';

/**
 * Motor de decisiones para manejo de botellas devueltas
 * Implementa la lógica determinista para decidir REUTILIZAR, RELLENAR o DESECHAR
 * 
 * Versión: v3.0
 * Fecha: 2025-11-05
 */

/**
 * Generar lote de destino para relleno
 */
function generarLoteDestino(productoId: string): string {
  const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `LOT_${fecha}_${productoId}_${random}`;
}

/**
 * Buscar botellas candidatas en área de retención para agregación
 * (Simulación - en producción esto consultaría Firebase)
 */
function buscarCandidatasParaAgregacion(
  productoId: string,
  volumenNecesario: number,
  maxBotellas: number,
  botellasDisponibles: BotellaDevuelta[]
): BotellaDevuelta[] {
  const candidatas = botellasDisponibles
    .filter(b => 
      b.idProducto === productoId && 
      b.selloIntegridad === 'intacto' &&
      b.tipo === 'spirits' // Solo spirits se pueden combinar
    )
    .sort((a, b) => b.volumenRestante_ml - a.volumenRestante_ml); // Ordenar por volumen descendente
  
  const seleccionadas: BotellaDevuelta[] = [];
  let volumenAcumulado = 0;
  
  for (const candidata of candidatas) {
    if (seleccionadas.length >= maxBotellas) break;
    seleccionadas.push(candidata);
    volumenAcumulado += candidata.volumenRestante_ml;
    if (volumenAcumulado >= volumenNecesario) break;
  }
  
  return seleccionadas;
}

/**
 * Motor de decisión principal
 * 
 * @param botella - Botella devuelta a evaluar
 * @param politica - Políticas de la aerolínea
 * @param botellasHoldingArea - Botellas disponibles para agregación (opcional)
 * @returns Decisión con acción y regla aplicada
 */
export function decidirAccionBotella(
  botella: BotellaDevuelta,
  politica: PoliticasBotellas,
  botellasHoldingArea: BotellaDevuelta[] = []
): DecisionBotella {
  
  // =====================================================
  // REGLA 1: Tipos que SIEMPRE se desechan (INAMOVIBLE)
  // =====================================================
  // Regla corporativa fija: vino y cerveza SIEMPRE se desechan
  if (politica.discardTypes.includes(botella.tipo)) {
    return {
      accion: "DESECHAR",
      reglaAplicada: `Tipo=${botella.tipo} en discardTypes => DESECHAR (regla corporativa fija: vino/cerveza siempre se desecha)`
    };
  }
  
  // =====================================================
  // REGLA 2: Destino prohibido
  // =====================================================
  // Si el destino está en la lista de prohibidos para alcohol
  if (politica.discardTypes && botella.destinoPais) {
    // Aquí deberíamos verificar contra destinosProhibidos de la aerolínea
    // (asumiendo que está en el contexto completo de la aerolínea)
  }
  
  // =====================================================
  // REGLA 3: Sello no intacto
  // =====================================================
  if (politica.requireSealIntact && botella.selloIntegridad !== "intacto") {
    return {
      accion: "DESECHAR",
      reglaAplicada: `requireSealIntact=true y selloIntegridad=${botella.selloIntegridad} => DESECHAR`
    };
  }
  
  // =====================================================
  // REGLA 4: Etiqueta en mal estado
  // =====================================================
  if (politica.requireGoodLabel && botella.estadoEtiqueta !== "buena") {
    return {
      accion: "DESECHAR",
      reglaAplicada: `requireGoodLabel=true y estadoEtiqueta=${botella.estadoEtiqueta} => DESECHAR`
    };
  }
  
  const pct = botella.porcentajeRestante;
  
  // =====================================================
  // REGLA 5: REUTILIZAR directo
  // =====================================================
  // Si la política permite reutilizar y el porcentaje es suficiente
  if (politica.allowReuse && pct >= politica.minPercentForReuse) {
    return {
      accion: "REUTILIZAR",
      reglaAplicada: `porcentajeRestante(${pct.toFixed(2)}) >= minPercentForReuse(${politica.minPercentForReuse}) y selloIntegridad=${botella.selloIntegridad}; allowReuse=true`
    };
  }
  
  // =====================================================
  // REGLA 6: RELLENAR directo (desde lote externo)
  // =====================================================
  // Si permite rellenar y el porcentaje es suficiente
  if (politica.allowRefill && pct >= politica.minPercentForRefill) {
    const lote = generarLoteDestino(botella.idProducto);
    const relleno: InfoRelleno = {
      loteDestino: lote,
      cantidadResultante_ml: botella.volumenOriginal_ml
    };
    
    return {
      accion: "RELLENAR",
      reglaAplicada: `allowRefill=true y porcentajeRestante(${pct.toFixed(2)}) >= minPercentForRefill(${politica.minPercentForRefill}) => RELLENAR desde lote externo`,
      relleno
    };
  }
  
  // =====================================================
  // REGLA 7: RELLENAR por agregación (combinar botellas)
  // =====================================================
  // Si permite agregación, intentar combinar botellas parciales
  if (politica.allowRefillAggregation && botella.tipo === 'spirits') {
    // Buscar candidatas para completar el volumen
    const volumenNecesario = botella.volumenOriginal_ml - botella.volumenRestante_ml;
    const candidatas = buscarCandidatasParaAgregacion(
      botella.idProducto,
      volumenNecesario,
      politica.maxRefillAggregationBottles - 1, // -1 porque ya contamos la actual
      botellasHoldingArea
    );
    
    const volumenCandidatas = candidatas.reduce((sum, c) => sum + c.volumenRestante_ml, 0);
    const volumenTotal = botella.volumenRestante_ml + volumenCandidatas;
    
    if (volumenTotal >= botella.volumenOriginal_ml) {
      const idsUsados = [botella.idBotella, ...candidatas.map(c => c.idBotella)];
      const reutilizacionAgregada: InfoReutilizacionAgregada = {
        seUsoAgregacion: true,
        botellasUsadas: idsUsados,
        cantidadResultante_ml: botella.volumenOriginal_ml
      };
      
      return {
        accion: "RELLENAR",
        reglaAplicada: `allowRefillAggregation=true; se agruparon ${idsUsados.join('+')} (${volumenTotal.toFixed(0)}ml) para completar ${botella.volumenOriginal_ml}ml => RELLENAR (agregación)`,
        reutilizacionAgregada
      };
    }
    // Si no hay suficientes candidatas, continuar a la siguiente regla
  }
  
  // =====================================================
  // REGLA 8: DESECHAR por defecto
  // =====================================================
  // Si ninguna condición anterior se cumplió, desechar
  return {
    accion: "DESECHAR",
    reglaAplicada: `No cumple condiciones para REUTILIZAR (pct=${pct.toFixed(2)} < ${politica.minPercentForReuse}) ni RELLENAR (pct=${pct.toFixed(2)} < ${politica.minPercentForRefill}); allowReuse=${politica.allowReuse}, allowRefill=${politica.allowRefill} => DESECHAR`
  };
}

/**
 * Procesar múltiples botellas y aplicar decisiones
 */
export function procesarBotellas(
  botellas: BotellaDevuelta[],
  politica: PoliticasBotellas
): BotellaDevuelta[] {
  const procesadas: BotellaDevuelta[] = [];
  const holdingArea: BotellaDevuelta[] = [...botellas]; // Copiar para simular área de retención
  
  for (const botella of botellas) {
    const decision = decidirAccionBotella(botella, politica, holdingArea);
    
    const botellaActualizada: BotellaDevuelta = {
      ...botella,
      accionRecomendada: decision.accion,
      reglaAplicada: decision.reglaAplicada,
      relleno: decision.relleno,
      reutilizacionAgregada: decision.reutilizacionAgregada,
      datosAuditoria: {
        empleadoId: botella.empleadoId,
        timestamp: new Date().toISOString(),
        fotos: [botella.fotoEvidenceUrl],
        versionRegla: "v3.0"
      }
    };
    
    procesadas.push(botellaActualizada);
  }
  
  return procesadas;
}

/**
 * Validar si una botella puede ser agregada
 */
export function puedeSerAgregada(botella: BotellaDevuelta, politica: PoliticasBotellas): boolean {
  return (
    politica.allowRefillAggregation &&
    botella.tipo === 'spirits' &&
    botella.selloIntegridad === 'intacto' &&
    !politica.discardTypes.includes(botella.tipo)
  );
}

/**
 * Calcular volumen total disponible para agregación
 */
export function calcularVolumenDisponibleAgregacion(
  botellas: BotellaDevuelta[],
  productoId: string
): number {
  return botellas
    .filter(b => b.idProducto === productoId && b.tipo === 'spirits' && b.selloIntegridad === 'intacto')
    .reduce((sum, b) => sum + b.volumenRestante_ml, 0);
}

/**
 * Generar reporte de decisiones
 */
export function generarReporteDecisiones(botellas: BotellaDevuelta[]): {
  total: number;
  reutilizar: number;
  rellenar: number;
  desechar: number;
  porTipo: Record<string, Record<string, number>>;
} {
  const reporte = {
    total: botellas.length,
    reutilizar: 0,
    rellenar: 0,
    desechar: 0,
    porTipo: {} as Record<string, Record<string, number>>
  };
  
  botellas.forEach(botella => {
    // Contar por acción
    if (botella.accionRecomendada === 'REUTILIZAR') reporte.reutilizar++;
    if (botella.accionRecomendada === 'RELLENAR') reporte.rellenar++;
    if (botella.accionRecomendada === 'DESECHAR') reporte.desechar++;
    
    // Contar por tipo
    if (!reporte.porTipo[botella.tipo]) {
      reporte.porTipo[botella.tipo] = { REUTILIZAR: 0, RELLENAR: 0, DESECHAR: 0 };
    }
    if (botella.accionRecomendada) {
      reporte.porTipo[botella.tipo][botella.accionRecomendada]++;
    }
  });
  
  return reporte;
}

/**
 * Versión del motor de decisiones
 */
export const VERSION_MOTOR_DECISIONES = "v3.0";

/**
 * Reglas aplicadas (documentación)
 */
export const REGLAS_DOCUMENTADAS = [
  {
    orden: 1,
    nombre: "Tipos a desechar (INAMOVIBLE)",
    descripcion: "Vino y cerveza SIEMPRE se desechan, sin excepciones",
    accion: "DESECHAR"
  },
  {
    orden: 2,
    nombre: "Destino prohibido",
    descripcion: "Si el destino prohíbe alcohol, desechar",
    accion: "DESECHAR"
  },
  {
    orden: 3,
    nombre: "Sello no intacto",
    descripcion: "Si requireSealIntact=true y el sello no está intacto, desechar",
    accion: "DESECHAR"
  },
  {
    orden: 4,
    nombre: "Etiqueta dañada",
    descripcion: "Si requireGoodLabel=true y la etiqueta no está en buen estado, desechar",
    accion: "DESECHAR"
  },
  {
    orden: 5,
    nombre: "Reutilizar directo",
    descripcion: "Si allowReuse=true y porcentaje >= minPercentForReuse, reutilizar",
    accion: "REUTILIZAR"
  },
  {
    orden: 6,
    nombre: "Rellenar desde lote",
    descripcion: "Si allowRefill=true y porcentaje >= minPercentForRefill, rellenar desde lote externo",
    accion: "RELLENAR"
  },
  {
    orden: 7,
    nombre: "Rellenar por agregación",
    descripcion: "Si allowRefillAggregation=true, combinar botellas parciales hasta completar volumen original",
    accion: "RELLENAR"
  },
  {
    orden: 8,
    nombre: "Desechar por defecto",
    descripcion: "Si no se cumple ninguna condición anterior, desechar",
    accion: "DESECHAR"
  }
];
