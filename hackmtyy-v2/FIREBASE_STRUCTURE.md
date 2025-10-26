# Sistema de Pick & Pack para Catering Aéreo - Firebase

## 📋 Descripción

Sistema completo de gestión de catering aéreo con Firebase, incluyendo control de bebidas alcohólicas, inventario, pedidos y políticas específicas por aerolínea.

## 🗂️ Estructura de Firebase

### Colecciones Principales

#### 1. **Aerolíneas** (`aerolineas`)
Información de cada aerolínea con sus políticas específicas de alcohol.

**Campos principales:**
- `codigo` (string): Código IATA/ICAO (ej. "AA", "EK")
- `nombre` (string): Nombre de la aerolínea
- `politicasAlcohol` (objeto):
  - `maxVolumenPorPasajero` (number): Límite en litros (típicamente 5L)
  - `requisitosEmpaque` (string): Ej. "Envases originales sellados según FAA"
  - `destinosProhibidos` (array): Códigos de países (ej. ["IR", "SA"])
  - `documentacionRequerida` (array): Documentos necesarios
  - `protocolosInventario` (string): Procedimientos de control

**Ejemplo:**
```typescript
{
  codigo: "AA",
  nombre: "American Airlines",
  politicasAlcohol: {
    maxVolumenPorPasajero: 5,
    requisitosEmpaque: "Envases originales sellados según FAA",
    destinosProhibidos: ["IR", "SA"],
    documentacionRequerida: ["Manifiesto de catering", "Licencia de exportación"],
    protocolosInventario: "Conteo diario de stock, auditoría mensual, FIFO"
  }
}
```

#### 2. **Productos** (`productos`)
Catálogo de todos los productos disponibles para catering.

**Categorías:**
- `BebidasAlcoholicas`
- `BebidasNoAlcoholicas`
- `Snacks`
- `DutyFree`
- `EquipoCabina`
- `Documentacion`
- `Comidas`

**Campos principales:**
- `idProducto` (string): Identificador único
- `nombre` (string)
- `marca` (string)
- `categoria` (ProductCategory)
- `tamano` (number): Cantidad en ml, g, kg, etc.
- `unidadMedida` (string): "ml", "L", "g", "kg", "unidad"
- `gradosAlcohol` (number): Solo para bebidas alcohólicas
- `controlCalidad` (objeto): Para bebidas alcohólicas
  - `fillLevel` (number): Nivel de llenado (0-100%)
  - `sealStatus` ("sellado" | "abierto")
  - `cleanlinessScore` (number)
  - `labelCondition` (string)
- `stockMinimo` / `stockMaximo` (number)
- `precio` (number)

**Ejemplo:**
```typescript
{
  idProducto: "LIQU_1001",
  nombre: "Whisky Chivas Regal 12 años",
  marca: "Chivas",
  categoria: "BebidasAlcoholicas",
  tamano: 750,
  unidadMedida: "ml",
  gradosAlcohol: 40,
  controlCalidad: {
    fillLevel: 100,
    sealStatus: "sellado",
    cleanlinessScore: 98,
    labelCondition: "excelente"
  },
  stockMinimo: 50,
  stockMaximo: 500,
  precio: 45.99
}
```

#### 3. **Pedidos de Catering** (`pedidosCatering`)
Cargas de catering para cada vuelo.

**Campos principales:**
- `idPedido` (string): Identificador único
- `aerolinea` (string): Código de aerolínea
- `vuelo` (string)
- `fecha` (string): ISO date
- `origen` / `destino` (string): Códigos de aeropuerto
- `items` (array): Lista de productos
  - `categoria` (ProductCategory)
  - `productoId` (string)
  - `nombre` (string)
  - `cantidad` (number)
  - `volumenUnitario` (number): Para bebidas
  - `contenidoAlcohol` (number): % alcohol
- `volumenTotalAlcohol` (number): Litros totales
- `documentosAdjuntos` (array): URLs de documentos
- `estado` ("pendiente" | "en_preparacion" | "listo" | "despachado")

**Ejemplo:**
```typescript
{
  idPedido: "PED_AA100_20251105",
  aerolinea: "AA",
  vuelo: "AA100",
  fecha: "2025-11-05",
  origen: "JFK",
  destino: "LHR",
  items: [
    {
      categoria: "BebidasAlcoholicas",
      productoId: "LIQU_1001",
      nombre: "Whisky Chivas Regal 12 años",
      cantidad: 5,
      volumenUnitario: 0.75,
      contenidoAlcohol: 40
    }
  ],
  volumenTotalAlcohol: 3.75,
  estado: "pendiente"
}
```

#### 4. **Inventario** (`inventario`)
Control de existencias por producto y ubicación.

**Campos principales:**
- `id` (string): Identificador único
- `productoId` (string): Referencia al producto
- `ubicacion` (string): "Almacén Central", "Base JFK", etc.
- `cantidadDisponible` (number)
- `ultimoInventario` (string): ISO date
- `lote` (string): Número de lote
- `fechaCaducidad` (string): Para productos perecederos
- `alertaStock` (boolean): true si está bajo el mínimo

**Ejemplo:**
```typescript
{
  id: "INV_LIQU_1001_AC",
  productoId: "LIQU_1001",
  ubicacion: "Almacén Central",
  cantidadDisponible: 350,
  ultimoInventario: "2025-10-24T08:00:00Z",
  lote: "CHV-2025-Q3",
  fechaCaducidad: "2030-12-31",
  alertaStock: false
}
```

## 🚀 Uso del Sistema

### Inicialización

```typescript
import { initializeFirebaseData, initializeIfEmpty } from './firebase/initializeData';

// Opción 1: Inicializar solo si está vacío (recomendado)
await initializeIfEmpty();

// Opción 2: Forzar inicialización
await initializeFirebaseData();
```

### Operaciones CRUD

#### Aerolíneas
```typescript
import { 
  createAerolinea, 
  getAerolinea, 
  getAllAerolineas, 
  updateAerolinea 
} from './firebase/utils';

// Crear
await createAerolinea(aerolineaData);

// Leer
const aerolinea = await getAerolinea("AA");
const todas = await getAllAerolineas();

// Actualizar
await updateAerolinea("AA", { 
  direccionOficinas: "Nueva dirección" 
});
```

#### Productos
```typescript
import { 
  createProducto, 
  getProducto, 
  getAllProductos, 
  getProductosByCategoria 
} from './firebase/utils';

// Obtener productos por categoría
const bebidas = await getProductosByCategoria("BebidasAlcoholicas");
```

#### Pedidos de Catering
```typescript
import { 
  createPedidoCatering, 
  getPedidoCatering,
  getPedidosByAerolinea,
  validarPoliticasAlcohol,
  updatePedidoCatering 
} from './firebase/utils';

// Crear pedido
await createPedidoCatering(pedidoData);

// Validar políticas de alcohol
const validacion = await validarPoliticasAlcohol(pedido);
if (!validacion.valido) {
  console.error("Errores:", validacion.errores);
}

// Actualizar estado
await updatePedidoCatering("PED_AA100_20251105", { 
  estado: "listo" 
});
```

#### Inventario
```typescript
import { 
  createInventario, 
  getInventarioByProducto,
  getInventarioByUbicacion,
  actualizarStockPorPedido,
  getProductosStockBajo 
} from './firebase/utils';

// Obtener inventario de un producto
const inventarios = await getInventarioByProducto("LIQU_1001");

// Actualizar stock después de un pedido
await actualizarStockPorPedido(pedido);

// Productos con stock bajo
const stockBajo = await getProductosStockBajo();
```

## 📊 Validaciones Automáticas

### Políticas de Alcohol

El sistema valida automáticamente:

1. **Volumen máximo por pasajero**: Típicamente 5L según normativas FAA y aerolíneas
2. **Destinos prohibidos**: Países donde no se permite alcohol (Irán, Arabia Saudita, etc.)
3. **Requisitos de empaque**: Verifica que las bebidas estén selladas
4. **Documentación requerida**: Manifiestos, licencias, certificados

```typescript
const validacion = await validarPoliticasAlcohol(pedido);
// Retorna: { valido: boolean, errores: string[] }
```

### Control de Stock

- Actualización automática al procesar pedidos
- Alertas cuando el stock cae por debajo del mínimo
- Sistema FIFO (First In, First Out) recomendado

## 📦 Datos de Ejemplo

El sistema incluye datos de ejemplo para:

- **7 Aerolíneas**: AA, EK, DL, LA, BA, LH, AF
- **30+ Productos**: Bebidas alcohólicas y no alcohólicas, snacks, duty-free, equipo de cabina
- **5 Pedidos de ejemplo**: Diferentes rutas y configuraciones
- **40+ Registros de inventario**: Múltiples ubicaciones

## 🌍 Normativas y Referencias

### Límites de Alcohol
- **FAA/TSA**: Máximo 5L por pasajero en equipaje documentado
- **Empaque**: Debe estar en su envase original sellado
- **Contenido**: Máximo 70% de alcohol por volumen

### Países con Restricciones
- 🚫 Irán (IR)
- 🚫 Arabia Saudita (SA)
- 🚫 Kuwait (KW)
- 🚫 Libia (LY)
- 🚫 Afganistán (AF)
- ⚠️ Pakistán (PK) - Restricciones parciales

### Fuentes
- [FAA Regulations](https://www.faa.gov)
- [American Airlines Policy](https://www.aa.com)
- [LATAM Airlines Policy](https://www.latamairlines.com)
- [Wikipedia - Alcohol Laws](https://en.wikipedia.org)

## 🛠️ Funciones Helper

### Datos Estáticos
```typescript
import { aerolineasData, getAerolineaByCode } from './data/airlines';
import { productosData, getProductosByCategoria } from './data/products';
import { pedidosCateringData, getPedidoByVuelo } from './data/orders';
import { inventarioData, getStockTotalProducto } from './data/inventory';
```

### Estadísticas
```typescript
import { getDataStatistics, printStatistics } from './firebase/initializeData';

const stats = getDataStatistics();
printStatistics(); // Muestra resumen en consola
```

## 📁 Estructura de Archivos

```
src/
├── firebase/
│   ├── config.ts              # Configuración de Firebase
│   ├── utils.ts               # Funciones CRUD y validaciones
│   └── initializeData.ts      # Script de inicialización
├── data/
│   ├── airlines.ts            # Datos de aerolíneas
│   ├── products.ts            # Catálogo de productos
│   ├── orders.ts              # Pedidos de ejemplo
│   └── inventory.ts           # Inventario inicial
└── types.ts                   # Definiciones TypeScript
```

## 🔒 Seguridad

- Usar variables de entorno para credenciales de Firebase
- Implementar reglas de seguridad de Firestore
- Validar permisos por rol (PICK vs PACK)
- Auditar cambios en inventario y pedidos

## 📈 Próximos Pasos

1. Implementar autenticación de usuarios
2. Crear dashboard de visualización
3. Añadir notificaciones en tiempo real
4. Integrar con sistemas de la aerolínea
5. Reportes y analytics
6. Integración con códigos de barras/QR

## 🤝 Contribuciones

Este sistema sigue las mejores prácticas de:
- FAA (Federal Aviation Administration)
- TSA (Transportation Security Administration)
- IATA (International Air Transport Association)
- Políticas específicas de aerolíneas internacionales

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
