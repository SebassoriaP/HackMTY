# Guía de Inicio Rápido - Sistema de Catering

## 🚀 Inicialización de Datos de Ejemplo

### Paso 1: Iniciar la aplicación

```bash
npm run dev
```

### Paso 2: Inicializar datos en Firebase

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Importar función de inicialización
const { inicializarDatosEjemplo } = await import('./src/data/initExampleData.ts');

// Ejecutar inicialización
await inicializarDatosEjemplo();
```

Esto creará 5 pedidos de ejemplo:

1. **AA1234** - American Airlines (JFK → LAX)
   - Criterios estándar: 90% reuse, 60-89% refill
   - Incluye botellas para reutilizar, rellenar y desechar
   
2. **EK5678** - Emirates (DXB → JFK)
   - Criterios estrictos: 95% reuse, sin agregación
   - Productos premium, alta calidad
   
3. **DL9012** - Delta (ATL → LHR)
   - Criterios flexibles: 85% reuse, permite agregación
   - Mix de productos con diferentes estados
   
4. **LA3456** - LATAM (GRU → MIA)
   - Productos latinoamericanos, criterios moderados
   
5. **BA7890** - British Airways (LHR → SFO)
   - Productos británicos premium

## 📦 Flujo de Trabajo

### 1. Buscar Vuelo
En la aplicación, ingresa cualquiera de los números de vuelo arriba.

### 2. Seleccionar Rol
- **PICK**: Recoger items del almacén
- **PACK**: Empacar items en trolley

### 3. Ver Decisiones Automáticas
Si hay bebidas alcohólicas, verás:

```
Control de Calidad - Bebidas Alcohólicas
────────────────────────────────────────

Whisky Chivas Regal (8 uds)     [✓ REUTILIZAR]
  Cumple criterios de AA: 100% llenado, sello sellado, limpieza 98/100

Whisky Jack Daniel's (6 uds)    [↻ RELLENAR]
  85% llenado - puede combinarse con otras botellas (AA)

Vino Blanco Chardonnay (12 uds) [✗ DESECHAR]
  Política corporativa: Vino Blanco Chardonnay abierto debe descartarse
```

### 4. Proceso PICK
- Escanea SKUs para registrar items recogidos
- El sistema rastrea pendientes automáticamente

### 5. Proceso PACK
- Selecciona trolley
- Ve decisiones automáticas de alcohol
- Empaca items usando checklist

## 🎯 Productos por Estado de Calidad

### ✓ REUTILIZAR (excelente estado)
- LIQU_1001: Chivas 100% sellado
- LIQU_1021: Glenfiddich 100% sellado
- LIQU_1022: Belvedere 92% sellado
- LIQU_1023: Diplomático 88% sellado
- LIQU_1025: Patrón 95% sellado
- LIQU_1026: Malbec 100% sellado
- LIQU_1027: Veuve Clicquot 100% sellado
- LIQU_1028: Guinness 100% sellado
- LIQU_1032: Monkey 47 100% sellado
- LIQU_1035: Dom Pérignon 100% sellado
- LIQU_1036: IPA Lagunitas 90% sellado
- LIQU_1038: Ciroc 100% sellado
- LIQU_1040: Roku 96% sellado

### ↻ RELLENAR (parcialmente usado)
- LIQU_1009: Jack Daniel's 85% abierto
- LIQU_1010: Grey Goose 75% abierto
- LIQU_1024: Hendrick's 78% abierto
- LIQU_1029: Macallan 68% abierto
- LIQU_1031: Havana Club 82% abierto
- LIQU_1034: Rosé 72% abierto
- LIQU_1039: Appleton 64% abierto

### ✗ DESECHAR (mal estado o regla corporativa)
- LIQU_1011: Zacapa 60% deteriorado
- LIQU_1013: Vino Blanco 55% **abierto** (vino → desechar)
- LIQU_1014: Prosecco 45% **abierto** (vino → desechar)
- LIQU_1015: Corona 80% **abierto** (cerveza → desechar)
- LIQU_1016: Stella 40% **abierto** (cerveza → desechar)
- LIQU_1030: Stolichnaya 55% deteriorado
- LIQU_1033: Don Julio 58% deteriorado
- LIQU_1037: Jameson 48% deteriorado

## 🔍 Comparación de Decisiones entre Aerolíneas

**Mismo producto: Whisky Macallan (68% abierto, limpieza 82)**

| Aerolínea | Decisión | Razón |
|-----------|----------|-------|
| American (AA) | ✗ DESECHAR | No llega al 90% mínimo |
| Emirates (EK) | ✗ DESECHAR | Muy por debajo del 95% requerido |
| Delta (DL) | ↻ RELLENAR | 68% dentro del rango 55-84% |
| LATAM (LA) | ↻ RELLENAR | 68% dentro del rango 50-87% |
| British (BA) | ✗ DESECHAR | No llega al 92% mínimo |

## 📊 Estadísticas por Pedido

### AA1234 (American Airlines)
- Total items: 12
- Bebidas alcohólicas: 7
- Decisiones:
  - REUTILIZAR: 2 (Chivas, Belvedere)
  - RELLENAR: 2 (Jack, Macallan)
  - DESECHAR: 3 (Vino abierto, Corona, Stoli)

### EK5678 (Emirates - Más estricto)
- Total items: 9
- Bebidas alcohólicas: 6
- Decisiones:
  - REUTILIZAR: 4 (solo los 100% o 95%+)
  - RELLENAR: 0 (criterios muy altos)
  - DESECHAR: 2 (no llegan a 95%)

### DL9012 (Delta - Más flexible)
- Total items: 9
- Bebidas alcohólicas: 6
- Decisiones:
  - REUTILIZAR: 2 (85%+ acepta desde 85%)
  - RELLENAR: 3 (rango amplio 55-84%)
  - DESECHAR: 1 (solo muy deteriorados)

## 🛠️ Desarrollo

### Agregar nuevos productos

Edita `src/data/products.ts`:

```typescript
{
  idProducto: "LIQU_1041",
  nombre: "Nueva Bebida",
  categoria: "BebidasAlcoholicas",
  tamano: 750,
  unidadMedida: "ml",
  gradosAlcohol: 40,
  controlCalidad: {
    fillLevel: 85,        // % de llenado
    sealStatus: "abierto", // "sellado" o "abierto"
    cleanlinessScore: 90,  // 0-100
    labelCondition: "bueno" // "excelente", "bueno", "deteriorado"
  },
  // ... otros campos
}
```

### Agregar nuevas aerolíneas

Edita `src/data/airlines.ts`:

```typescript
{
  codigo: "XX",
  nombre: "Tu Aerolínea",
  politicasAlcohol: {
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

### Crear pedidos manualmente

```javascript
import { crearPedidoCatering } from './src/utils/pedidoHelpers.ts';
import { createPedidoCatering } from './src/firebase/utils.ts';
import { aerolineasData } from './src/data/airlines.ts';
import { productosData } from './src/data/products.ts';

const aerolinea = aerolineasData.find(a => a.codigo === "AA");
const whisky = productosData.find(p => p.idProducto === "LIQU_1001");

const pedido = crearPedidoCatering(
  "TUVUELO",
  aerolinea,
  "TUVUELO",
  "ORG",
  "DST",
  [{ producto: whisky, cantidad: 10 }]
);

await createPedidoCatering(pedido);
```

## 📈 Monitoreo

### Dashboard en tiempo real
Click en "📊 Dashboard" para ver:
- Estadísticas de aerolíneas
- Pedidos activos
- Volumen de alcohol
- Estado de inventario

## 🎓 Conceptos Clave

### Regla Corporativa Inamovible
**Vinos y cervezas abiertos SIEMPRE se desechan**, sin importar su fillLevel o cleanlinessScore.

### Lógica de Decisión
```
PARA CADA BOTELLA:
  SI es vino/cerveza Y está abierta
    → DESECHAR
  SINO SI cumple criterios de REUTILIZAR
    → REUTILIZAR
  SINO SI cumple criterios de RELLENAR
    → RELLENAR
  SINO
    → DESECHAR
```

### Criterios Variables por Aerolínea
Cada aerolínea define sus propios umbrales, permitiendo:
- Emirates: Solo acepta casi perfecto (95%+)
- Delta: Más flexible, permite reutilizar desde 85%
- Diferente tolerancia a agregación de contenido

## ❓ Troubleshooting

**Problema**: No veo decisiones de alcohol en la UI
- **Solución**: Verifica que el pedido tiene `decisionBottleHandling` en items

**Problema**: Firebase no inicializa
- **Solución**: Verifica `src/firebase/config.ts` con credenciales correctas

**Problema**: Decisiones incorrectas
- **Solución**: Revisa criterios en `src/data/airlines.ts` para la aerolínea

## 📚 Recursos

- `BOTTLE_HANDLING_AUTO.md` - Documentación completa del sistema
- `src/utils/bottleAnalysis.ts` - Motor de análisis
- `src/data/initExampleData.ts` - Script de inicialización
