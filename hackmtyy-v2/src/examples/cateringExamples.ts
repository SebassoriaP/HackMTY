/**
 * EJEMPLOS DE USO DEL SISTEMA DE CATERING AÉREO
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar
 * las funciones del sistema de Pick & Pack para catering aéreo
 */

import {
  // Funciones de inicialización
  initializeFirebaseData,
  initializeIfEmpty,
  printStatistics,
  
  // Funciones de aerolíneas
  createAerolinea,
  getAerolinea,
  getAllAerolineas,
  
  // Funciones de productos
  createProducto,
  getProductosByCategoria,
  
  // Funciones de pedidos
  createPedidoCatering,
  validarPoliticasAlcohol,
  updatePedidoCatering,
  getPedidosByAerolinea,
  
  // Funciones de inventario
  createInventario,
  actualizarStockPorPedido,
  getProductosStockBajo,
  getInventarioByProducto
} from './firebase/utils';

import { calcularVolumenTotalAlcohol } from './data/products';
import { generarIdPedido } from './data/orders';
import type { PedidoCatering, Aerolinea, Producto } from './types';

// ============================================
// EJEMPLO 1: INICIALIZAR EL SISTEMA
// ============================================

export async function ejemplo1_Inicializar() {
  console.log('📚 EJEMPLO 1: Inicializar Firebase con datos\n');
  
  // Opción A: Inicializar solo si está vacío (recomendado)
  const inicializado = await initializeIfEmpty();
  
  if (inicializado) {
    console.log('✅ Firebase inicializado con éxito');
    printStatistics();
  } else {
    console.log('ℹ️ Firebase ya tenía datos');
  }
  
  // Opción B: Forzar inicialización (cuidado con duplicados)
  // await initializeFirebaseData();
}

// ============================================
// EJEMPLO 2: CONSULTAR AEROLÍNEAS Y SUS POLÍTICAS
// ============================================

export async function ejemplo2_ConsultarAerolineas() {
  console.log('\n📚 EJEMPLO 2: Consultar políticas de aerolíneas\n');
  
  // Obtener todas las aerolíneas
  const aerolineas = await getAllAerolineas();
  console.log(`Total de aerolíneas: ${aerolineas.length}`);
  
  // Consultar una aerolínea específica
  const americanAirlines = await getAerolinea('AA');
  
  if (americanAirlines) {
    console.log('\n✈️ American Airlines:');
    console.log(`  - Límite de alcohol: ${americanAirlines.politicasAlcohol.maxVolumenPorPasajero}L`);
    console.log(`  - Empaque: ${americanAirlines.politicasAlcohol.requisitosEmpaque}`);
    console.log(`  - Destinos prohibidos: ${americanAirlines.politicasAlcohol.destinosProhibidos.join(', ')}`);
    console.log(`  - Documentación: ${americanAirlines.politicasAlcohol.documentacionRequerida.join(', ')}`);
  }
}

// ============================================
// EJEMPLO 3: BUSCAR PRODUCTOS POR CATEGORÍA
// ============================================

export async function ejemplo3_BuscarProductos() {
  console.log('\n📚 EJEMPLO 3: Buscar productos por categoría\n');
  
  // Obtener bebidas alcohólicas
  const bebidasAlcoholicas = await getProductosByCategoria('BebidasAlcoholicas');
  
  console.log(`🍷 Bebidas alcohólicas disponibles: ${bebidasAlcoholicas.length}`);
  bebidasAlcoholicas.forEach((bebida: Producto) => {
    console.log(`  - ${bebida.nombre} (${bebida.marca}): ${bebida.gradosAlcohol}% alcohol, ${bebida.tamano}${bebida.unidadMedida}`);
  });
  
  // Obtener equipo de cabina
  const equipoCabina = await getProductosByCategoria('EquipoCabina');
  console.log(`\n🍴 Equipo de cabina disponible: ${equipoCabina.length}`);
  equipoCabina.forEach((equipo: Producto) => {
    console.log(`  - ${equipo.nombre}: Stock mín ${equipo.stockMinimo}, máx ${equipo.stockMaximo}`);
  });
}

// ============================================
// EJEMPLO 4: CREAR Y VALIDAR UN PEDIDO
// ============================================

export async function ejemplo4_CrearYValidarPedido() {
  console.log('\n📚 EJEMPLO 4: Crear y validar un nuevo pedido\n');
  
  // Crear un nuevo pedido
  const nuevoPedido: PedidoCatering = {
    idPedido: generarIdPedido('AA', 'AA500', '2025-11-20'),
    aerolinea: 'AA',
    vuelo: 'AA500',
    fecha: '2025-11-20',
    origen: 'MIA',
    destino: 'LAX',
    items: [
      {
        categoria: 'BebidasAlcoholicas',
        productoId: 'LIQU_1001',
        nombre: 'Whisky Chivas Regal 12 años',
        marca: 'Chivas',
        cantidad: 3,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      },
      {
        categoria: 'BebidasAlcoholicas',
        productoId: 'LIQU_1007',
        nombre: 'Cerveza Heineken',
        cantidad: 50,
        volumenUnitario: 0.33,
        contenidoAlcohol: 5
      },
      {
        categoria: 'BebidasNoAlcoholicas',
        productoId: 'BEB_2001',
        nombre: 'Agua Mineral Evian',
        cantidad: 100
      },
      {
        categoria: 'Snacks',
        productoId: 'SNK_3001',
        nombre: 'Mix de Nueces Premium',
        cantidad: 80
      }
    ],
    volumenTotalAlcohol: calcularVolumenTotalAlcohol([
      { productoId: 'LIQU_1001', cantidad: 3 },
      { productoId: 'LIQU_1007', cantidad: 50 }
    ]),
    estado: 'pendiente'
  };
  
  console.log('📦 Creando pedido:', nuevoPedido.idPedido);
  console.log(`   Vuelo: ${nuevoPedido.vuelo} (${nuevoPedido.origen} → ${nuevoPedido.destino})`);
  console.log(`   Total ítems: ${nuevoPedido.items.length}`);
  console.log(`   Volumen alcohol: ${nuevoPedido.volumenTotalAlcohol}L`);
  
  // Validar el pedido antes de crearlo
  const validacion = await validarPoliticasAlcohol(nuevoPedido);
  
  if (validacion.valido) {
    console.log('\n✅ Validación exitosa. El pedido cumple con todas las políticas.');
    
    // Crear el pedido en Firebase
    await createPedidoCatering(nuevoPedido);
    console.log('✅ Pedido creado en Firebase');
  } else {
    console.log('\n❌ Validación fallida. Errores encontrados:');
    validacion.errores.forEach(error => console.log(`   - ${error}`));
  }
}

// ============================================
// EJEMPLO 5: PEDIDO A DESTINO PROHIBIDO
// ============================================

export async function ejemplo5_PedidoDestinoProhibido() {
  console.log('\n📚 EJEMPLO 5: Intentar pedido a destino prohibido\n');
  
  const pedidoProhibido: PedidoCatering = {
    idPedido: generarIdPedido('AA', 'AA888', '2025-11-25'),
    aerolinea: 'AA',
    vuelo: 'AA888',
    fecha: '2025-11-25',
    origen: 'JFK',
    destino: 'IR', // Irán - destino prohibido
    items: [
      {
        categoria: 'BebidasAlcoholicas',
        productoId: 'LIQU_1001',
        nombre: 'Whisky Chivas Regal',
        cantidad: 2,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      }
    ],
    volumenTotalAlcohol: 1.5,
    estado: 'pendiente'
  };
  
  console.log('📦 Intentando crear pedido a destino prohibido:');
  console.log(`   Vuelo: ${pedidoProhibido.vuelo} (${pedidoProhibido.origen} → ${pedidoProhibido.destino})`);
  
  const validacion = await validarPoliticasAlcohol(pedidoProhibido);
  
  if (validacion.valido) {
    console.log('✅ Pedido válido');
  } else {
    console.log('\n❌ Validación fallida como se esperaba:');
    validacion.errores.forEach(error => console.log(`   - ${error}`));
  }
}

// ============================================
// EJEMPLO 6: ACTUALIZAR INVENTARIO
// ============================================

export async function ejemplo6_GestionarInventario() {
  console.log('\n📚 EJEMPLO 6: Gestionar inventario\n');
  
  // Ver inventario actual de un producto
  const productoId = 'LIQU_1001';
  const inventarios = await getInventarioByProducto(productoId);
  
  console.log(`📊 Inventario de ${productoId}:`);
  inventarios.forEach(inv => {
    console.log(`   ${inv.ubicacion}: ${inv.cantidadDisponible} unidades`);
    if (inv.alertaStock) {
      console.log(`   ⚠️ ALERTA: Stock bajo!`);
    }
  });
  
  // Verificar productos con stock bajo
  const stockBajo = await getProductosStockBajo();
  
  if (stockBajo.length > 0) {
    console.log(`\n⚠️ Productos con stock bajo: ${stockBajo.length}`);
    stockBajo.forEach(({ producto, inventario }) => {
      console.log(`   - ${producto.nombre}: ${inventario.cantidadDisponible} unidades en ${inventario.ubicacion}`);
    });
  } else {
    console.log('\n✅ Todos los productos tienen stock adecuado');
  }
}

// ============================================
// EJEMPLO 7: ACTUALIZAR ESTADO DE PEDIDO
// ============================================

export async function ejemplo7_ActualizarEstadoPedido() {
  console.log('\n📚 EJEMPLO 7: Actualizar estado de pedido\n');
  
  const idPedido = 'PED_AA100_20251105';
  
  // Cambiar estado a "en preparación"
  await updatePedidoCatering(idPedido, {
    estado: 'en_preparacion'
  });
  console.log(`✅ Pedido ${idPedido} actualizado a: en_preparacion`);
  
  // Simular proceso de preparación...
  console.log('   Preparando ítems...');
  
  // Cambiar estado a "listo"
  await updatePedidoCatering(idPedido, {
    estado: 'listo'
  });
  console.log(`✅ Pedido ${idPedido} actualizado a: listo`);
}

// ============================================
// EJEMPLO 8: CONSULTAR PEDIDOS POR AEROLÍNEA
// ============================================

export async function ejemplo8_ConsultarPedidosPorAerolinea() {
  console.log('\n📚 EJEMPLO 8: Consultar pedidos por aerolínea\n');
  
  const codigoAerolinea = 'AA';
  const pedidos = await getPedidosByAerolinea(codigoAerolinea);
  
  console.log(`✈️ Pedidos de ${codigoAerolinea}: ${pedidos.length}`);
  
  pedidos.forEach(pedido => {
    console.log(`\n   📦 ${pedido.vuelo} - ${pedido.estado}`);
    console.log(`      ${pedido.origen} → ${pedido.destino}`);
    console.log(`      Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`);
    console.log(`      Ítems: ${pedido.items.length}`);
    console.log(`      Alcohol: ${pedido.volumenTotalAlcohol}L`);
  });
}

// ============================================
// EJEMPLO 9: ACTUALIZAR STOCK DESPUÉS DE PEDIDO
// ============================================

export async function ejemplo9_ActualizarStockDespuesPedido() {
  console.log('\n📚 EJEMPLO 9: Actualizar stock después de despachar pedido\n');
  
  // Simular que un pedido fue despachado
  const pedidos = await getPedidosByAerolinea('AA');
  
  if (pedidos.length > 0) {
    const pedido = pedidos[0];
    
    console.log(`📦 Despachando pedido: ${pedido.idPedido}`);
    console.log(`   Ítems en el pedido: ${pedido.items.length}`);
    
    // Actualizar inventario
    await actualizarStockPorPedido(pedido);
    console.log('✅ Stock actualizado para todos los productos');
    
    // Marcar como despachado
    await updatePedidoCatering(pedido.idPedido, {
      estado: 'despachado'
    });
    console.log('✅ Pedido marcado como despachado');
  }
}

// ============================================
// FUNCIÓN PARA EJECUTAR TODOS LOS EJEMPLOS
// ============================================

export async function ejecutarTodosLosEjemplos() {
  console.log('\n🚀 EJECUTANDO TODOS LOS EJEMPLOS DEL SISTEMA\n');
  console.log('='.repeat(60));
  
  try {
    await ejemplo1_Inicializar();
    await ejemplo2_ConsultarAerolineas();
    await ejemplo3_BuscarProductos();
    await ejemplo4_CrearYValidarPedido();
    await ejemplo5_PedidoDestinoProhibido();
    await ejemplo6_GestionarInventario();
    await ejemplo7_ActualizarEstadoPedido();
    await ejemplo8_ConsultarPedidosPorAerolinea();
    await ejemplo9_ActualizarStockDespuesPedido();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error ejecutando ejemplos:', error);
  }
}

// Exportar todos los ejemplos
export default {
  ejemplo1_Inicializar,
  ejemplo2_ConsultarAerolineas,
  ejemplo3_BuscarProductos,
  ejemplo4_CrearYValidarPedido,
  ejemplo5_PedidoDestinoProhibido,
  ejemplo6_GestionarInventario,
  ejemplo7_ActualizarEstadoPedido,
  ejemplo8_ConsultarPedidosPorAerolinea,
  ejemplo9_ActualizarStockDespuesPedido,
  ejecutarTodosLosEjemplos
};
