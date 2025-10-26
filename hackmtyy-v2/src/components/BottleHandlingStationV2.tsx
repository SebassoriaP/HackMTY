import { useState, useEffect } from 'react';
import { useCateringContext } from '../context/CateringContext';
import { useFlightContext } from '../context/FlightContext';
import {
  getAlcoholAlmacenadoByProducto,
  agregarAlcoholAlmacenado,
  actualizarVolumenAlcoholAlmacenado,
  marcarAlcoholComoUsado,
  updatePedidoCatering
} from '../firebase/utils';
import { carritoAnteriorEjemplo, filtrarCarritoPorProducto, type BotellaCarritoAnterior } from '../data/carritoAnterior';
import type { 
  PedidoCatering, 
  Producto, 
  Aerolinea,
  AlcoholAlmacenado,
  AccionBotella,
  ItemPedido
} from '../types';

/**
 * ✨ REFACTORIZADO - Estación interactiva de Bottle Handling
 * 
 * Flujo:
 * 1. Detectar pedido con alcohol
 * 2. PREGUNTAR: "¿Hay alcohol remanente del carrito de catering del vuelo anterior?"
 * 3. Si SÍ:
 *    a. Cargar botellas del carrito anterior (data real de carritoAnterior.ts)
 *    b. Mostrar báscula simulada visual
 *    c. Pesar cada botella mostrando peso, estado, limpieza
 *    d. Determinar acción según criterios: REUTILIZAR / RELLENAR / DESECHAR
 *    e. Si RELLENAR → Buscar en almacén (alcoholAlmacenado) para completar
 * 4. Si NO → Comprar todo del inventario
 * 5. Actualizar PICK list automáticamente
 */

interface ProcesamientoBotella {
  producto: Producto;
  cantidadNecesaria: number;
  cantidadReutilizada: number;
  cantidadRellenada: number;
  cantidadDesechada: number;
  cantidadNecesariaComprar: number;
  accion: AccionBotella;
  razon: string;
  botellasCarrito?: BotellaCarritoAnterior[];
  alcoholUsado?: AlcoholAlmacenado[];
}

interface Props {
  onVolverPickPack?: () => void;
}

const BottleHandlingStationV2 = ({ onVolverPickPack }: Props) => {
  const { aerolineas, productos, loading } = useCateringContext();
  const { selectedPedido } = useFlightContext();
  
  // Estado del proceso
  const [paso, setPaso] = useState<'inicial' | 'pregunta' | 'pesaje' | 'procesamiento' | 'completado'>('inicial');
  const [pedidoActual, setPedidoActual] = useState<PedidoCatering | null>(null);
  const [aerolinea, setAerolinea] = useState<Aerolinea | null>(null);
  const [hayAlcoholAnterior, setHayAlcoholAnterior] = useState<boolean | null>(null);
  
  // Datos
  const [carritoAnterior, setCarritoAnterior] = useState<BotellaCarritoAnterior[]>([]);
  const [botellaPesandoIndex, setBotellaPesandoIndex] = useState<number>(0);
  const [alcoholDisponible, setAlcoholDisponible] = useState<AlcoholAlmacenado[]>([]);
  const [productosConAlcohol, setProductosConAlcohol] = useState<Producto[]>([]);
  const [resultadosProcesamiento, setResultadosProcesamiento] = useState<ProcesamientoBotella[]>([]);
  const [indiceProcesando, setIndiceProcesando] = useState<number>(0);
  
  // UI
  const [mensaje, setMensaje] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedPedido) {
      reiniciarEstacion();
      return;
    }
    if (aerolineas.length === 0) {
      setMensaje('⏳ Cargando datos de aerolíneas...');
      return;
    }
    cargarPedido(selectedPedido);
  }, [selectedPedido, aerolineas]);

  const reiniciarEstacion = () => {
    setPaso('inicial');
    setPedidoActual(null);
    setAerolinea(null);
    setHayAlcoholAnterior(null);
    setAlcoholDisponible([]);
    setProductosConAlcohol([]);
    setResultadosProcesamiento([]);
    setIndiceProcesando(0);
    setMensaje('');
    
    // Volver a Pick/Pack
    if (onVolverPickPack) {
      onVolverPickPack();
    }
  };

  const cargarPedido = async (pedido: PedidoCatering) => {
    const tieneAlcohol = pedido.items.some(item =>
      item.categoria === 'BebidasAlcoholicas' ||
      (item.contenidoAlcohol !== undefined && item.contenidoAlcohol > 0)
    );

    if (!tieneAlcohol) {
      setMensaje('✓ Pedido sin alcohol. Pasar a Pick/Pack.');
      setPaso('inicial');
      return;
    }

    const aerolineaPedido = aerolineas.find(a => a.codigo === pedido.aerolinea);
    if (!aerolineaPedido) {
      setMensaje(`❌ No se encontraron políticas para ${pedido.aerolinea}`);
      return;
    }

    setPedidoActual(pedido);
    setAerolinea(aerolineaPedido);
    
    const idsAlcoholicos = pedido.items
      .filter(item => item.categoria === 'BebidasAlcoholicas')
      .map(item => item.productoId);
    
    const productosAlc = productos.filter(p => idsAlcoholicos.includes(p.idProducto));
    setProductosConAlcohol(productosAlc);
    
    // SIEMPRE mostrar pregunta (NO auto-detectar)
    setPaso('pregunta');
    setMensaje(`📦 ${pedido.idPedido} - ${productosAlc.length} producto(s) alcohólico(s)`);
  };

  const responderHayAlcoholAnterior = async (respuesta: boolean) => {
    setHayAlcoholAnterior(respuesta);
    setCargando(true);

    if (!respuesta) {
      // NO hay alcohol del carrito anterior → Comprar todo del inventario
      setCarritoAnterior([]);
      setMensaje('✓ Se comprará todo del inventario');
      setCargando(false);
      setPaso('procesamiento');
      await procesarTodasLasBotellas();
      return;
    }

    // SÍ hay alcohol del carrito anterior → Cargar carrito y mostrar báscula
    console.log('🍾 Usuario confirma: HAY botellas en el carrito del vuelo anterior');
    console.log('📦 Cargando carrito anterior...');
    
    // Filtrar solo las botellas de los productos del pedido actual
    const idsNecesarios = productosConAlcohol.map(p => p.idProducto);
    const botellasDelCarrito = carritoAnteriorEjemplo.filter(b => 
      idsNecesarios.includes(b.productoId)
    );
    
    setCarritoAnterior(botellasDelCarrito);
    setBotellaPesandoIndex(0);
    setMensaje(`⚖️  ${botellasDelCarrito.length} botellas encontradas en el carrito. Iniciando pesaje...`);
    setCargando(false);
    setPaso('pesaje'); // ← Nuevo paso: mostrar báscula
  };

  const procesarTodasLasBotellas = async () => {
    if (!pedidoActual || !aerolinea) return;

    console.log('🚀 Iniciando procesamiento...');
    console.log(`   - Hay alcohol anterior: ${hayAlcoholAnterior ? 'SÍ' : 'NO'}`);
    console.log(`   - Botellas en almacén: ${alcoholDisponible.length}`);
    console.log(`   - Productos a procesar: ${productosConAlcohol.length}`);

    setCargando(true);
    const resultados: ProcesamientoBotella[] = [];

    for (let i = 0; i < productosConAlcohol.length; i++) {
      setIndiceProcesando(i);
      const producto = productosConAlcohol[i];
      const itemPedido = pedidoActual.items.find(item => item.productoId === producto.idProducto);
      const cantidadNecesaria = itemPedido?.cantidad || 0;

      const resultado = await procesarBotella(producto, cantidadNecesaria);
      resultados.push(resultado);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setResultadosProcesamiento(resultados);
    await actualizarPickList(resultados);
    
    // Generar y mostrar alerta detallada
    mostrarAlertaProcesamiento(resultados);
    
    setCargando(false);
    setPaso('completado');
    setMensaje('✅ Completado. Pick list actualizada.');
  };

  // Función para generar y mostrar alerta detallada
  const mostrarAlertaProcesamiento = (resultados: ProcesamientoBotella[]) => {
    if (!aerolinea || !pedidoActual) return;

    const criterios = aerolinea.politicasAlcohol.criteriosCalidad;
    const totalOriginal = resultados.reduce((sum, r) => sum + r.cantidadNecesaria, 0);
    const totalReutilizado = resultados.reduce((sum, r) => sum + r.cantidadReutilizada, 0);
    const totalRellenado = resultados.reduce((sum, r) => sum + r.cantidadRellenada, 0);
    const totalDesechado = resultados.reduce((sum, r) => sum + r.cantidadDesechada, 0);
    const totalComprar = resultados.reduce((sum, r) => sum + r.cantidadNecesariaComprar, 0);
    const ahorroBotellas = totalOriginal - totalComprar;
    const porcentajeAhorro = ((ahorroBotellas / totalOriginal) * 100).toFixed(1);

    const reporte = `
╔════════════════════════════════════════════════════════════╗
║  REPORTE DE PROCESAMIENTO DE ALCOHOL - ${aerolinea.codigo}
╚════════════════════════════════════════════════════════════╝

📋 Pedido: ${pedidoActual.idPedido}
✈️  Aerolínea: ${aerolinea.nombre} (${aerolinea.codigo})
🛫 Ruta: ${pedidoActual.origen} → ${pedidoActual.destino}
📅 Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 CRITERIOS DE CALIDAD APLICADOS (${aerolinea.codigo})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ REUTILIZAR:
   • Nivel de llenado: ≥ ${criterios.reutilizar.fillLevelMin}%
   • Estado del sello: ${criterios.reutilizar.sealStatus.join(', ')}
   • Limpieza mínima: ${criterios.reutilizar.cleanlinessScoreMin}/10
   • Etiqueta: ${criterios.reutilizar.labelCondition.join(', ')}

🔄 RELLENAR:
   • Nivel de llenado: ${criterios.rellenar.fillLevelMin}% - ${criterios.rellenar.fillLevelMax}%
   • Estado del sello: ${criterios.rellenar.sealStatus.join(', ')}
   • Limpieza mínima: ${criterios.rellenar.cleanlinessScoreMin}/10

${criterios.descartarVinosCervezasAbiertas ? '⚠️  POLÍTICA ESPECIAL: Vinos/cervezas abiertas se desechan\n' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 RESULTADOS POR PRODUCTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${resultados.map(r => `
📌 ${r.producto.nombre}:
   Necesarias: ${r.cantidadNecesaria} | Reutilizadas: ${r.cantidadReutilizada} | Rellenadas: ${r.cantidadRellenada} | Desechadas: ${r.cantidadDesechada}
   → 🛒 A COMPRAR: ${r.cantidadNecesariaComprar}
   💡 Decisión: ${r.razon}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 RESUMEN FINANCIERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total original necesario:    ${totalOriginal} botellas
✅ Reutilizadas:                 ${totalReutilizado} botellas
🔄 Rellenadas:                   ${totalRellenado} botellas
🗑️  Desechadas:                  ${totalDesechado} botellas
─────────────────────────────────────────────────
🛒 TOTAL A COMPRAR:              ${totalComprar} botellas

💵 AHORRO: ${ahorroBotellas} botellas (${porcentajeAhorro}% menos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pick list actualizada automáticamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Mostrar en consola
    console.log('\n' + reporte + '\n');

    // Mostrar alerta visual (opcional)
    if (ahorroBotellas > 0) {
      alert(`✅ PROCESAMIENTO COMPLETADO

Pedido: ${pedidoActual.idPedido}
Aerolínea: ${aerolinea.nombre} (${aerolinea.codigo})

RESUMEN:
• Total necesario: ${totalOriginal} botellas
• Reutilizadas: ${totalReutilizado}
• Rellenadas: ${totalRellenado}
• Desechadas: ${totalDesechado}
• A COMPRAR: ${totalComprar}

💰 AHORRO: ${ahorroBotellas} botellas (${porcentajeAhorro}%)

✅ Pick list actualizada automáticamente.
Ver consola para detalles completos.`);
    } else {
      alert(`📋 PROCESAMIENTO COMPLETADO

Pedido: ${pedidoActual.idPedido}
Aerolínea: ${aerolinea.nombre} (${aerolinea.codigo})

ℹ️ No había alcohol almacenado disponible.
Se comprará todo del inventario: ${totalComprar} botellas

✅ Pick list actualizada.`);
    }
  };

  const procesarBotella = async (
    producto: Producto, 
    cantidadNecesaria: number
  ): Promise<ProcesamientoBotella> => {
    const politica = aerolinea!.politicasAlcohol;
    
    let cantidadReutilizada = 0;
    let cantidadRellenada = 0;
    let cantidadDesechada = 0;
    let accion: AccionBotella = 'DESECHAR';
    let razon = '';
    const botellasCarrito: BotellaCarritoAnterior[] = [];
    const alcoholUsadoAlmacen: AlcoholAlmacenado[] = [];

    // PASO 1: SI NO HAY ALCOHOL DEL CARRITO ANTERIOR → Comprar todo del inventario
    if (!hayAlcoholAnterior || carritoAnterior.length === 0) {
      accion = 'DESECHAR'; // Significa "comprar nuevo"
      razon = '🛒 No hay alcohol del carrito anterior, se tomará TODO del inventario';
      return {
        producto,
        cantidadNecesaria,
        cantidadReutilizada: 0,
        cantidadRellenada: 0,
        cantidadDesechada: 0,
        cantidadNecesariaComprar: cantidadNecesaria,
        accion,
        razon,
        botellasCarrito: [],
        alcoholUsado: []
      };
    }

    // PASO 2: Procesar botellas del carrito que fueron pesadas
    console.log(`\n📦 PROCESANDO botellas de ${producto.nombre} del carrito pesado...`);
    
    const botellasDeEsteProducto = carritoAnterior.filter(b => b.productoId === producto.idProducto);
    
    const criteriosReut = politica.criteriosCalidad.reutilizar;
    const criteriosRell = politica.criteriosCalidad.rellenar;
    const descartarVinosAbiertos = politica.criteriosCalidad.descartarVinosCervezasAbiertas;

    const esVinoOCerveza = producto.nombre.toLowerCase().includes('vino') || 
                           producto.nombre.toLowerCase().includes('cerveza') ||
                           producto.nombre.toLowerCase().includes('prosecco') ||
                           producto.nombre.toLowerCase().includes('champagne') ||
                           producto.nombre.toLowerCase().includes('beer');

    for (let i = 0; i < botellasDeEsteProducto.length; i++) {
      const botella = botellasDeEsteProducto[i];
      botellasCarrito.push(botella);

      console.log(`\n   📏 Botella ${i + 1} (${botella.posicionCarrito}):`);
      console.log(`      Peso: ${botella.pesoActual_ml}ml / ${botella.pesoOriginal_ml}ml (${botella.nivelLlenado}%)`);
      console.log(`      Sello: ${botella.estadoSello}, Limpieza: ${botella.limpiezaScore}/10`);

      // REGLA ESPECIAL: Vinos/cervezas abiertas se desechan
      if (esVinoOCerveza && botella.estadoSello === 'abierto' && descartarVinosAbiertos) {
        cantidadDesechada++;
        console.log(`      ❌ DESECHAR: ${producto.categoria} abierta (política aerolínea)`);
        continue;
      }

      // CRITERIO 1: ¿Cumple REUTILIZAR?
      const cumpleReutilizar = 
        botella.nivelLlenado >= criteriosReut.fillLevelMin &&
        criteriosReut.sealStatus.includes(botella.estadoSello) &&
        botella.limpiezaScore >= criteriosReut.cleanlinessScoreMin;

      if (cumpleReutilizar) {
        cantidadReutilizada++;
        console.log(`      ✅ REUTILIZAR: ${botella.nivelLlenado}% lleno, ${botella.estadoSello}`);
        continue;
      }

      // CRITERIO 2: ¿Cumple RELLENAR?
      const cumpleRellenar = 
        botella.nivelLlenado >= criteriosRell.fillLevelMin &&
        botella.nivelLlenado <= criteriosRell.fillLevelMax &&
        criteriosRell.sealStatus.includes(botella.estadoSello) &&
        botella.limpiezaScore >= criteriosRell.cleanlinessScoreMin;

      if (cumpleRellenar) {
        // RELLENAR: Buscar en almacén (alcoholAlmacenado) para completar
        console.log(`      🔄 RELLENAR: ${botella.nivelLlenado}% lleno → buscar en almacén...`);
        
        try {
          const botellasAlmacen = await getAlcoholAlmacenadoByProducto(producto.idProducto);
          
          if (botellasAlmacen.length > 0) {
            const botellaAlmacen = botellasAlmacen[0];
            const volumenFaltante = producto.tamano - botella.pesoActual_ml;
            
            if (botellaAlmacen.volumenActual_ml >= volumenFaltante) {
              // Hay suficiente en almacén para rellenar
              await actualizarVolumenAlcoholAlmacenado(
                botellaAlmacen.id,
                botellaAlmacen.volumenActual_ml - volumenFaltante
              );
              alcoholUsadoAlmacen.push(botellaAlmacen);
              cantidadRellenada++;
              console.log(`         ✓ Rellenada con ${volumenFaltante}ml del almacén`);
            } else {
              // No hay suficiente, desechar
              cantidadDesechada++;
              console.log(`         ✗ Insuficiente en almacén, se desecha`);
            }
          } else {
            // No hay botellas en almacén, desechar
            cantidadDesechada++;
            console.log(`         ✗ No hay botellas en almacén para rellenar`);
          }
        } catch (error) {
          console.error('Error al buscar en almacén:', error);
          cantidadDesechada++;
        }
        continue;
      }

      // CRITERIO 3: No cumple ningún criterio → DESECHAR
      cantidadDesechada++;
      console.log(`      ❌ DESECHAR: No cumple criterios de calidad`);
    }

    // PASO 3: Calcular cuántas botellas FALTAN comprar del inventario
    const cantidadNecesariaComprar = Math.max(0, cantidadNecesaria - cantidadReutilizada - cantidadRellenada);

    // Determinar acción y razón final
    if (cantidadReutilizada > 0 && cantidadRellenada === 0) {
      accion = 'REUTILIZAR';
      razon = `✅ ${cantidadReutilizada} reutilizada(s) del carrito, comprar ${cantidadNecesariaComprar}`;
    } else if (cantidadRellenada > 0 && cantidadReutilizada === 0) {
      accion = 'RELLENAR';
      razon = `🔄 ${cantidadRellenada} rellenada(s) del carrito + almacén, comprar ${cantidadNecesariaComprar}`;
    } else if (cantidadReutilizada > 0 && cantidadRellenada > 0) {
      accion = 'REUTILIZAR';
      razon = `✅ ${cantidadReutilizada} reutilizada(s) + ${cantidadRellenada} rellenada(s), comprar ${cantidadNecesariaComprar}`;
    } else {
      accion = 'DESECHAR';
      razon = `❌ ${cantidadDesechada} desechada(s) del carrito, comprar ${cantidadNecesariaComprar}`;
    }

    console.log(`\n   📊 RESUMEN para ${producto.nombre}:`);
    console.log(`      Necesarias: ${cantidadNecesaria}`);
    console.log(`      Encontradas en carrito: ${botellasDeEsteProducto.length}`);
    console.log(`      Reutilizadas: ${cantidadReutilizada}`);
    console.log(`      Rellenadas: ${cantidadRellenada}`);
    console.log(`      Desechadas: ${cantidadDesechada}`);
    console.log(`      A COMPRAR: ${cantidadNecesariaComprar}`);

    return {
      producto,
      cantidadNecesaria,
      cantidadReutilizada,
      cantidadRellenada,
      cantidadDesechada,
      cantidadNecesariaComprar,
      accion,
      razon,
      botellasCarrito,
      alcoholUsado: alcoholUsadoAlmacen
    };
  };

  const actualizarPickList = async (resultados: ProcesamientoBotella[]) => {
    if (!pedidoActual) return;

    const itemsActualizados: ItemPedido[] = pedidoActual.items.map(item => {
      const resultado = resultados.find(r => r.producto.idProducto === item.productoId);
      if (!resultado) return item;

      return {
        ...item,
        cantidad: resultado.cantidadNecesariaComprar,
        metadata: {
          cantidadOriginal: resultado.cantidadNecesaria,
          cantidadReutilizada: resultado.cantidadReutilizada,
          cantidadRellenada: resultado.cantidadRellenada,
          cantidadDesechada: resultado.cantidadDesechada,
          accionBotella: resultado.accion,
          razonDecision: resultado.razon
        }
      };
    });

    try {
      await updatePedidoCatering(pedidoActual.idPedido, {
        items: itemsActualizados
      });
      console.log('✅ Pick list actualizada');
    } catch (error) {
      console.error('❌ Error actualizando pick list:', error);
    }
  };

  if (loading) {
    return (
      <div className="bottle-handling-station">
        <h2>🍾 Bottle Handling (V2 Interactivo)</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  if (paso === 'inicial') {
    return (
      <div className="bottle-handling-station">
        <h2>🍾 Bottle Handling (V2 Interactivo)</h2>
        {mensaje ? (
          <div className="alert info">{mensaje}</div>
        ) : (
          <p>Seleccione un pedido desde el Dashboard.</p>
        )}
      </div>
    );
  }

  if (paso === 'pregunta') {
    return (
      <div className="bottle-handling-station">
        <h2>🍾 Bottle Handling (V2 Interactivo)</h2>
        
        <div className="pedido-info">
          <h3>📦 Pedido: {pedidoActual?.idPedido}</h3>
          <p>✈️ Aerolínea: {aerolinea?.nombre}</p>
          <p>🛫 Vuelo: {pedidoActual?.vuelo}</p>
        </div>

        <div className="alert warning">
          <p><strong>{productosConAlcohol.length} producto(s) alcohólico(s):</strong></p>
          <ul>
            {productosConAlcohol.map(p => (
              <li key={p.idProducto}>
                {p.nombre} - Cantidad: {
                  pedidoActual?.items.find(i => i.productoId === p.idProducto)?.cantidad || 0
                }
              </li>
            ))}
          </ul>
        </div>

        <div className="pregunta-principal">
          <h3>❓ ¿Hay alcohol remanente del CARRITO DE CATERING del vuelo anterior?</h3>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Esta pregunta se refiere a las botellas que quedan en el carrito de catering después del último vuelo.
            <br />
            Si responde SÍ, se pesarán las botellas para determinar si se reutilizan, rellenan o desechan.
          </p>
          <div className="botones-respuesta">
            <button 
              className="btn btn-success"
              onClick={() => responderHayAlcoholAnterior(true)}
              disabled={cargando}
            >
              ✓ SÍ, hay botellas en el carrito
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => responderHayAlcoholAnterior(false)}
              disabled={cargando}
            >
              ✗ NO, el carrito está vacío
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASO NUEVO: BÁSCULA - Pesar botellas del carrito
  if (paso === 'pesaje') {
    const botellaActual = carritoAnterior[botellaPesandoIndex];
    const totalBotellas = carritoAnterior.length;
    const porcentajePeso = botellaActual ? (botellaActual.pesoActual_ml / botellaActual.pesoOriginal_ml) * 100 : 0;

    const continuarPesaje = async () => {
      if (botellaPesandoIndex < totalBotellas - 1) {
        // Pasar a la siguiente botella
        setBotellaPesandoIndex(botellaPesandoIndex + 1);
      } else {
        // Terminar pesaje, iniciar procesamiento
        setMensaje('✓ Pesaje completado. Procesando según criterios de aerolínea...');
        setPaso('procesamiento');
        await procesarTodasLasBotellas();
      }
    };

    return (
      <div className="bottle-handling-station">
        <h2>⚖️  Báscula de Botellas</h2>
        
        <div className="alert info">
          <p><strong>Pesando botellas del carrito del vuelo {botellaActual?.vueloOrigen}</strong></p>
          <p>Progreso: {botellaPesandoIndex + 1} de {totalBotellas} botellas</p>
        </div>

        {botellaActual && (
          <div className="bascula-container" style={{
            border: '3px solid #1976d2',
            borderRadius: '12px',
            padding: '30px',
            margin: '20px 0',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {/* Pantalla Digital de la Báscula */}
            <div className="bascula-display" style={{
              background: '#000',
              color: '#0f0',
              padding: '20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '24px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '2px solid #333'
            }}>
              <div style={{ fontSize: '14px', color: '#0f0', marginBottom: '10px' }}>
                ━━━━ BÁSCULA DIGITAL ━━━━
              </div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f0' }}>
                {botellaActual.pesoActual_ml} ml
              </div>
              <div style={{ fontSize: '16px', color: '#0f0', marginTop: '5px' }}>
                ({botellaActual.nivelLlenado}% del original)
              </div>
            </div>

            {/* Información de la Botella */}
            <div className="botella-info" style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: 0, color: '#1976d2' }}>
                📍 {botellaActual.posicionCarrito}
              </h3>
              <h4>{botellaActual.nombreProducto}</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                <div>
                  <strong>Peso Original:</strong><br />
                  {botellaActual.pesoOriginal_ml} ml
                </div>
                <div>
                  <strong>Peso Actual:</strong><br />
                  <span style={{ color: porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336', fontWeight: 'bold' }}>
                    {botellaActual.pesoActual_ml} ml
                  </span>
                </div>
                <div>
                  <strong>Estado Sello:</strong><br />
                  <span style={{ color: botellaActual.estadoSello === 'sellado' ? '#4caf50' : '#f44336' }}>
                    {botellaActual.estadoSello === 'sellado' ? '🔒 Sellado' : '🔓 Abierto'}
                  </span>
                </div>
                <div>
                  <strong>Limpieza:</strong><br />
                  <span style={{ color: botellaActual.limpiezaScore >= 9 ? '#4caf50' : botellaActual.limpiezaScore >= 7 ? '#ff9800' : '#f44336' }}>
                    {botellaActual.limpiezaScore}/10
                  </span>
                </div>
                <div>
                  <strong>Etiqueta:</strong><br />
                  {botellaActual.estadoEtiqueta}
                </div>
                <div>
                  <strong>Nivel de Llenado:</strong><br />
                  <div style={{
                    width: '100%',
                    height: '20px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '5px'
                  }}>
                    <div style={{
                      width: `${botellaActual.nivelLlenado}%`,
                      height: '100%',
                      background: porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px' }}>{botellaActual.nivelLlenado}%</span>
                </div>
              </div>
            </div>

            {/* Indicador Visual de Báscula */}
            <div className="bascula-visual" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              height: '150px',
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              position: 'relative'
            }}>
              <div style={{
                width: '100px',
                height: `${porcentajePeso}%`,
                background: `linear-gradient(to top, ${porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336'}, transparent)`,
                borderRadius: '8px 8px 0 0',
                border: '2px solid #333',
                position: 'relative',
                transition: 'height 0.5s ease'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '24px'
                }}>
                  🍾
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={continuarPesaje}
              style={{ marginTop: '20px', width: '100%' }}
            >
              {botellaPesandoIndex < totalBotellas - 1 ? 
                `➡️ Siguiente Botella (${botellaPesandoIndex + 2}/${totalBotellas})` : 
                '✓ Finalizar Pesaje y Procesar'
              }
            </button>
          </div>
        )}
      </div>
    );
  }

  if (paso === 'procesamiento') {
    return (
      <div className="bottle-handling-station">
        <h2>🍾 Bottle Handling (V2 Interactivo)</h2>
        
        <div className="procesamiento-activo">
          <h3>⚙️ Procesando botellas...</h3>
          <div className="progreso">
            <p>Botella {indiceProcesando + 1} de {productosConAlcohol.length}</p>
            {productosConAlcohol[indiceProcesando] && (
              <p className="producto-actual">
                🔄 {productosConAlcohol[indiceProcesando].nombre}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (paso === 'completado') {
    // Generar alerta detallada con criterios de aerolínea
    const generarAlertaDetallada = () => {
      if (!aerolinea) return '';
      
      const criterios = aerolinea.politicasAlcohol.criteriosCalidad;
      const totalOriginal = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadNecesaria, 0);
      const totalReutilizado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadReutilizada, 0);
      const totalRellenado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadRellenada, 0);
      const totalDesechado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadDesechada, 0);
      const totalComprar = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadNecesariaComprar, 0);
      const ahorroBotellas = totalOriginal - totalComprar;
      const porcentajeAhorro = ((ahorroBotellas / totalOriginal) * 100).toFixed(1);

      return `
╔════════════════════════════════════════════════════════════╗
║  REPORTE DE PROCESAMIENTO DE ALCOHOL - ${aerolinea.codigo}
╚════════════════════════════════════════════════════════════╝

📋 Pedido: ${pedidoActual?.idPedido}
✈️  Aerolínea: ${aerolinea.nombre} (${aerolinea.codigo})
📅 Fecha: ${new Date().toLocaleDateString('es-MX')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 CRITERIOS DE CALIDAD APLICADOS (${aerolinea.codigo})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ REUTILIZAR:
   • Nivel de llenado: ≥ ${criterios.reutilizar.fillLevelMin}%
   • Estado del sello: ${criterios.reutilizar.sealStatus.join(', ')}
   • Limpieza mínima: ${criterios.reutilizar.cleanlinessScoreMin}/10
   • Etiqueta: ${criterios.reutilizar.labelCondition.join(', ')}

🔄 RELLENAR:
   • Nivel de llenado: ${criterios.rellenar.fillLevelMin}% - ${criterios.rellenar.fillLevelMax}%
   • Estado del sello: ${criterios.rellenar.sealStatus.join(', ')}
   • Limpieza mínima: ${criterios.rellenar.cleanlinessScoreMin}/10

${criterios.descartarVinosCervezasAbiertas ? '⚠️  POLÍTICA ESPECIAL: Vinos/cervezas abiertas se desechan\n' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 RESULTADOS POR PRODUCTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${resultadosProcesamiento.map(r => `
${r.producto.nombre}:
   Necesarias: ${r.cantidadNecesaria} | Reutilizadas: ${r.cantidadReutilizada} | Rellenadas: ${r.cantidadRellenada} | Desechadas: ${r.cantidadDesechada}
   → A COMPRAR: ${r.cantidadNecesariaComprar}
   Decisión: ${r.razon}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 RESUMEN FINANCIERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total original necesario:    ${totalOriginal} botellas
✅ Reutilizadas:              ${totalReutilizado} botellas
🔄 Rellenadas:                ${totalRellenado} botellas
🗑️  Desechadas:               ${totalDesechado} botellas
─────────────────────────────────────────────────
🛒 TOTAL A COMPRAR:           ${totalComprar} botellas

💵 AHORRO: ${ahorroBotellas} botellas (${porcentajeAhorro}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pick list actualizada automáticamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
    };

    // Mostrar alerta en consola
    console.log(generarAlertaDetallada());

    return (
      <div className="bottle-handling-station">
        <h2>🍾 Bottle Handling (V2 Interactivo)</h2>
        
        <div className="alert success">
          <p><strong>✅ {mensaje}</strong></p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            📋 Pedido: <strong>{pedidoActual?.idPedido}</strong> | 
            ✈️ {aerolinea?.nombre} ({aerolinea?.codigo})
          </p>
        </div>

        {/* Criterios de Aerolínea */}
        {aerolinea && (
          <div className="alert info" style={{ marginTop: '20px', textAlign: 'left' }}>
            <h4 style={{ marginTop: 0 }}>📐 Criterios de Calidad - {aerolinea.codigo}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
              <div>
                <strong>✅ REUTILIZAR:</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                  <li>Llenado: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.fillLevelMin}%</li>
                  <li>Sello: {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.sealStatus.join(', ')}</li>
                  <li>Limpieza: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.cleanlinessScoreMin}/10</li>
                </ul>
              </div>
              <div>
                <strong>🔄 RELLENAR:</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                  <li>Llenado: {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMin}% - {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMax}%</li>
                  <li>Sello: {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.sealStatus.join(', ')}</li>
                  <li>Limpieza: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.cleanlinessScoreMin}/10</li>
                </ul>
              </div>
            </div>
            {aerolinea.politicasAlcohol.criteriosCalidad.descartarVinosCervezasAbiertas && (
              <p style={{ marginTop: '10px', color: '#d32f2f', fontWeight: 'bold' }}>
                ⚠️ Vinos/cervezas abiertas se desechan automáticamente
              </p>
            )}
          </div>
        )}

        <div className="resultados-procesamiento">
          <h3>📊 Resumen de Procesamiento</h3>
          
          <table className="tabla-resultados">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Original</th>
                <th>Reutilizado</th>
                <th>Rellenado</th>
                <th>Desechado</th>
                <th>A Comprar</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {resultadosProcesamiento.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.producto.nombre}</td>
                  <td>{r.cantidadNecesaria}</td>
                  <td className="reutilizado">{r.cantidadReutilizada}</td>
                  <td className="rellenado">{r.cantidadRellenada}</td>
                  <td className="desechado">{r.cantidadDesechada}</td>
                  <td className="comprar"><strong>{r.cantidadNecesariaComprar}</strong></td>
                  <td>
                    <span className={`badge badge-${r.accion.toLowerCase()}`}>
                      {r.accion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="resumen-totales">
            <p>✅ Reutilizado: {resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadReutilizada, 0)}</p>
            <p>🔄 Rellenado: {resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadRellenada, 0)}</p>
            <p>🗑️ Desechado: {resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadDesechada, 0)}</p>
            <p><strong>🛒 A Comprar: {resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadNecesariaComprar, 0)}</strong></p>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={reiniciarEstacion}
        >
          ✓ Continuar a Pick/Pack
        </button>
      </div>
    );
  }

  return null;
};

export default BottleHandlingStationV2;
