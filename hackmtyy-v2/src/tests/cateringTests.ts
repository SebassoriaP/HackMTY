/**
 * Script de prueba del sistema de catering aéreo
 * Ejecuta una serie de pruebas para verificar la funcionalidad
 */

import { 
  initializeIfEmpty,
  getDataStatistics,
  validarPoliticasAlcohol,
  getAerolinea,
  getProductosByCategoria,
  calcularVolumenTotalAlcohol
} from '../firebase/utils';

import type { PedidoCatering } from '../types';

/**
 * Prueba 1: Inicializar y verificar datos
 */
async function test1_VerificarDatos() {
  console.log('\n🧪 PRUEBA 1: Verificar inicialización de datos\n');
  
  await initializeIfEmpty();
  
  const stats = getDataStatistics();
  
  const tests = [
    { nombre: 'Aerolíneas cargadas', esperado: 7, actual: stats.aerolíneas.total },
    { nombre: 'Productos cargados', esperado: 30, actual: stats.productos.total, operador: '>=' },
    { nombre: 'Bebidas alcohólicas', esperado: 8, actual: stats.productos.bebidasAlcoholicas },
    { nombre: 'Pedidos ejemplo', esperado: 5, actual: stats.pedidos.total },
    { nombre: 'Inventario', esperado: 40, actual: stats.inventario.total, operador: '>=' }
  ];
  
  let pasados = 0;
  tests.forEach(test => {
    const operador = test.operador || '===';
    const resultado = operador === '>=' 
      ? test.actual >= test.esperado 
      : test.actual === test.esperado;
    
    if (resultado) {
      console.log(`✅ ${test.nombre}: ${test.actual} ${operador} ${test.esperado}`);
      pasados++;
    } else {
      console.log(`❌ ${test.nombre}: ${test.actual} ${operador} ${test.esperado} (esperado: ${test.esperado})`);
    }
  });
  
  console.log(`\nResultado: ${pasados}/${tests.length} pruebas pasadas\n`);
  return pasados === tests.length;
}

/**
 * Prueba 2: Validar políticas de alcohol - Caso válido
 */
async function test2_ValidacionCorrecta() {
  console.log('\n🧪 PRUEBA 2: Validación de pedido correcto\n');
  
  const pedidoValido: PedidoCatering = {
    idPedido: "TEST_001",
    aerolinea: "AA",
    vuelo: "TEST100",
    fecha: "2025-12-01",
    origen: "JFK",
    destino: "LAX", // Destino permitido
    items: [
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1001",
        nombre: "Whisky Chivas",
        cantidad: 3,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      }
    ],
    volumenTotalAlcohol: 2.25, // Bajo el límite de 5L
    estado: "pendiente"
  };
  
  const validacion = await validarPoliticasAlcohol(pedidoValido);
  
  if (validacion.valido) {
    console.log('✅ Pedido válido correctamente validado');
    console.log(`   Volumen: ${pedidoValido.volumenTotalAlcohol}L / 5L máximo`);
    console.log(`   Destino: ${pedidoValido.destino} (permitido)`);
    return true;
  } else {
    console.log('❌ Pedido válido rechazado incorrectamente');
    console.log('   Errores:', validacion.errores);
    return false;
  }
}

/**
 * Prueba 3: Validar políticas - Volumen excedido
 */
async function test3_VolumenExcedido() {
  console.log('\n🧪 PRUEBA 3: Detectar volumen de alcohol excedido\n');
  
  const pedidoExcedido: PedidoCatering = {
    idPedido: "TEST_002",
    aerolinea: "AA",
    vuelo: "TEST200",
    fecha: "2025-12-01",
    origen: "JFK",
    destino: "LAX",
    items: [
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1001",
        nombre: "Whisky Chivas",
        cantidad: 10, // 10 botellas de 750ml = 7.5L
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      }
    ],
    volumenTotalAlcohol: 7.5, // Excede el límite de 5L
    estado: "pendiente"
  };
  
  const validacion = await validarPoliticasAlcohol(pedidoExcedido);
  
  if (!validacion.valido && validacion.errores.some(e => e.includes('excede'))) {
    console.log('✅ Volumen excedido detectado correctamente');
    console.log(`   Volumen: ${pedidoExcedido.volumenTotalAlcohol}L / 5L máximo`);
    console.log(`   Error: ${validacion.errores[0]}`);
    return true;
  } else {
    console.log('❌ No se detectó el volumen excedido');
    return false;
  }
}

/**
 * Prueba 4: Validar destino prohibido
 */
async function test4_DestinoProhibido() {
  console.log('\n🧪 PRUEBA 4: Detectar destino prohibido\n');
  
  const pedidoProhibido: PedidoCatering = {
    idPedido: "TEST_003",
    aerolinea: "AA",
    vuelo: "TEST300",
    fecha: "2025-12-01",
    origen: "JFK",
    destino: "IR", // Irán - prohibido
    items: [
      {
        categoria: "BebidasAlcoholicas",
        productoId: "LIQU_1001",
        nombre: "Whisky Chivas",
        cantidad: 2,
        volumenUnitario: 0.75,
        contenidoAlcohol: 40
      }
    ],
    volumenTotalAlcohol: 1.5,
    estado: "pendiente"
  };
  
  const validacion = await validarPoliticasAlcohol(pedidoProhibido);
  
  if (!validacion.valido && validacion.errores.some(e => e.includes('prohibido'))) {
    console.log('✅ Destino prohibido detectado correctamente');
    console.log(`   Destino: ${pedidoProhibido.destino} (Irán)`);
    console.log(`   Error: ${validacion.errores[0]}`);
    return true;
  } else {
    console.log('❌ No se detectó el destino prohibido');
    console.log('   Errores recibidos:', validacion.errores);
    return false;
  }
}

/**
 * Prueba 5: Consultar aerolíneas
 */
async function test5_ConsultarAerolineas() {
  console.log('\n🧪 PRUEBA 5: Consultar datos de aerolíneas\n');
  
  const tests = ['AA', 'EK', 'DL', 'LA'];
  let pasados = 0;
  
  for (const codigo of tests) {
    const aerolinea = await getAerolinea(codigo);
    if (aerolinea && aerolinea.politicasAlcohol) {
      console.log(`✅ ${codigo}: ${aerolinea.nombre}`);
      console.log(`   Límite: ${aerolinea.politicasAlcohol.maxVolumenPorPasajero}L`);
      console.log(`   Destinos prohibidos: ${aerolinea.politicasAlcohol.destinosProhibidos.join(', ')}`);
      pasados++;
    } else {
      console.log(`❌ ${codigo}: No encontrada`);
    }
  }
  
  console.log(`\nResultado: ${pasados}/${tests.length} aerolíneas consultadas\n`);
  return pasados === tests.length;
}

/**
 * Prueba 6: Consultar productos por categoría
 */
async function test6_ConsultarProductos() {
  console.log('\n🧪 PRUEBA 6: Consultar productos por categoría\n');
  
  const categorias = [
    { nombre: 'BebidasAlcoholicas', minimo: 8 },
    { nombre: 'BebidasNoAlcoholicas', minimo: 5 },
    { nombre: 'Snacks', minimo: 5 }
  ];
  
  let pasados = 0;
  
  for (const cat of categorias) {
    const productos = await getProductosByCategoria(cat.nombre);
    if (productos.length >= cat.minimo) {
      console.log(`✅ ${cat.nombre}: ${productos.length} productos (mínimo: ${cat.minimo})`);
      pasados++;
    } else {
      console.log(`❌ ${cat.nombre}: ${productos.length} productos (esperado: >=${cat.minimo})`);
    }
  }
  
  console.log(`\nResultado: ${pasados}/${categorias.length} categorías verificadas\n`);
  return pasados === categorias.length;
}

/**
 * Prueba 7: Calcular volumen de alcohol
 */
async function test7_CalcularVolumen() {
  console.log('\n🧪 PRUEBA 7: Calcular volumen total de alcohol\n');
  
  const productos = [
    { productoId: 'LIQU_1001', cantidad: 5 }, // 5 x 750ml = 3.75L
    { productoId: 'LIQU_1007', cantidad: 10 }  // 10 x 330ml = 3.3L
    // Total esperado: 7.05L
  ];
  
  const volumen = calcularVolumenTotalAlcohol(productos);
  const esperado = 7.05;
  const diferencia = Math.abs(volumen - esperado);
  
  if (diferencia < 0.1) {
    console.log(`✅ Cálculo correcto: ${volumen}L (esperado: ${esperado}L)`);
    return true;
  } else {
    console.log(`❌ Cálculo incorrecto: ${volumen}L (esperado: ${esperado}L)`);
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
export async function ejecutarTodasLasPruebas() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 SUITE DE PRUEBAS - SISTEMA DE CATERING AÉREO');
  console.log('='.repeat(60));
  
  const resultados = {
    test1: await test1_VerificarDatos(),
    test2: await test2_ValidacionCorrecta(),
    test3: await test3_VolumenExcedido(),
    test4: await test4_DestinoProhibido(),
    test5: await test5_ConsultarAerolineas(),
    test6: await test6_ConsultarProductos(),
    test7: await test7_CalcularVolumen()
  };
  
  const total = Object.keys(resultados).length;
  const pasadas = Object.values(resultados).filter(r => r).length;
  const porcentaje = ((pasadas / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`Total de pruebas: ${total}`);
  console.log(`Pasadas: ${pasadas} ✅`);
  console.log(`Falladas: ${total - pasadas} ❌`);
  console.log(`Porcentaje de éxito: ${porcentaje}%`);
  console.log('='.repeat(60));
  
  if (pasadas === total) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisa los detalles arriba.');
  }
  
  return { total, pasadas, porcentaje };
}

// Permitir ejecutar directamente
if (require.main === module) {
  ejecutarTodasLasPruebas()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

export default {
  test1_VerificarDatos,
  test2_ValidacionCorrecta,
  test3_VolumenExcedido,
  test4_DestinoProhibido,
  test5_ConsultarAerolineas,
  test6_ConsultarProductos,
  test7_CalcularVolumen,
  ejecutarTodasLasPruebas
};
