/**
 * Script para inicializar Firebase con datos de ejemplo
 * Puebla las colecciones de Aerolíneas, Productos, Pedidos de Catering e Inventario
 */

import { 
  createAerolinea, 
  createProducto, 
  createPedidoCatering, 
  createInventario,
  createBotellaDevuelta,
  agregarAlcoholAlmacenado,
  getAllAerolineas,
  getAllProductos,
  getAllPedidosCatering
} from './utils';

import { aerolineasData } from '../data/airlines';
import { aerolineasConPoliticasBotellas } from '../data/airlinesPolicies';
import { productosData } from '../data/products';
import { pedidosCateringData } from '../data/orders';
import { inventarioData } from '../data/inventory';
import { botellasDevueltasEjemplos } from '../data/returnedBottles';
import { alcoholAlmacenadoEjemplo } from '../data/alcoholAlmacenado';

/**
 * Inicializar todas las colecciones con datos de ejemplo
 */
export async function initializeFirebaseData(): Promise<void> {
  console.log('🚀 Iniciando población de Firebase...');

  try {
    // 1. Crear Aerolíneas con políticas completas (usando airlinesPolicies que tiene más datos)
    console.log('\n📋 Creando aerolíneas con políticas completas...');
    for (const aerolineaExtendida of aerolineasConPoliticasBotellas) {
      // Guardar como Aerolinea (Firebase solo guarda las propiedades base)
      // pero Firestore guardará todas las propiedades, incluyendo politicasBotellas
      await createAerolinea(aerolineaExtendida as any);
      console.log(`✅ Aerolínea creada: ${aerolineaExtendida.nombre} (${aerolineaExtendida.codigo})`);
      console.log(`   - Políticas de alcohol: ✓`);
      console.log(`   - Políticas de botellas: ${aerolineaExtendida.politicasBotellas ? '✓' : '✗'}`);
    }
    console.log(`✨ ${aerolineasConPoliticasBotellas.length} aerolíneas creadas con todas las políticas`);

    // 2. Crear Productos
    console.log('\n📦 Creando productos...');
    for (const producto of productosData) {
      await createProducto(producto);
      console.log(`✅ Producto creado: ${producto.nombre} (${producto.idProducto})`);
    }
    console.log(`✨ ${productosData.length} productos creados exitosamente`);

    // 3. Crear Inventario
    console.log('\n📊 Creando registros de inventario...');
    for (const inventario of inventarioData) {
      await createInventario(inventario);
      console.log(`✅ Inventario creado: ${inventario.id} - ${inventario.ubicacion}`);
    }
    console.log(`✨ ${inventarioData.length} registros de inventario creados`);

    // 4. Crear Pedidos de Catering
    console.log('\n✈️ Creando pedidos de catering...');
    for (const pedido of pedidosCateringData) {
      await createPedidoCatering(pedido);
      console.log(`✅ Pedido creado: ${pedido.idPedido} - ${pedido.vuelo} (${pedido.origen} → ${pedido.destino})`);
    }
    console.log(`✨ ${pedidosCateringData.length} pedidos de catering creados`);

    // 5. Crear Botellas Devueltas
    console.log('\n🍾 Creando botellas devueltas...');
    for (const botella of botellasDevueltasEjemplos) {
      await createBotellaDevuelta(botella);
      console.log(`✅ Botella creada: ${botella.idBotella} - ${botella.tipo} (${botella.accionRecomendada})`);
    }
    console.log(`✨ ${botellasDevueltasEjemplos.length} botellas devueltas creadas`);

    // 6. Crear Alcohol Almacenado (NUEVA TABLA)
    console.log('\n� Creando alcohol almacenado...');
    for (const alcohol of alcoholAlmacenadoEjemplo) {
      const id = await agregarAlcoholAlmacenado(alcohol);
      console.log(`✅ Alcohol almacenado: ${alcohol.nombreProducto} - ${alcohol.volumenActual_ml}ml disponibles (ID: ${id})`);
    }
    console.log(`✨ ${alcoholAlmacenadoEjemplo.length} botellas de alcohol almacenado creadas`);

    console.log('\n�🎉 ¡Firebase inicializado exitosamente!');
    
    // Resumen
    console.log('\n📊 RESUMEN DE DATOS CARGADOS:');
    console.log(`   ✈️  Aerolíneas: ${aerolineasConPoliticasBotellas.length} (con políticas completas)`);
    console.log(`   📦 Productos: ${productosData.length}`);
    console.log(`   📊 Inventario: ${inventarioData.length} ubicaciones`);
    console.log(`   🛫 Pedidos: ${pedidosCateringData.length} vuelos`);
    console.log(`   🍾 Botellas Devueltas: ${botellasDevueltasEjemplos.length} botellas`);
    console.log(`   🍷 Alcohol Almacenado: ${alcoholAlmacenadoEjemplo.length} botellas`);
    console.log('\n📍 Datos disponibles en Firebase Firestore');
    console.log('   Colecciones: aerolineas, productos, pedidosCatering, inventario, botellasDevueltas, alcoholAlmacenado');

  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    throw error;
  }
}

/**
 * Verificar si ya existen datos en Firebase
 */
export async function checkExistingData(): Promise<{
  hasAerolineas: boolean;
  hasProductos: boolean;
  hasPedidos: boolean;
}> {
  try {
    const aerolineas = await getAllAerolineas();
    const productos = await getAllProductos();
    const pedidos = await getAllPedidosCatering();

    return {
      hasAerolineas: aerolineas.length > 0,
      hasProductos: productos.length > 0,
      hasPedidos: pedidos.length > 0
    };
  } catch (error) {
    console.error('Error al verificar datos existentes:', error);
    return {
      hasAerolineas: false,
      hasProductos: false,
      hasPedidos: false
    };
  }
}

/**
 * Inicializar solo si no hay datos
 */
export async function initializeIfEmpty(): Promise<boolean> {
  try {
    console.log('🔍 Verificando datos existentes en Firebase...');
    
    // Solo verificar aerolíneas (más rápido) para saber si ya hay datos
    const aerolineas = await getAllAerolineas();
    
    if (aerolineas.length > 0) {
      console.log('ℹ️ Firebase ya contiene datos (aerolíneas encontradas)');
      console.log('⚠️ No se inicializará para evitar duplicados.');
      return false;
    }

    console.log('✅ Firebase está vacío. Procediendo con la inicialización...\n');
    await initializeFirebaseData();
    return true;
  } catch (error) {
    console.error('❌ Error en initializeIfEmpty:', error);
    // No lanzar error - continuar aunque falle
    return false;
  }
}

/**
 * Resumen de estadísticas de los datos
 */
export function getDataStatistics() {
  const bebidasAlcoholicas = productosData.filter(p => p.categoria === 'BebidasAlcoholicas').length;
  const bebidasNoAlcoholicas = productosData.filter(p => p.categoria === 'BebidasNoAlcoholicas').length;
  const snacks = productosData.filter(p => p.categoria === 'Snacks').length;
  const dutyFree = productosData.filter(p => p.categoria === 'DutyFree').length;
  const equipoCabina = productosData.filter(p => p.categoria === 'EquipoCabina').length;

  const pedidosPendientes = pedidosCateringData.filter(p => p.estado === 'pendiente').length;
  const pedidosEnPreparacion = pedidosCateringData.filter(p => p.estado === 'en_preparacion').length;
  const pedidosListos = pedidosCateringData.filter(p => p.estado === 'listo').length;

  const aerolineasConPoliticasBotellas_count = aerolineasConPoliticasBotellas.filter(a => 
    a.politicasBotellas !== undefined
  ).length;

  return {
    aerolíneas: {
      total: aerolineasConPoliticasBotellas.length,
      conRestriccionesAlcohol: aerolineasConPoliticasBotellas.filter(a => 
        a.politicasAlcohol.destinosProhibidos.length > 0
      ).length,
      conPoliticasBotellas: aerolineasConPoliticasBotellas_count
    },
    productos: {
      total: productosData.length,
      bebidasAlcoholicas,
      bebidasNoAlcoholicas,
      snacks,
      dutyFree,
      equipoCabina
    },
    inventario: {
      total: inventarioData.length,
      ubicaciones: [...new Set(inventarioData.map(i => i.ubicacion))].length,
      conAlerta: inventarioData.filter(i => i.alertaStock).length
    },
    pedidos: {
      total: pedidosCateringData.length,
      pendientes: pedidosPendientes,
      enPreparacion: pedidosEnPreparacion,
      listos: pedidosListos
    }
  };
}

/**
 * Mostrar estadísticas de los datos
 */
export function printStatistics(): void {
  const stats = getDataStatistics();
  
  console.log('\n📊 ESTADÍSTICAS DE DATOS DEL SISTEMA\n');
  
  console.log('✈️  AEROLÍNEAS:');
  console.log(`   Total: ${stats.aerolíneas.total}`);
  console.log(`   Con restricciones de alcohol: ${stats.aerolíneas.conRestriccionesAlcohol}`);
  console.log(`   Con políticas de botellas: ${stats.aerolíneas.conPoliticasBotellas}\n`);
  
  console.log('📦 PRODUCTOS:');
  console.log(`   Total: ${stats.productos.total}`);
  console.log(`   - Bebidas Alcohólicas: ${stats.productos.bebidasAlcoholicas}`);
  console.log(`   - Bebidas No Alcohólicas: ${stats.productos.bebidasNoAlcoholicas}`);
  console.log(`   - Snacks: ${stats.productos.snacks}`);
  console.log(`   - Duty-Free: ${stats.productos.dutyFree}`);
  console.log(`   - Equipo de Cabina: ${stats.productos.equipoCabina}\n`);
  
  console.log('📊 INVENTARIO:');
  console.log(`   Registros totales: ${stats.inventario.total}`);
  console.log(`   Ubicaciones: ${stats.inventario.ubicaciones}`);
  console.log(`   Con alerta de stock: ${stats.inventario.conAlerta}\n`);
  
  console.log('🛫 PEDIDOS DE CATERING:');
  console.log(`   Total: ${stats.pedidos.total}`);
  console.log(`   - Pendientes: ${stats.pedidos.pendientes}`);
  console.log(`   - En preparación: ${stats.pedidos.enPreparacion}`);
  console.log(`   - Listos: ${stats.pedidos.listos}\n`);
}
