# Guía Rápida de Inicio - Sistema de Catering Aéreo

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 2. Inicializar Firebase con Datos de Ejemplo

```typescript
import { initializeIfEmpty } from './src/firebase/initializeData';

// Esto poblará Firebase con datos de ejemplo si está vacío
await initializeIfEmpty();
```

### 3. Uso Básico

#### Consultar Aerolíneas

```typescript
import { getAerolinea, getAllAerolineas } from './src/firebase/utils';

// Obtener todas las aerolíneas
const aerolineas = await getAllAerolineas();

// Obtener una aerolínea específica
const americanAirlines = await getAerolinea('AA');
console.log(americanAirlines.politicasAlcohol.maxVolumenPorPasajero); // 5
```

#### Crear un Pedido de Catering

```typescript
import { createPedidoCatering, validarPoliticasAlcohol } from './src/firebase/utils';

const pedido = {
  idPedido: "PED_AA200_20251120",
  aerolinea: "AA",
  vuelo: "AA200",
  fecha: "2025-11-20",
  origen: "JFK",
  destino: "LAX",
  items: [
    {
      categoria: "BebidasAlcoholicas",
      productoId: "LIQU_1001",
      nombre: "Whisky Chivas Regal",
      cantidad: 5,
      volumenUnitario: 0.75,
      contenidoAlcohol: 40
    }
  ],
  volumenTotalAlcohol: 3.75,
  estado: "pendiente"
};

// Validar antes de crear
const validacion = await validarPoliticasAlcohol(pedido);
if (validacion.valido) {
  await createPedidoCatering(pedido);
  console.log('✅ Pedido creado');
} else {
  console.error('❌ Errores:', validacion.errores);
}
```

#### Gestionar Inventario

```typescript
import { 
  getInventarioByProducto, 
  actualizarStockPorPedido,
  getProductosStockBajo 
} from './src/firebase/utils';

// Ver inventario de un producto
const inventario = await getInventarioByProducto('LIQU_1001');

// Actualizar stock después de despachar un pedido
await actualizarStockPorPedido(pedido);

// Ver productos con stock bajo
const stockBajo = await getProductosStockBajo();
```

## 📊 Estructura de Datos

### Aerolínea
```typescript
{
  codigo: "AA",
  nombre: "American Airlines",
  politicasAlcohol: {
    maxVolumenPorPasajero: 5,
    requisitosEmpaque: "Envases originales sellados",
    destinosProhibidos: ["IR", "SA"],
    documentacionRequerida: ["Manifiesto", "Licencia"],
    protocolosInventario: "Conteo diario"
  }
}
```

### Producto
```typescript
{
  idProducto: "LIQU_1001",
  nombre: "Whisky Chivas Regal",
  categoria: "BebidasAlcoholicas",
  tamano: 750,
  unidadMedida: "ml",
  gradosAlcohol: 40,
  controlCalidad: {
    fillLevel: 100,
    sealStatus: "sellado",
    cleanlinessScore: 98
  },
  stockMinimo: 50,
  stockMaximo: 500
}
```

### Pedido de Catering
```typescript
{
  idPedido: "PED_AA100_20251105",
  aerolinea: "AA",
  vuelo: "AA100",
  fecha: "2025-11-05",
  origen: "JFK",
  destino: "LHR",
  items: [...],
  volumenTotalAlcohol: 39.75,
  estado: "pendiente"
}
```

## ⚠️ Validaciones Importantes

### Políticas de Alcohol

El sistema valida automáticamente:

1. ✅ **Volumen máximo**: 5L por pasajero (FAA/TSA)
2. ✅ **Destinos prohibidos**: Irán, Arabia Saudita, etc.
3. ✅ **Empaque**: Botellas selladas en envase original
4. ✅ **Documentación**: Manifiestos y licencias requeridas

### Ejemplo de Validación

```typescript
const validacion = await validarPoliticasAlcohol(pedido);

if (!validacion.valido) {
  // Posibles errores:
  // - "Volumen total de alcohol (6.5L) excede el máximo permitido (5L)"
  // - "El destino IR tiene prohibido el transporte de alcohol"
  // - "El producto X no cumple con requisitos de empaque"
}
```

## 🗂️ Categorías de Productos

- `BebidasAlcoholicas` - Licores, vinos, cervezas
- `BebidasNoAlcoholicas` - Agua, jugos, café, té
- `Snacks` - Nueces, galletas, chocolates
- `DutyFree` - Perfumes, cosméticos, relojes
- `EquipoCabina` - Cubiertos, servilletas, vasos
- `Documentacion` - Manifiestos, certificados
- `Comidas` - Comidas preparadas

## 📍 Ubicaciones de Inventario

- Almacén Central
- Base JFK (New York)
- Base DXB (Dubai)
- Base ATL (Atlanta)
- Base SCL (Santiago)
- Base LHR (Londres)
- Base CDG (París)
- Base FRA (Frankfurt)

## 🔄 Estados de Pedido

1. `pendiente` - Pedido recibido
2. `en_preparacion` - Siendo preparado
3. `listo` - Listo para despachar
4. `despachado` - Enviado al avión

## 📈 Funciones Helper

### Cálculo de Volumen de Alcohol

```typescript
import { calcularVolumenTotalAlcohol } from './src/data/products';

const volumen = calcularVolumenTotalAlcohol([
  { productoId: 'LIQU_1001', cantidad: 5 },
  { productoId: 'LIQU_1007', cantidad: 50 }
]);
console.log(volumen); // 20.25 litros
```

### Generar ID de Pedido

```typescript
import { generarIdPedido } from './src/data/orders';

const id = generarIdPedido('AA', 'AA100', '2025-11-05');
console.log(id); // "PED_AA100_20251105"
```

### Verificar Destino Permitido

```typescript
import { destinoPermiteAlcohol } from './src/data/airlines';

const permitido = destinoPermiteAlcohol('AA', 'IR');
console.log(permitido); // false (Irán prohibido)
```

## 📊 Estadísticas del Sistema

```typescript
import { getDataStatistics, printStatistics } from './src/firebase/initializeData';

// Obtener estadísticas
const stats = getDataStatistics();
console.log(stats.aerolíneas.total); // 7
console.log(stats.productos.bebidasAlcoholicas); // 8

// Imprimir resumen completo
printStatistics();
```

## 🛠️ Archivos Principales

```
src/
├── types.ts                    # Tipos TypeScript
├── firebase/
│   ├── config.ts              # Configuración Firebase
│   ├── utils.ts               # Funciones CRUD
│   └── initializeData.ts      # Inicialización
├── data/
│   ├── airlines.ts            # Aerolíneas (7)
│   ├── products.ts            # Productos (30+)
│   ├── orders.ts              # Pedidos ejemplo (5)
│   └── inventory.ts           # Inventario (40+)
└── components/
    └── CateringDashboard.tsx  # Dashboard React
```

## 🌍 Referencias Normativas

- **FAA**: Límite 5L alcohol por pasajero
- **TSA**: Envase original sellado requerido
- **IATA**: Estándares internacionales
- **Aerolíneas**: Políticas específicas (AA, EK, DL, LA, BA, LH, AF)

## 🔒 Países con Restricciones de Alcohol

| Código | País | Restricción |
|--------|------|-------------|
| IR | Irán | Prohibido |
| SA | Arabia Saudita | Prohibido |
| KW | Kuwait | Prohibido |
| LY | Libia | Prohibido |
| AF | Afganistán | Prohibido |
| PK | Pakistán | Parcial |
| YE | Yemen | Prohibido |
| MV | Maldivas | Prohibido |

## 💡 Tips

1. **Siempre validar** pedidos antes de crearlos
2. **Actualizar inventario** inmediatamente después de despachar
3. **Revisar stock bajo** regularmente
4. **Documentar** todos los pedidos con alcohol
5. **Verificar destino** antes de incluir alcohol

## 🆘 Soporte

Para más información, consulta:
- `FIREBASE_STRUCTURE.md` - Documentación completa
- `src/examples/cateringExamples.ts` - Ejemplos de código
- `src/components/CateringDashboard.tsx` - Componente UI

---

**¡Listo para usar!** 🚀
