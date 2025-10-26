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
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#3c0059', marginBottom: '20px' }}>■ Bottle Handling Station</h2>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3e5ff',
            borderTop: '4px solid #9d4edd',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (paso === 'inicial') {
    return (
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ color: '#3c0059', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px' }}>■</span> Bottle Handling Station
          </h2>
          {mensaje ? (
            <div style={{
              background: 'rgba(157, 78, 221, 0.1)',
              border: '2px solid #9d4edd',
              borderRadius: '8px',
              padding: '20px',
              color: '#3c0059',
              fontSize: '16px'
            }}>
              {mensaje}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '16px' }}>Seleccione un pedido desde el Dashboard para comenzar.</p>
          )}
        </div>
      </div>
    );
  }

  if (paso === 'pregunta') {
    return (
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ 
            color: '#3c0059', 
            marginBottom: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '28px'
          }}>
            <span style={{ fontSize: '32px' }}>■</span> Bottle Handling Station
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>
              ▸ Pedido: {pedidoActual?.idPedido}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '15px' }}>
              <div>■ Aerolínea: {aerolinea?.nombre}</div>
              <div>■ Vuelo: {pedidoActual?.vuelo}</div>
              <div>■ Ruta: {pedidoActual?.origen} → {pedidoActual?.destino}</div>
              <div>■ Productos alcohólicos: {productosConAlcohol.length}</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(157, 78, 221, 0.08)',
            border: '2px solid #9d4edd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#3c0059', marginBottom: '15px' }}>
              Productos detectados:
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {productosConAlcohol.map(p => (
                <div key={p.idProducto} style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#333', fontWeight: '500' }}>{p.nombre}</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    Cantidad: {pedidoActual?.items.find(i => i.productoId === p.idProducto)?.cantidad || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f3e5ff 0%, #e0d1f5 100%)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#3c0059', fontSize: '22px', marginBottom: '15px' }}>
              ¿Hay alcohol remanente del carrito de catering del vuelo anterior?
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
              Esta pregunta se refiere a las botellas que quedan en el carrito de catering después del último vuelo.<br />
              Si responde SÍ, se pesarán las botellas para determinar si se reutilizan, rellenan o desechan.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                className="btn btn-success"
                onClick={() => responderHayAlcoholAnterior(true)}
                disabled={cargando}
                style={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  transition: 'transform 0.2s, boxShadow 0.2s',
                  opacity: cargando ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!cargando) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }}
              >
                ✓ SÍ, hay botellas en el carrito
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => responderHayAlcoholAnterior(false)}
                disabled={cargando}
                style={{
                  background: 'linear-gradient(135deg, #757575 0%, #616161 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(117, 117, 117, 0.3)',
                  transition: 'transform 0.2s, boxShadow 0.2s',
                  opacity: cargando ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!cargando) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(117, 117, 117, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(117, 117, 117, 0.3)';
                }}
              >
                ✗ NO, el carrito está vacío
              </button>
            </div>
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
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '28px'
          }}>
            <span style={{ fontSize: '32px' }}>■</span> Báscula de Botellas
          </h2>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                  ▸ Pesando botellas del vuelo {botellaActual?.vueloOrigen}
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  Progreso: {botellaPesandoIndex + 1} de {totalBotellas} botellas
                </p>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {Math.round((botellaPesandoIndex + 1) / totalBotellas * 100)}%
              </div>
            </div>

            {botellaActual && (
              <div style={{
                border: '3px solid #9d4edd',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'white'
              }}>
                {/* Pantalla Digital de la Báscula */}
                <div style={{
                  background: '#000',
                  color: '#0f0',
                  padding: '30px',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ fontSize: '14px', color: '#0f0', marginBottom: '15px', letterSpacing: '3px' }}>
                    ━━━━ BÁSCULA DIGITAL ━━━━
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0f0', marginBottom: '10px' }}>
                    {botellaActual.pesoActual_ml} ml
                  </div>
                  <div style={{ fontSize: '18px', color: '#0f0' }}>
                    ({botellaActual.nivelLlenado}% del original)
                  </div>
                </div>

                {/* Información de la Botella */}
                <div style={{ padding: '30px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f3e5ff 0%, #e0d1f5 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '25px'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#3c0059', fontSize: '24px' }}>
                      {botellaActual.nombreProducto}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
                      ■ Posición: {botellaActual.posicionCarrito}
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Peso Original</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                        {botellaActual.pesoOriginal_ml} ml
                      </div>
                    </div>
                    <div style={{
                      background: porcentajePeso >= 90 ? '#e8f5e9' : porcentajePeso >= 60 ? '#fff3e0' : '#ffebee',
                      borderRadius: '8px',
                      padding: '20px',
                      border: `2px solid ${porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336'}`
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Peso Actual</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336'
                      }}>
                        {botellaActual.pesoActual_ml} ml
                      </div>
                    </div>
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Estado Sello</div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold',
                        color: botellaActual.estadoSello === 'sellado' ? '#4caf50' : '#f44336'
                      }}>
                        {botellaActual.estadoSello === 'sellado' ? '■ Sellado' : '■ Abierto'}
                      </div>
                    </div>
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Limpieza</div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold',
                        color: botellaActual.limpiezaScore >= 9 ? '#4caf50' : botellaActual.limpiezaScore >= 7 ? '#ff9800' : '#f44336'
                      }}>
                        {botellaActual.limpiezaScore}/10
                      </div>
                    </div>
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Etiqueta</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
                        {botellaActual.estadoEtiqueta}
                      </div>
                    </div>
                    <div style={{
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Nivel de Llenado</div>
                      <div style={{
                        width: '100%',
                        height: '24px',
                        background: '#e0e0e0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginTop: '8px',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${botellaActual.nivelLlenado}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${porcentajePeso >= 90 ? '#4caf50' : porcentajePeso >= 60 ? '#ff9800' : '#f44336'}, ${porcentajePeso >= 90 ? '#45a049' : porcentajePeso >= 60 ? '#f57c00' : '#d32f2f'})`,
                          transition: 'width 0.5s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {botellaActual.nivelLlenado}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={continuarPesaje}
              style={{
                marginTop: '25px',
                width: '100%',
                background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(157, 78, 221, 0.4)',
                transition: 'transform 0.2s, boxShadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(157, 78, 221, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(157, 78, 221, 0.4)';
              }}
            >
              {botellaPesandoIndex < totalBotellas - 1 ? 
                `► Siguiente Botella (${botellaPesandoIndex + 2}/${totalBotellas})` : 
                '✓ Finalizar Pesaje y Procesar'
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paso === 'procesamiento') {
    return (
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '50px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#3c0059', marginBottom: '30px', fontSize: '28px' }}>
            ■ Bottle Handling Station
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, #f3e5ff 0%, #e0d1f5 100%)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#3c0059', fontSize: '22px', marginBottom: '20px' }}>
              Procesando botellas...
            </h3>
            <div className="spinner" style={{
              width: '60px',
              height: '60px',
              border: '5px solid #f3e5ff',
              borderTop: '5px solid #9d4edd',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 25px'
            }}></div>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
              Botella {indiceProcesando + 1} de {productosConAlcohol.length}
            </p>
            {productosConAlcohol[indiceProcesando] && (
              <p style={{ 
                fontSize: '16px', 
                color: '#9d4edd', 
                fontWeight: 'bold',
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '15px'
              }}>
                ► {productosConAlcohol[indiceProcesando].nombre}
              </p>
            )}
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((indiceProcesando + 1) / productosConAlcohol.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #9d4edd 0%, #7b2cbf 100%)',
              transition: 'width 0.3s ease'
            }}></div>
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

    const totalOriginal = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadNecesaria, 0);
    const totalReutilizado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadReutilizada, 0);
    const totalRellenado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadRellenada, 0);
    const totalDesechado = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadDesechada, 0);
    const totalComprar = resultadosProcesamiento.reduce((sum, r) => sum + r.cantidadNecesariaComprar, 0);
    const ahorroBotellas = totalOriginal - totalComprar;
    const porcentajeAhorro = ((ahorroBotellas / totalOriginal) * 100).toFixed(1);

    return (
      <div className="bottle-handling-station" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0026 0%, #3c0059 50%, #1a0026 100%)',
        padding: '40px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '28px'
          }}>
            <span style={{ fontSize: '32px' }}>■</span> Bottle Handling Station
          </h2>

          {/* Success Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
            textAlign: 'center',
            border: '3px solid #4caf50'
          }}>
            <h3 style={{ fontSize: '28px', margin: '0 0 15px 0', color: '#4caf50' }}>
              ✓ Procesamiento Completado
            </h3>
            <p style={{ fontSize: '16px', margin: 0, color: '#333' }}>
              ■ Pedido: <strong>{pedidoActual?.idPedido}</strong> | 
              ■ {aerolinea?.nombre} ({aerolinea?.codigo})
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Original Necesario</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>{totalOriginal}</div>
              <div style={{ fontSize: '13px', color: '#999' }}>botellas</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              border: '2px solid #4caf50'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Reutilizadas</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{totalReutilizado}</div>
              <div style={{ fontSize: '13px', color: '#999' }}>botellas</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              border: '2px solid #ff9800'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Rellenadas</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>{totalRellenado}</div>
              <div style={{ fontSize: '13px', color: '#999' }}>botellas</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              border: '2px solid #f44336'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Desechadas</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336' }}>{totalDesechado}</div>
              <div style={{ fontSize: '13px', color: '#999' }}>botellas</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(157, 78, 221, 0.4)',
              border: '3px solid #9d4edd'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>A Comprar</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9d4edd' }}>{totalComprar}</div>
              <div style={{ fontSize: '13px', color: '#999' }}>botellas</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
              border: '3px solid #4caf50'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Ahorro</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{porcentajeAhorro}%</div>
              <div style={{ fontSize: '13px', color: '#999' }}>{ahorroBotellas} botellas</div>
            </div>
          </div>

          {/* Criterios de Calidad */}
          {aerolinea && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <h4 style={{ margin: '0 0 20px 0', color: '#3c0059', fontSize: '20px' }}>
                ■ Criterios de Calidad - {aerolinea.codigo}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{
                  background: '#e8f5e9',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #4caf50'
                }}>
                  <strong style={{ color: '#4caf50', fontSize: '16px' }}>✓ REUTILIZAR:</strong>
                  <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#333' }}>
                    <li>Llenado: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.fillLevelMin}%</li>
                    <li>Sello: {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.sealStatus.join(', ')}</li>
                    <li>Limpieza: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.reutilizar.cleanlinessScoreMin}/10</li>
                  </ul>
                </div>
                <div style={{
                  background: '#fff3e0',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #ff9800'
                }}>
                  <strong style={{ color: '#ff9800', fontSize: '16px' }}>► RELLENAR:</strong>
                  <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#333' }}>
                    <li>Llenado: {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMin}% - {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMax}%</li>
                    <li>Sello: {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.sealStatus.join(', ')}</li>
                    <li>Limpieza: ≥ {aerolinea.politicasAlcohol.criteriosCalidad.rellenar.cleanlinessScoreMin}/10</li>
                  </ul>
                </div>
              </div>
              {aerolinea.politicasAlcohol.criteriosCalidad.descartarVinosCervezasAbiertas && (
                <p style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  background: '#ffebee', 
                  border: '2px solid #f44336',
                  borderRadius: '8px',
                  color: '#d32f2f', 
                  fontWeight: 'bold',
                  margin: '15px 0 0 0'
                }}>
                  ■ Vinos/cervezas abiertas se desechan automáticamente
                </p>
              )}
            </div>
          )}

          {/* Tabla de Resultados */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            overflowX: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#3c0059', fontSize: '20px' }}>
              ■ Resumen de Procesamiento
            </h3>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 0', color: '#fff', fontWeight: 'bold' }}>Producto</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Original</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Reutilizado</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Rellenado</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Desechado</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>A Comprar</th>
                  <th style={{ padding: '15px', textAlign: 'center', borderRadius: '0 8px 0 0', color: '#fff', fontWeight: 'bold' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {resultadosProcesamiento.map((r, idx) => (
                  <tr key={idx} style={{
                    background: idx % 2 === 0 ? '#f5f5f5' : 'white',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <td style={{ padding: '15px', fontWeight: '500', color: '#333' }}>{r.producto.nombre}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#333' }}>{r.cantidadNecesaria}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#4caf50', fontWeight: 'bold' }}>{r.cantidadReutilizada}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#ff9800', fontWeight: 'bold' }}>{r.cantidadRellenada}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#f44336', fontWeight: 'bold' }}>{r.cantidadDesechada}</td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>{r.cantidadNecesariaComprar}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        background: r.accion === 'REUTILIZAR' ? '#4caf50' : r.accion === 'RELLENAR' ? '#ff9800' : '#757575',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {r.accion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(135deg, #f3e5ff 0%, #e0d1f5 100%)', borderTop: '3px solid #9d4edd' }}>
                  <td style={{ padding: '20px', fontWeight: 'bold', fontSize: '15px', color: '#3c0059' }}>TOTALES</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', color: '#3c0059' }}>{totalOriginal}</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', color: '#4caf50' }}>{totalReutilizado}</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', color: '#ff9800' }}>{totalRellenado}</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', color: '#f44336' }}>{totalDesechado}</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#9d4edd' }}>{totalComprar}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <button 
            onClick={reiniciarEstacion}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
              color: 'white',
              border: 'none',
              padding: '20px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(157, 78, 221, 0.4)',
              transition: 'transform 0.2s, boxShadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(157, 78, 221, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(157, 78, 221, 0.4)';
            }}
          >
            ✓ Continuar a Pick/Pack
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default BottleHandlingStationV2;
