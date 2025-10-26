# 🍾 Bottle Handling V2 - Proceso Interactivo

## 📋 Descripción General

El nuevo sistema de **Bottle Handling V2** introduce un flujo **interactivo** que permite al usuario participar activamente en las decisiones sobre el manejo de alcohol en los vuelos. Este proceso se ejecuta **ANTES** del proceso de Pick & Pack y actualiza automáticamente las cantidades necesarias.

---

## 🎯 Objetivos

1. **Pregunta inicial al usuario**: "¿Hay alcohol anterior del vuelo?"
2. **Consulta de almacén**: Si hay alcohol anterior, cargar la tabla `alcoholAlmacenado`
3. **Procesamiento automático**: Aplicar criterios de la aerolínea para cada botella
4. **Actualización del Pick**: Reducir cantidades necesarias según lo reutilizado/rellenado
5. **Almacenamiento inteligente**: Guardar botellas para uso futuro cuando sea necesario

---

## 🔄 Flujo del Proceso

### 1. **Detección de Pedido con Alcohol**

Cuando se carga un pedido, el sistema detecta si contiene bebidas alcohólicas:

```typescript
const tieneAlcohol = pedido.items.some(item =>
  item.categoria === 'BebidasAlcoholicas' ||
  (item.contenidoAlcohol !== undefined && item.contenidoAlcohol > 0)
);
```

Si **SÍ tiene alcohol** → Pasa a `BottleHandlingStationV2`
Si **NO tiene alcohol** → Pasa directamente a Pick/Pack

---

### 2. **Pregunta Interactiva al Usuario**

El sistema presenta la pregunta:

**❓ ¿Hay alcohol remanente del vuelo anterior?**

- **✓ SÍ** → Carga la tabla `alcoholAlmacenado` de Firebase
- **✗ NO** → Continúa sin verificar almacén (todas las botellas necesarias se comprarán)

---

### 3. **Procesamiento por Criterios de Aerolínea**

Para **cada producto alcohólico** del pedido, el sistema:

#### A. Verifica criterios de **REUTILIZAR**

- **Nivel de llenado** ≥ mínimo (ej. 75%)
- **Estado del sello** = sellado/intacto
- **Puntuación de limpieza** ≥ mínimo (ej. 8/10)
- **Condición de etiqueta** = buena/excelente

✅ **Si cumple** → REUTILIZAR (no se compra, se usa directo)

#### B. Verifica criterios de **RELLENAR**

- **Nivel de llenado** entre min y max (ej. 30-70%)
- **Estado del sello** = permitido por política
- **Puntuación de limpieza** ≥ mínimo
- **Hay alcohol en almacén** del mismo producto

✅ **Si cumple**:
1. Busca botella en `alcoholAlmacenado`
2. Calcula volumen necesario: `volumenNecesario = tamano * cantidad * ((100 - nivelActual) / 100)`
3. **Si hay suficiente**:
   - Actualiza `volumenActual_ml` en Firebase
   - Marca como RELLENADO
4. **Si NO hay suficiente**:
   - Usa el alcohol disponible
   - Guarda la botella actual en `alcoholAlmacenado` para uso futuro

#### C. Regla especial: **Vinos y Cervezas Abiertas**

```typescript
if (esVinoOCerveza && qc.sealStatus === 'abierto' && 
    politica.criteriosCalidad.descartarVinosCervezasAbiertas) {
  accion = 'DESECHAR';
  razon = '⚠️ Política: Vinos/cervezas abiertas se desechan';
}
```

❌ **SIEMPRE se desechan** si la política lo indica

#### D. Por defecto: **DESECHAR**

Si no cumple ningún criterio → DESECHAR

---

### 4. **Actualización Automática del Pick List**

Al finalizar el procesamiento, el sistema actualiza el pedido en Firebase:

```typescript
const itemsActualizados = pedido.items.map(item => {
  const resultado = resultados.find(r => r.producto.idProducto === item.productoId);
  
  return {
    ...item,
    cantidad: resultado.cantidadNecesariaComprar, // ← CANTIDAD REDUCIDA
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

await updatePedidoCatering(pedidoActual.idPedido, { items: itemsActualizados });
```

**Ejemplo**:
- Cantidad original: **10 botellas**
- Reutilizado: **3 botellas**
- Rellenado: **2 botellas**
- → **Cantidad a comprar/Pick: 5 botellas** ✅

---

## 📊 Tabla: `alcoholAlmacenado`

### Estructura

```typescript
interface AlcoholAlmacenado {
  id: string;
  productoId: string;
  nombreProducto: string;
  volumenActual_ml: number;
  volumenOriginal_ml: number;
  nivelLlenado: number; // 0-100
  estadoSello: "sellado" | "abierto";
  estadoEtiqueta: "buena" | "dañada" | "ilegible";
  limpiezaScore: number; // 0-10
  vueloOrigen: string;
  fechaAlmacenamiento: string;
  ubicacionAlmacen: string;
  disponibleParaRellenar: boolean;
  notas?: string;
}
```

### Operaciones

#### 1. **Consultar alcohol disponible**

```typescript
const alcohol = await getAlcoholAlmacenadoByProducto('LIQU_1001');
// Retorna todas las botellas disponibles de ese producto
```

#### 2. **Agregar nueva botella**

```typescript
await agregarAlcoholAlmacenado({
  productoId: 'LIQU_1001',
  nombreProducto: 'Johnnie Walker Black Label',
  volumenActual_ml: 500,
  volumenOriginal_ml: 750,
  nivelLlenado: 67,
  estadoSello: 'abierto',
  // ...
});
```

#### 3. **Actualizar volumen (después de rellenar)**

```typescript
await actualizarVolumenAlcoholAlmacenado(
  'alcohol-id-123',
  300 // nuevo volumen en ml
);
```

#### 4. **Marcar como consumido**

```typescript
await marcarAlcoholComoUsado('alcohol-id-123');
// Establece disponibleParaRellenar = false y volumenActual_ml = 0
```

---

## 🎨 Interfaz de Usuario

### Paso 1: Pregunta Inicial

```
┌──────────────────────────────────────────────┐
│ 🍾 Bottle Handling (V2 Interactivo)         │
├──────────────────────────────────────────────┤
│ 📦 Pedido: PED_AA100_20251105                │
│ ✈️ Aerolínea: American Airlines              │
│ 🛫 Vuelo: AA100                               │
│                                              │
│ ⚠️ 3 producto(s) alcohólico(s):              │
│ • Johnnie Walker Black Label - Cantidad: 10 │
│ • Grey Goose Vodka - Cantidad: 8             │
│ • Bordeaux Rouge Premium - Cantidad: 12     │
│                                              │
│ ❓ ¿Hay alcohol remanente del vuelo anterior?│
│                                              │
│  [✓ SÍ, hay alcohol anterior]               │
│  [✗ NO, no hay alcohol anterior]            │
└──────────────────────────────────────────────┘
```

### Paso 2: Procesamiento

```
┌──────────────────────────────────────────────┐
│ ⚙️ Procesando botellas...                    │
│                                              │
│ Botella 2 de 3                               │
│ 🔄 Grey Goose Vodka                          │
│                                              │
│          ⏳                                  │
└──────────────────────────────────────────────┘
```

### Paso 3: Resultados

```
┌──────────────────────────────────────────────────────────────────────┐
│ 📊 Resumen del Procesamiento                                          │
├──────────────────────────────────────────────────────────────────────┤
│ Producto              │ Orig │ Reut │ Rellen │ Desech │ A Comprar │ │
├──────────────────────────────────────────────────────────────────────┤
│ Johnnie Walker        │  10  │  3   │   2    │   0    │     5     │ │
│ Grey Goose Vodka      │   8  │  0   │   3    │   0    │     5     │ │
│ Bordeaux Rouge        │  12  │  0   │   0    │  12    │     0     │ │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ 📈 Totales:                                                          │
│ ✅ Reutilizado: 3                                                    │
│ 🔄 Rellenado: 5                                                      │
│ 🗑️ Desechado: 12                                                     │
│ 🛒 A Comprar/Pick: 10                                                │
│                                                                      │
│              [✓ Continuar a Pick/Pack]                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Funciones Principales

### `procesarTodasLasBotellas()`

```typescript
const procesarTodasLasBotellas = async () => {
  setCargando(true);
  const resultados: ProcesamientoBotella[] = [];

  // LOOP CONTINUO por todos los productos
  for (let i = 0; i < productosConAlcohol.length; i++) {
    setIndiceProcesando(i);
    const producto = productosConAlcohol[i];
    const cantidadNecesaria = pedidoActual.items.find(
      item => item.productoId === producto.idProducto
    )?.cantidad || 0;

    const resultado = await procesarBotella(producto, cantidadNecesaria);
    resultados.push(resultado);
    
    await new Promise(resolve => setTimeout(resolve, 300)); // UI feedback
  }

  setResultadosProcesamiento(resultados);
  await actualizarPickList(resultados);
  setPaso('completado');
};
```

### `procesarBotella()`

```typescript
const procesarBotella = async (
  producto: Producto, 
  cantidadNecesaria: number
): Promise<ProcesamientoBotella> => {
  // 1. Verificar control de calidad
  // 2. Aplicar regla de vinos/cervezas abiertas
  // 3. Evaluar criterios de reutilizar
  // 4. Evaluar criterios de rellenar
  // 5. Consultar almacén si aplica
  // 6. Ejecutar rellenado o guardar para futuro
  // 7. Calcular cantidades finales
  
  return {
    producto,
    cantidadNecesaria,
    cantidadReutilizada,
    cantidadRellenada,
    cantidadDesechada,
    cantidadNecesariaComprar,
    accion,
    razon
  };
};
```

---

## 📦 Datos de Ejemplo

El sistema incluye datos de ejemplo en `/src/data/alcoholAlmacenado.ts`:

- **8 botellas** pre-cargadas
- Productos: Johnnie Walker, Grey Goose, Bacardi, Jack Daniel's, Bordeaux, Prosecco, Heineken, Tanqueray
- Vuelos de origen: AA100, EK205, DL505, LA800
- Niveles de llenado variados: 27% - 76%

Para cargar estos datos a Firebase:

1. Ve al **Dashboard**
2. Click en **"📥 Cargar Datos a Firebase"**
3. Confirma la acción
4. Los datos se cargarán incluyendo la tabla `alcoholAlmacenado`

---

## ✅ Ventajas del Nuevo Sistema

1. **Interactividad**: Usuario participa en la decisión
2. **Optimización**: Reduce compras innecesarias
3. **Trazabilidad**: Cada decisión se registra con razón
4. **Flexibilidad**: Diferentes criterios por aerolínea
5. **Persistencia**: Almacén de botellas para uso futuro
6. **Automatización**: Pick list se actualiza solo

---

## 🚀 Uso

1. Cargar datos a Firebase desde Dashboard
2. Seleccionar pedido con alcohol (ej. `PED_AA100_20251105`)
3. Sistema redirige automáticamente a Bottle Handling
4. Responder: "¿Hay alcohol anterior?"
5. Esperar procesamiento automático
6. Revisar resultados
7. Click "Continuar a Pick/Pack"
8. Las cantidades en Pick ya están actualizadas ✅

---

## 📚 Archivos Relacionados

- **Componente**: `/src/components/BottleHandlingStationV2.tsx`
- **Tipos**: `/src/types.ts` (AlcoholAlmacenado, ItemPedido.metadata)
- **Firebase**: `/src/firebase/utils.ts` (funciones de alcoholAlmacenado)
- **Datos**: `/src/data/alcoholAlmacenado.ts`
- **Inicialización**: `/src/firebase/initializeData.ts`
- **Estilos**: `/src/styles.css` (sección Bottle Handling V2)

---

## 🎓 Ejemplo Completo

**Pedido**: PED_AA100_20251105
- **Johnnie Walker** (10 botellas necesarias)
  - Almacén: 1 botella con 500ml (67% lleno)
  - Criterio reutilizar: 75% mínimo → ❌ No cumple
  - Criterio rellenar: 30-70% → ✅ Cumple
  - Acción: Rellenar 2 botellas usando 250ml del almacén
  - Resultado: **Comprar 8 botellas** (10 - 2 rellenadas)

- **Bordeaux Rouge** (12 botellas necesarias)
  - Almacén: 1 botella con 200ml (27% lleno, ABIERTA)
  - Criterio: Vino abierto → ⚠️ POLÍTICA: Desechar siempre
  - Acción: DESECHAR
  - Resultado: **Comprar 12 botellas** (sin reducción)

**Pick List actualizado**:
```json
{
  "items": [
    {
      "productoId": "LIQU_1001",
      "cantidad": 8, // ← Reducido de 10
      "metadata": {
        "cantidadOriginal": 10,
        "cantidadRellenada": 2,
        "accionBotella": "RELLENAR"
      }
    },
    {
      "productoId": "WINE_2001",
      "cantidad": 12, // ← Sin cambio
      "metadata": {
        "cantidadOriginal": 12,
        "cantidadDesechada": 12,
        "accionBotella": "DESECHAR"
      }
    }
  ]
}
```

---

**Desarrollado para HackMTY - Sistema de Catering Aéreo Inteligente** 🚀
