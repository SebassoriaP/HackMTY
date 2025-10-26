# Sistema Automatizado de Análisis de Calidad de Botellas

## 📋 Resumen

Este sistema implementa **análisis automático de calidad de botellas alcohólicas** durante la creación de pedidos de catering, eliminando la necesidad de intervención manual. Cada aerolínea define sus propios criterios de calidad, y el sistema evalúa automáticamente cada botella para determinar si debe ser **reutilizada**, **rellenada** o **desechada**.

## 🔄 Flujo Automatizado

### Antes (Manual)
1. ❌ Crear pedido → Ver lista de botellas → Seleccionar manualmente decisión para cada botella → Confirmar

### Ahora (Automático)
1. ✅ Crear pedido → **Sistema analiza automáticamente según criterios de aerolínea** → Decisiones ya tomadas

## 🎯 Criterios de Decisión

Cada aerolínea define tres conjuntos de criterios en `AlcoholPolicy.criteriosCalidad`:

### 1. REUTILIZAR
Botella puede usarse tal cual está:
- **fillLevelMin**: % mínimo de llenado (ej. 90%)
- **sealStatus**: Estados de sello aceptados (["sellado"])
- **cleanlinessScoreMin**: Score mínimo de limpieza (0-100)
- **labelCondition**: Condiciones de etiqueta aceptadas (["excelente", "bueno"])

### 2. RELLENAR
Botella necesita rellenarse:
- **fillLevelMin**: % mínimo (ej. 60%)
- **fillLevelMax**: % máximo (ej. 89%)
- **sealStatus**: Estados aceptados (["sellado", "abierto"])
- **cleanlinessScoreMin**: Score mínimo
- **labelCondition**: Condiciones aceptadas
- **permitirAgregacion**: Permitir combinar contenido de múltiples botellas

### 3. DESECHAR
Cualquier botella que no cumpla criterios anteriores

**⚠️ REGLA CORPORATIVA OBLIGATORIA**: Vinos y cervezas abiertos **SIEMPRE** se desechan, sin excepciones.

## 📊 Ejemplos de Criterios por Aerolínea

### American Airlines (AA) - Estándar
```typescript
reutilizar: { fillLevelMin: 90%, cleanlinessScoreMin: 85 }
rellenar: { fillLevelMin: 60%, fillLevelMax: 89%, permitirAgregacion: true }
```

### Emirates (EK) - Estricto
```typescript
reutilizar: { fillLevelMin: 95%, cleanlinessScoreMin: 90 }
rellenar: { fillLevelMin: 75%, fillLevelMax: 94%, permitirAgregacion: false }
```

### Delta (DL) - Flexible
```typescript
reutilizar: { fillLevelMin: 85%, cleanlinessScoreMin: 80 }
rellenar: { fillLevelMin: 55%, fillLevelMax: 84%, permitirAgregacion: true }
```

## 🛠️ Archivos Principales

### 1. `src/utils/bottleAnalysis.ts`
**Motor de análisis automático**
- `analizarBotellaAutomaticamente()`: Evalúa una botella según criterios de aerolínea
- `analizarProductosPedido()`: Analiza múltiples productos
- `obtenerEstadisticasDecisiones()`: Genera estadísticas

### 2. `src/utils/pedidoHelpers.ts`
**Creación de pedidos con análisis**
- `crearItemPedido()`: Crea item con decisión automática
- `crearPedidoCatering()`: Crea pedido completo con análisis
- `obtenerEstadisticasPedido()`: Estadísticas del pedido

### 3. `src/data/ejemploPedidos.ts`
**Scripts de ejemplo**
- `crearPedidoEjemplo()`: Crea pedido de prueba con análisis
- `crearPedidosVariasAerolineas()`: Compara criterios entre aerolíneas

### 4. `src/components/AlcoholDecision.tsx`
**Visualización de decisiones**
- Muestra decisiones automáticas con badges de colores
- Verde = REUTILIZAR, Azul = RELLENAR, Rojo = DESECHAR
- Muestra razón de cada decisión

## 📝 Estructura de Datos

### ItemPedido (extendido)
```typescript
interface ItemPedido {
  // ... campos existentes
  
  // NUEVOS: Decisión automática
  decisionBottleHandling?: "reutilizar" | "rellenar" | "desechar";
  razonDecision?: string; // Explicación de la decisión
}
```

### Item (extendido para UI)
```typescript
interface Item {
  // ... campos existentes
  
  // Para mostrar en UI
  bottleDecision?: "reutilizar" | "rellenar" | "desechar";
  bottleReason?: string;
}
```

## 🚀 Uso

### Crear un pedido con análisis automático

```typescript
import { crearPedidoCatering } from './utils/pedidoHelpers';
import { createPedidoCatering } from './firebase/utils';
import { aerolineasData } from './data/airlines';
import { productosData } from './data/products';

// 1. Seleccionar aerolínea
const aerolinea = aerolineasData.find(a => a.codigo === "AA");

// 2. Seleccionar productos
const productosSeleccionados = [
  { producto: productosData.find(p => p.idProducto === "LIQU_1009")!, cantidad: 5 },
  { producto: productosData.find(p => p.idProducto === "LIQU_1010")!, cantidad: 8 },
];

// 3. Crear pedido (análisis automático incluido)
const pedido = crearPedidoCatering(
  "AA1234",
  aerolinea,
  "AA1234",
  "JFK",
  "LAX",
  productosSeleccionados
);

// 4. Guardar en Firebase
await createPedidoCatering(pedido);

// 5. Ver decisiones
pedido.items.forEach(item => {
  console.log(`${item.nombre}: ${item.decisionBottleHandling}`);
  console.log(`  Razón: ${item.razonDecision}`);
});
```

### Usar scripts de ejemplo

```typescript
// En consola del navegador:
import { crearPedidoEjemplo } from './data/ejemploPedidos';
await crearPedidoEjemplo();
```

## 🎨 Visualización en UI

Las decisiones se muestran automáticamente en la vista de Pick:

```
Control de Calidad - Bebidas Alcohólicas
────────────────────────────────────────

Jack Daniel's (5 uds)     [✓ REUTILIZAR]
  Cumple criterios de AA: 85% llenado, sello abierto, limpieza 92/100

Grey Goose (8 uds)        [↻ RELLENAR]
  75% llenado - puede combinarse con otras botellas (AA)

Zacapa (3 uds)            [✗ DESECHAR]
  No cumple criterios de AA: llenado muy bajo (60%), limpieza insuficiente (75/100)
```

## 📈 Lógica de Decisión

```
PARA CADA BOTELLA:
  
  SI es vino/cerveza Y sello == "abierto" Y política.descartarVinosCervezasAbiertas
    → DESECHAR (regla corporativa)
  
  SI NO:
    SI cumple TODOS los criterios de reutilizar
      → REUTILIZAR
    
    SI NO, SI cumple TODOS los criterios de rellenar
      → RELLENAR
    
    SI NO
      → DESECHAR (por defecto)
```

## 🔧 Configuración de Aerolíneas

Editar `src/data/airlines.ts`:

```typescript
{
  codigo: "XX",
  nombre: "Tu Aerolínea",
  politicasAlcohol: {
    // ... otras políticas
    
    criteriosCalidad: {
      reutilizar: {
        fillLevelMin: 90,
        sealStatus: ["sellado"],
        cleanlinessScoreMin: 85,
        labelCondition: ["excelente", "bueno"]
      },
      rellenar: {
        fillLevelMin: 60,
        fillLevelMax: 89,
        sealStatus: ["sellado", "abierto"],
        cleanlinessScoreMin: 75,
        labelCondition: ["excelente", "bueno"],
        permitirAgregacion: true
      },
      descartarVinosCervezasAbiertas: true
    }
  }
}
```

## ✅ Beneficios

1. **Automatización**: Cero intervención manual
2. **Consistencia**: Mismos criterios siempre aplicados
3. **Trazabilidad**: Cada decisión documenta su razón
4. **Flexibilidad**: Cada aerolínea define sus estándares
5. **Transparencia**: UI muestra decisiones y razones claramente

## 🔍 Testing

Comparar decisiones entre aerolíneas:

```typescript
import { crearPedidosVariasAerolineas } from './data/ejemploPedidos';
const pedidos = await crearPedidosVariasAerolineas();

// Verás cómo las mismas botellas reciben diferentes decisiones
// según los criterios de AA, EK, DL, LA
```

## 📚 Referencias

- `types.ts`: Definiciones de `AlcoholPolicy`, `DecisionBottleHandling`, `ItemPedido`
- `airlines.ts`: Datos de 7 aerolíneas con criterios únicos
- `products.ts`: 20 bebidas alcohólicas con estados de calidad variados
- `bottleAnalysis.ts`: Motor de análisis automático
