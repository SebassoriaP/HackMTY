import { createPedidoCatering } from '../firebase/utils';
import { crearPedidoCatering } from '../utils/pedidoHelpers';
import { aerolineasData } from '../data/airlines';
import { productosData } from '../data/products';

/**
 * Script de ejemplo para crear un pedido de catering con análisis automático
 * de bottle handling
 */
export async function crearPedidoEjemplo() {
  // Seleccionar aerolínea (ejemplo: American Airlines)
  const aerolinea = aerolineasData.find(a => a.codigo === "AA");
  if (!aerolinea) {
    throw new Error("Aerolínea no encontrada");
  }

  // Seleccionar productos alcohólicos para el pedido
  const productosSeleccionados = [
    { producto: productosData.find(p => p.idProducto === "LIQU_1001")!, cantidad: 10 }, // Chivas (100% sellado)
    { producto: productosData.find(p => p.idProducto === "LIQU_1009")!, cantidad: 5 },  // Jack Daniel's (85% abierto)
    { producto: productosData.find(p => p.idProducto === "LIQU_1010")!, cantidad: 8 },  // Grey Goose (75% abierto)
    { producto: productosData.find(p => p.idProducto === "LIQU_1011")!, cantidad: 3 },  // Zacapa (60% deteriorado)
    { producto: productosData.find(p => p.idProducto === "LIQU_1013")!, cantidad: 12 }, // Vino Blanco (55% abierto)
    { producto: productosData.find(p => p.idProducto === "LIQU_1015")!, cantidad: 24 }, // Corona (80% abierto)
    { producto: productosData.find(p => p.idProducto === "LIQU_1016")!, cantidad: 18 }, // Stella (40% abierto)
  ];

  // Crear pedido con análisis automático
  const pedido = crearPedidoCatering(
    "AA1234",                    // ID del pedido (número de vuelo)
    aerolinea,                   // Aerolínea con criterios de calidad
    "AA1234",                    // Número de vuelo
    "JFK",                       // Origen
    "LAX",                       // Destino
    productosSeleccionados       // Productos con cantidades
  );

  // Guardar en Firebase
  await createPedidoCatering(pedido);

  console.log("✅ Pedido creado con análisis automático:");
  console.log("ID:", pedido.idPedido);
  console.log("Aerolínea:", pedido.aerolinea);
  console.log("Items totales:", pedido.items.length);
  
  // Mostrar decisiones automáticas
  console.log("\n📊 Decisiones de Bottle Handling:");
  pedido.items.forEach(item => {
    if (item.decisionBottleHandling) {
      console.log(`  - ${item.nombre}:`);
      console.log(`    Decisión: ${item.decisionBottleHandling.toUpperCase()}`);
      console.log(`    Razón: ${item.razonDecision}`);
    }
  });

  return pedido;
}

/**
 * Crear pedidos de ejemplo para múltiples aerolíneas
 */
export async function crearPedidosVariasAerolineas() {
  const codigosAerolineas = ["AA", "EK", "DL", "LA"];
  const pedidos = [];

  for (const codigo of codigosAerolineas) {
    const aerolinea = aerolineasData.find(a => a.codigo === codigo);
    if (!aerolinea) continue;

    // Seleccionar las mismas botellas para comparar criterios
    const productosSeleccionados = [
      { producto: productosData.find(p => p.idProducto === "LIQU_1009")!, cantidad: 5 },  // Jack 85%
      { producto: productosData.find(p => p.idProducto === "LIQU_1010")!, cantidad: 8 },  // Grey 75%
      { producto: productosData.find(p => p.idProducto === "LIQU_1011")!, cantidad: 3 },  // Zacapa 60%
      { producto: productosData.find(p => p.idProducto === "LIQU_1015")!, cantidad: 24 }, // Corona 80%
    ];

    const pedido = crearPedidoCatering(
      `${codigo}5678`,
      aerolinea,
      `${codigo}5678`,
      "JFK",
      "LHR",
      productosSeleccionados
    );

    await createPedidoCatering(pedido);
    pedidos.push(pedido);

    console.log(`\n✅ Pedido ${codigo} creado con ${pedido.items.length} items`);
  }

  return pedidos;
}

// Para usar en consola del navegador:
// import { crearPedidoEjemplo, crearPedidosVariasAerolineas } from './data/ejemploPedidos';
// await crearPedidoEjemplo();
// await crearPedidosVariasAerolineas();
