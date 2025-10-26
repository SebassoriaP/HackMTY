/**
 * Script de inicialización de datos de ejemplo en Firebase
 * Crea pedidos de catering con análisis automático de bottle handling
 * 
 * Para ejecutar:
 * 1. Importar en consola del navegador
 * 2. Ejecutar: await inicializarDatosEjemplo()
 */

import { createPedidoCatering } from '../firebase/utils';
import { crearPedidoCatering } from '../utils/pedidoHelpers';
import { aerolineasData } from './airlines';
import { productosData } from './products';

/**
 * Inicializa Firebase con pedidos de ejemplo para diferentes aerolíneas
 */
export async function inicializarDatosEjemplo() {
  console.log("🚀 Inicializando datos de ejemplo...\n");

  // ============================================
  // PEDIDO 1: American Airlines - AA1234
  // Productos con variedad de estados de calidad
  // ============================================
  const aa = aerolineasData.find(a => a.codigo === "AA");
  if (aa) {
    const pedidoAA = crearPedidoCatering(
      "AA1234",
      aa,
      "AA1234",
      "JFK",
      "LAX",
      [
        // Bebidas alcohólicas con diferentes estados
        { producto: productosData.find(p => p.idProducto === "LIQU_1001")!, cantidad: 8 },  // Chivas 100% sellado → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1009")!, cantidad: 6 },  // Jack 85% abierto → RELLENAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1022")!, cantidad: 4 },  // Belvedere 92% sellado → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1029")!, cantidad: 3 },  // Macallan 68% abierto → RELLENAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1013")!, cantidad: 12 }, // Vino 55% abierto → DESECHAR (vino abierto)
        { producto: productosData.find(p => p.idProducto === "LIQU_1015")!, cantidad: 24 }, // Corona 80% abierto → DESECHAR (cerveza abierta)
        { producto: productosData.find(p => p.idProducto === "LIQU_1030")!, cantidad: 5 },  // Stoli 55% deteriorado → DESECHAR
        
        // Bebidas no alcohólicas
        { producto: productosData.find(p => p.idProducto === "BEB_2001")!, cantidad: 100 }, // Agua
        { producto: productosData.find(p => p.idProducto === "BEB_2002")!, cantidad: 80 },  // Coca-Cola
        { producto: productosData.find(p => p.idProducto === "BEB_2003")!, cantidad: 50 },  // Jugo naranja
        
        // Snacks
        { producto: productosData.find(p => p.idProducto === "SNK_3001")!, cantidad: 60 },  // Nueces
        { producto: productosData.find(p => p.idProducto === "SNK_3003")!, cantidad: 40 },  // Chocolate
      ]
    );

    await createPedidoCatering(pedidoAA);
    console.log("✅ Pedido AA1234 creado (American Airlines)");
    console.log(`   - Items totales: ${pedidoAA.items.length}`);
    console.log(`   - Volumen alcohol: ${pedidoAA.volumenTotalAlcohol}L\n`);
  }

  // ============================================
  // PEDIDO 2: Emirates - EK5678
  // Criterios más estrictos (95% reuse, sin agregación)
  // ============================================
  const ek = aerolineasData.find(a => a.codigo === "EK");
  if (ek) {
    const pedidoEK = crearPedidoCatering(
      "EK5678",
      ek,
      "EK5678",
      "DXB",
      "JFK",
      [
        // Mismos productos para comparar decisiones diferentes
        { producto: productosData.find(p => p.idProducto === "LIQU_1001")!, cantidad: 10 }, // Chivas 100% → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1022")!, cantidad: 6 },  // Belvedere 92% → DESECHAR (no llega a 95%)
        { producto: productosData.find(p => p.idProducto === "LIQU_1023")!, cantidad: 8 },  // Diplomático 88% → DESECHAR (no llega a 95%)
        { producto: productosData.find(p => p.idProducto === "LIQU_1025")!, cantidad: 5 },  // Patrón 95% → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1027")!, cantidad: 4 },  // Veuve Clicquot 100% → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1035")!, cantidad: 2 },  // Dom Pérignon 100% → REUTILIZAR
        
        { producto: productosData.find(p => p.idProducto === "BEB_2001")!, cantidad: 120 },
        { producto: productosData.find(p => p.idProducto === "BEB_2004")!, cantidad: 80 },
        { producto: productosData.find(p => p.idProducto === "SNK_3001")!, cantidad: 70 },
      ]
    );

    await createPedidoCatering(pedidoEK);
    console.log("✅ Pedido EK5678 creado (Emirates)");
    console.log(`   - Items totales: ${pedidoEK.items.length}`);
    console.log(`   - Volumen alcohol: ${pedidoEK.volumenTotalAlcohol}L\n`);
  }

  // ============================================
  // PEDIDO 3: Delta - DL9012
  // Criterios más flexibles (85% reuse, permite agregación)
  // ============================================
  const dl = aerolineasData.find(a => a.codigo === "DL");
  if (dl) {
    const pedidoDL = crearPedidoCatering(
      "DL9012",
      dl,
      "DL9012",
      "ATL",
      "LHR",
      [
        { producto: productosData.find(p => p.idProducto === "LIQU_1009")!, cantidad: 10 }, // Jack 85% → REUTILIZAR (Delta: 85%)
        { producto: productosData.find(p => p.idProducto === "LIQU_1023")!, cantidad: 8 },  // Diplomático 88% → REUTILIZAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1024")!, cantidad: 6 },  // Hendrick's 78% → RELLENAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1029")!, cantidad: 4 },  // Macallan 68% → RELLENAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1031")!, cantidad: 5 },  // Havana 82% → RELLENAR
        { producto: productosData.find(p => p.idProducto === "LIQU_1037")!, cantidad: 3 },  // Jameson 48% → DESECHAR
        
        { producto: productosData.find(p => p.idProducto === "BEB_2001")!, cantidad: 90 },
        { producto: productosData.find(p => p.idProducto === "BEB_2002")!, cantidad: 70 },
        { producto: productosData.find(p => p.idProducto === "SNK_3002")!, cantidad: 50 },
      ]
    );

    await createPedidoCatering(pedidoDL);
    console.log("✅ Pedido DL9012 creado (Delta)");
    console.log(`   - Items totales: ${pedidoDL.items.length}`);
    console.log(`   - Volumen alcohol: ${pedidoDL.volumenTotalAlcohol}L\n`);
  }

  // ============================================
  // PEDIDO 4: LATAM - LA3456
  // ============================================
  const la = aerolineasData.find(a => a.codigo === "LA");
  if (la) {
    const pedidoLA = crearPedidoCatering(
      "LA3456",
      la,
      "LA3456",
      "GRU",
      "MIA",
      [
        { producto: productosData.find(p => p.idProducto === "LIQU_1003")!, cantidad: 8 },  // Bacardi 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1008")!, cantidad: 6 },  // Cuervo 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1023")!, cantidad: 5 },  // Diplomático 88%
        { producto: productosData.find(p => p.idProducto === "LIQU_1026")!, cantidad: 12 }, // Malbec 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1031")!, cantidad: 4 },  // Havana 82%
        { producto: productosData.find(p => p.idProducto === "LIQU_1034")!, cantidad: 8 },  // Rosé 72% abierto
        
        { producto: productosData.find(p => p.idProducto === "BEB_2001")!, cantidad: 85 },
        { producto: productosData.find(p => p.idProducto === "BEB_2003")!, cantidad: 60 },
        { producto: productosData.find(p => p.idProducto === "SNK_3001")!, cantidad: 45 },
      ]
    );

    await createPedidoCatering(pedidoLA);
    console.log("✅ Pedido LA3456 creado (LATAM)");
    console.log(`   - Items totales: ${pedidoLA.items.length}`);
    console.log(`   - Volumen alcohol: ${pedidoLA.volumenTotalAlcohol}L\n`);
  }

  // ============================================
  // PEDIDO 5: British Airways - BA7890
  // ============================================
  const ba = aerolineasData.find(a => a.codigo === "BA");
  if (ba) {
    const pedidoBA = crearPedidoCatering(
      "BA7890",
      ba,
      "BA7890",
      "LHR",
      "SFO",
      [
        { producto: productosData.find(p => p.idProducto === "LIQU_1004")!, cantidad: 6 },  // Bombay 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1021")!, cantidad: 4 },  // Glenfiddich 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1025")!, cantidad: 5 },  // Patrón 95%
        { producto: productosData.find(p => p.idProducto === "LIQU_1032")!, cantidad: 3 },  // Monkey 47 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1038")!, cantidad: 4 },  // Ciroc 100%
        { producto: productosData.find(p => p.idProducto === "LIQU_1040")!, cantidad: 5 },  // Roku 96%
        
        { producto: productosData.find(p => p.idProducto === "BEB_2001")!, cantidad: 95 },
        { producto: productosData.find(p => p.idProducto === "BEB_2005")!, cantidad: 70 },
        { producto: productosData.find(p => p.idProducto === "SNK_3003")!, cantidad: 50 },
      ]
    );

    await createPedidoCatering(pedidoBA);
    console.log("✅ Pedido BA7890 creado (British Airways)");
    console.log(`   - Items totales: ${pedidoBA.items.length}`);
    console.log(`   - Volumen alcohol: ${pedidoBA.volumenTotalAlcohol}L\n`);
  }

  console.log("🎉 ¡Todos los pedidos de ejemplo han sido creados exitosamente!\n");
  console.log("Puedes buscar los siguientes números de vuelo en la aplicación:");
  console.log("  - AA1234 (American Airlines)");
  console.log("  - EK5678 (Emirates)");
  console.log("  - DL9012 (Delta)");
  console.log("  - LA3456 (LATAM)");
  console.log("  - BA7890 (British Airways)");
}

/**
 * Función auxiliar para mostrar decisiones de un pedido
 */
export function mostrarDecisionesPedido(pedidoId: string) {
  // Esta función se puede usar en consola para debug
  console.log(`\n📊 Decisiones de Bottle Handling - Pedido ${pedidoId}`);
  console.log("=" .repeat(60));
}
