/**
 * Servicio de Alcohol Bottle Handling
 * 
 * Flujo completo:
 * 1. Verificar si existen botellas remanentes del vuelo
 * 2. Para cada botella, determinar acción según políticas de aerolínea:
 *    - REUTILIZAR: Usar tal cual
 *    - RELLENAR: Completar con alcohol almacenado
 *    - DESECHAR: Eliminar
 * 3. Si RELLENAR: verificar disponibilidad en inventario
 * 4. Actualizar inventario y registros
 * 5. Generar lista actualizada para Pick
 * 6. Loop continuo hasta procesar todas las botellas
 */

import type {
  PedidoCatering,
  Aerolinea,
  AerolineaExtendida,
  Producto,
  BotellaDevuelta,
  DecisionBottleHandling,
  Inventario
} from '../types';

// ============================================
// INTERFACES PARA EL PROCESO
// ============================================

export interface BotellaRemanenteInput {
  idBotella: string;
  productoId: string;
  volumenActual_ml: number;
  volumenCapacidad_ml: number;
  fillLevel: number; // porcentaje 0-100
  sealStatus: 'sellado' | 'abierto';
  cleanlinessScore: number; // 0-100
  labelCondition: 'excelente' | 'bueno' | 'deteriorado';
  vueloOrigen: string;
}

export interface DecisionBotella {
  idBotella: string;
  productoId: string;
  accion: DecisionBottleHandling; // 'reutilizar' | 'rellenar' | 'desechar'
  razon: string;
  volumenActual_ml: number;
  volumenNecesario_ml?: number; // Para rellenar
  cumpleCriterios: {
    reutilizar: boolean;
    rellenar: boolean;
  };
}

export interface OperacionRellenado {
  idBotella: string;
  productoId: string;
  volumenAntes_ml: number;
  volumenRellenado_ml: number;
  volumenDespues_ml: number;
  inventarioUtilizado: {
    ubicacion: string;
    lote: string;
    volumenTomado_ml: number;
  }[];
  exitoso: boolean;
  error?: string;
}

export interface ResultadoProcesamientoBotella {
  idBotella: string;
  productoId: string;
  accion: DecisionBottleHandling;
  exitoso: boolean;
  volumenFinal_ml: number;
  detalles: {
    decision: DecisionBotella;
    operacionRellenado?: OperacionRellenado;
  };
  timestamp: string;
}

export interface ActualizacionPick {
  productoId: string;
  cantidadOriginal: number;
  cantidadReutilizada: number;
  cantidadRellenada: number;
  cantidadDesechada: number;
  cantidadNecesariaComprar: number; // Lo que falta después del procesamiento
}

export interface ResultadoBottleHandling {
  pedidoId: string;
  vueloId: string;
  aerolineaCodigo: string;
  botellasProcessadas: ResultadoProcesamientoBotella[];
  resumen: {
    total: number;
    reutilizadas: number;
    rellenadas: number;
    desechadas: number;
  };
  actualizacionesPick: ActualizacionPick[];
  inventarioActualizado: boolean;
  timestamp: string;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export class BottleHandlingService {
  private aerolinea: AerolineaExtendida;
  private productos: Producto[];
  private inventario: Inventario[];

  constructor(
    aerolinea: AerolineaExtendida,
    productos: Producto[],
    inventario: Inventario[]
  ) {
    this.aerolinea = aerolinea;
    this.productos = productos;
    this.inventario = inventario;
  }

  /**
   * PASO 1: Obtener botellas remanentes del vuelo anterior
   */
  async obtenerBotellasRemanentes(vueloId: string): Promise<BotellaRemanenteInput[]> {
    // En producción: consultar Firebase/base de datos
    // Por ahora, retornar array vacío o mock data
    console.log(`🔍 Buscando botellas remanentes del vuelo ${vueloId}...`);
    
    // TODO: Implementar consulta real a Firebase
    // const botellas = await getBotellasDevueltasByVuelo(vueloId);
    
    return [];
  }

  /**
   * PASO 2: Determinar acción para cada botella según políticas
   */
  determinarAccion(botella: BotellaRemanenteInput): DecisionBotella {
    const producto = this.productos.find(p => p.idProducto === botella.productoId);
    if (!producto) {
      return {
        idBotella: botella.idBotella,
        productoId: botella.productoId,
        accion: 'desechar',
        razon: 'Producto no encontrado en catálogo',
        volumenActual_ml: botella.volumenActual_ml,
        cumpleCriterios: { reutilizar: false, rellenar: false }
      };
    }

    const criterios = this.aerolinea.politicasAlcohol.criteriosCalidad;
    
    // REGLA ESPECIAL: Vinos y cervezas abiertas SIEMPRE se desechan
    const esVinoOCerveza = 
      producto.nombre.toLowerCase().includes('vino') ||
      producto.nombre.toLowerCase().includes('cerveza') ||
      producto.nombre.toLowerCase().includes('prosecco') ||
      producto.nombre.toLowerCase().includes('champagne') ||
      producto.nombre.toLowerCase().includes('beer') ||
      producto.nombre.toLowerCase().includes('wine');

    if (esVinoOCerveza && botella.sealStatus === 'abierto' && criterios.descartarVinosCervezasAbiertas) {
      return {
        idBotella: botella.idBotella,
        productoId: botella.productoId,
        accion: 'desechar',
        razon: `POLÍTICA CORPORATIVA: ${producto.nombre} abierto debe descartarse (vino/cerveza)`,
        volumenActual_ml: botella.volumenActual_ml,
        cumpleCriterios: { reutilizar: false, rellenar: false }
      };
    }

    // Verificar criterios de REUTILIZAR
    const cumpleReutilizar =
      botella.fillLevel >= criterios.reutilizar.fillLevelMin &&
      criterios.reutilizar.sealStatus.includes(botella.sealStatus) &&
      botella.cleanlinessScore >= criterios.reutilizar.cleanlinessScoreMin &&
      criterios.reutilizar.labelCondition.includes(botella.labelCondition);

    if (cumpleReutilizar) {
      return {
        idBotella: botella.idBotella,
        productoId: botella.productoId,
        accion: 'reutilizar',
        razon: `Cumple criterios de ${this.aerolinea.codigo}: ${botella.fillLevel}% llenado, sello ${botella.sealStatus}, limpieza ${botella.cleanlinessScore}/100`,
        volumenActual_ml: botella.volumenActual_ml,
        cumpleCriterios: { reutilizar: true, rellenar: false }
      };
    }

    // Verificar criterios de RELLENAR
    const cumpleRellenar =
      botella.fillLevel >= criterios.rellenar.fillLevelMin &&
      botella.fillLevel <= criterios.rellenar.fillLevelMax &&
      criterios.rellenar.sealStatus.includes(botella.sealStatus) &&
      botella.cleanlinessScore >= criterios.rellenar.cleanlinessScoreMin &&
      criterios.rellenar.labelCondition.includes(botella.labelCondition);

    if (cumpleRellenar) {
      const volumenNecesario = botella.volumenCapacidad_ml - botella.volumenActual_ml;
      return {
        idBotella: botella.idBotella,
        productoId: botella.productoId,
        accion: 'rellenar',
        razon: `${botella.fillLevel}% llenado - Puede rellenarse hasta 100% (${this.aerolinea.codigo})`,
        volumenActual_ml: botella.volumenActual_ml,
        volumenNecesario_ml: volumenNecesario,
        cumpleCriterios: { reutilizar: false, rellenar: true }
      };
    }

    // No cumple ningún criterio → DESECHAR
    return {
      idBotella: botella.idBotella,
      productoId: botella.productoId,
      accion: 'desechar',
      razon: `No cumple criterios mínimos: fillLevel ${botella.fillLevel}%, limpieza ${botella.cleanlinessScore}/100`,
      volumenActual_ml: botella.volumenActual_ml,
      cumpleCriterios: { reutilizar: false, rellenar: false }
    };
  }

  /**
   * PASO 3: Verificar disponibilidad en inventario para rellenar
   */
  async verificarDisponibilidadInventario(
    productoId: string,
    volumenNecesario_ml: number
  ): Promise<{ disponible: boolean; ubicaciones: Inventario[] }> {
    const inventarioProducto = this.inventario.filter(
      inv => inv.productoId === productoId && inv.cantidadDisponible > 0
    );

    const volumenDisponible = inventarioProducto.reduce(
      (total, inv) => {
        const producto = this.productos.find(p => p.idProducto === productoId);
        if (!producto) return total;
        
        // Calcular volumen en ml
        const volumenPorUnidad = producto.tamano * (producto.unidadMedida === 'L' ? 1000 : 1);
        return total + (inv.cantidadDisponible * volumenPorUnidad);
      },
      0
    );

    return {
      disponible: volumenDisponible >= volumenNecesario_ml,
      ubicaciones: inventarioProducto
    };
  }

  /**
   * PASO 4: Ejecutar operación de rellenado
   */
  async ejecutarRellenado(
    decision: DecisionBotella
  ): Promise<OperacionRellenado> {
    if (!decision.volumenNecesario_ml) {
      return {
        idBotella: decision.idBotella,
        productoId: decision.productoId,
        volumenAntes_ml: decision.volumenActual_ml,
        volumenRellenado_ml: 0,
        volumenDespues_ml: decision.volumenActual_ml,
        inventarioUtilizado: [],
        exitoso: false,
        error: 'No se especificó volumen necesario'
      };
    }

    const { disponible, ubicaciones } = await this.verificarDisponibilidadInventario(
      decision.productoId,
      decision.volumenNecesario_ml
    );

    if (!disponible) {
      return {
        idBotella: decision.idBotella,
        productoId: decision.productoId,
        volumenAntes_ml: decision.volumenActual_ml,
        volumenRellenado_ml: 0,
        volumenDespues_ml: decision.volumenActual_ml,
        inventarioUtilizado: [],
        exitoso: false,
        error: 'Inventario insuficiente para rellenar'
      };
    }

    // Simular toma de inventario
    const producto = this.productos.find(p => p.idProducto === decision.productoId)!;
    const volumenPorUnidad = producto.tamano * (producto.unidadMedida === 'L' ? 1000 : 1);
    let volumenRestante = decision.volumenNecesario_ml;
    const inventarioUtilizado: OperacionRellenado['inventarioUtilizado'] = [];

    for (const ubicacion of ubicaciones) {
      if (volumenRestante <= 0) break;

      const volumenDisponible = ubicacion.cantidadDisponible * volumenPorUnidad;
      const volumenTomar = Math.min(volumenRestante, volumenDisponible);
      const unidadesTomar = Math.ceil(volumenTomar / volumenPorUnidad);

      inventarioUtilizado.push({
        ubicacion: ubicacion.ubicacion,
        lote: ubicacion.lote || 'SIN_LOTE',
        volumenTomado_ml: volumenTomar
      });

      // Actualizar inventario (en memoria, luego guardar en DB)
      ubicacion.cantidadDisponible -= unidadesTomar;
      volumenRestante -= volumenTomar;
    }

    return {
      idBotella: decision.idBotella,
      productoId: decision.productoId,
      volumenAntes_ml: decision.volumenActual_ml,
      volumenRellenado_ml: decision.volumenNecesario_ml - volumenRestante,
      volumenDespues_ml: decision.volumenActual_ml + (decision.volumenNecesario_ml - volumenRestante),
      inventarioUtilizado,
      exitoso: volumenRestante === 0
    };
  }

  /**
   * PASO 5: Procesar UNA botella completa
   */
  async procesarBotella(
    botella: BotellaRemanenteInput
  ): Promise<ResultadoProcesamientoBotella> {
    console.log(`\n🍾 Procesando botella ${botella.idBotella}...`);

    // Determinar acción
    const decision = this.determinarAccion(botella);
    console.log(`   Decisión: ${decision.accion.toUpperCase()} - ${decision.razon}`);

    let resultado: ResultadoProcesamientoBotella = {
      idBotella: botella.idBotella,
      productoId: botella.productoId,
      accion: decision.accion,
      exitoso: true,
      volumenFinal_ml: botella.volumenActual_ml,
      detalles: { decision },
      timestamp: new Date().toISOString()
    };

    // Si es RELLENAR, ejecutar operación
    if (decision.accion === 'rellenar') {
      const operacion = await this.ejecutarRellenado(decision);
      resultado.detalles.operacionRellenado = operacion;
      resultado.exitoso = operacion.exitoso;
      resultado.volumenFinal_ml = operacion.volumenDespues_ml;

      if (operacion.exitoso) {
        console.log(`   ✓ Rellenado exitoso: ${operacion.volumenRellenado_ml}ml agregados`);
      } else {
        console.log(`   ✗ Rellenado fallido: ${operacion.error}`);
      }
    }

    return resultado;
  }

  /**
   * PASO 6: Procesar TODAS las botellas (LOOP CONTINUO)
   */
  async procesarTodasLasBotellas(
    botellas: BotellaRemanenteInput[]
  ): Promise<ResultadoProcesamientoBotella[]> {
    console.log(`\n🔄 Iniciando procesamiento de ${botellas.length} botellas...`);
    
    const resultados: ResultadoProcesamientoBotella[] = [];

    for (const botella of botellas) {
      const resultado = await this.procesarBotella(botella);
      resultados.push(resultado);
    }

    console.log(`\n✅ Procesamiento completado: ${resultados.length} botellas procesadas`);
    return resultados;
  }

  /**
   * PASO 7: Generar actualizaciones para la lista Pick
   */
  generarActualizacionesPick(
    pedido: PedidoCatering,
    resultados: ResultadoProcesamientoBotella[]
  ): ActualizacionPick[] {
    const actualizaciones: ActualizacionPick[] = [];

    // Agrupar resultados por producto
    const porProducto = resultados.reduce((acc, resultado) => {
      if (!acc[resultado.productoId]) {
        acc[resultado.productoId] = [];
      }
      acc[resultado.productoId].push(resultado);
      return acc;
    }, {} as Record<string, ResultadoProcesamientoBotella[]>);

    // Calcular actualizaciones
    for (const [productoId, resultadosProducto] of Object.entries(porProducto)) {
      const itemPedido = pedido.items.find(item => item.productoId === productoId);
      if (!itemPedido) continue;

      const cantidadReutilizada = resultadosProducto.filter(
        r => r.accion === 'reutilizar' && r.exitoso
      ).length;

      const cantidadRellenada = resultadosProducto.filter(
        r => r.accion === 'rellenar' && r.exitoso
      ).length;

      const cantidadDesechada = resultadosProducto.filter(
        r => r.accion === 'desechar' || !r.exitoso
      ).length;

      const cantidadNecesariaComprar = Math.max(
        0,
        itemPedido.cantidad - cantidadReutilizada - cantidadRellenada
      );

      actualizaciones.push({
        productoId,
        cantidadOriginal: itemPedido.cantidad,
        cantidadReutilizada,
        cantidadRellenada,
        cantidadDesechada,
        cantidadNecesariaComprar
      });
    }

    return actualizaciones;
  }

  /**
   * PROCESO PRINCIPAL COMPLETO
   */
  async ejecutarProcesoCompleto(
    pedido: PedidoCatering,
    botellasRemanentes: BotellaRemanenteInput[]
  ): Promise<ResultadoBottleHandling> {
    console.log('\n═══════════════════════════════════════');
    console.log('🍾 INICIO PROCESO BOTTLE HANDLING');
    console.log('═══════════════════════════════════════');
    console.log(`Pedido: ${pedido.idPedido}`);
    console.log(`Vuelo: ${pedido.vuelo}`);
    console.log(`Aerolínea: ${this.aerolinea.nombre} (${this.aerolinea.codigo})`);
    console.log(`Botellas remanentes: ${botellasRemanentes.length}`);
    console.log('═══════════════════════════════════════\n');

    // Procesar todas las botellas
    const resultados = await this.procesarTodasLasBotellas(botellasRemanentes);

    // Generar resumen
    const resumen = {
      total: resultados.length,
      reutilizadas: resultados.filter(r => r.accion === 'reutilizar' && r.exitoso).length,
      rellenadas: resultados.filter(r => r.accion === 'rellenar' && r.exitoso).length,
      desechadas: resultados.filter(r => r.accion === 'desechar' || !r.exitoso).length
    };

    // Generar actualizaciones para Pick
    const actualizacionesPick = this.generarActualizacionesPick(pedido, resultados);

    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN DEL PROCESO');
    console.log('═══════════════════════════════════════');
    console.log(`✓ Reutilizadas: ${resumen.reutilizadas}`);
    console.log(`↻ Rellenadas: ${resumen.rellenadas}`);
    console.log(`✗ Desechadas: ${resumen.desechadas}`);
    console.log('═══════════════════════════════════════');

    console.log('\n📦 ACTUALIZACIONES PARA PICK:');
    actualizacionesPick.forEach(act => {
      const producto = this.productos.find(p => p.idProducto === act.productoId);
      console.log(`\n${producto?.nombre || act.productoId}:`);
      console.log(`   Original: ${act.cantidadOriginal}`);
      console.log(`   Reutilizadas: ${act.cantidadReutilizada}`);
      console.log(`   Rellenadas: ${act.cantidadRellenada}`);
      console.log(`   Desechadas: ${act.cantidadDesechada}`);
      console.log(`   Necesario comprar: ${act.cantidadNecesariaComprar}`);
    });

    return {
      pedidoId: pedido.idPedido,
      vueloId: pedido.vuelo,
      aerolineaCodigo: this.aerolinea.codigo,
      botellasProcessadas: resultados,
      resumen,
      actualizacionesPick,
      inventarioActualizado: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Factory function para crear el servicio
 */
export function crearBottleHandlingService(
  aerolinea: AerolineaExtendida,
  productos: Producto[],
  inventario: Inventario[]
): BottleHandlingService {
  return new BottleHandlingService(aerolinea, productos, inventario);
}
