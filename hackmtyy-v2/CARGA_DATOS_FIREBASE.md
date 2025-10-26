# 📥 Guía: Cargar Datos a Firebase

## ✅ Cambios Realizados

### 1. **Corregidos todos los errores en `airlinesPolicies.ts`**
- Agregado el campo `criteriosCalidad` faltante a las 4 aerolíneas (AA, EK, DL, LA)
- Cada aerolínea ahora tiene criterios completos para:
  - ✓ **Reutilizar**: fillLevelMin, sealStatus, cleanlinessScoreMin, labelCondition
  - ✓ **Rellenar**: fillLevelMin/Max, sealStatus, cleanlinessScoreMin, labelCondition, permitirAgregacion
  - ✓ **Desechar**: descartarVinosCervezasAbiertas

### 2. **Actualizado `initializeData.ts`**
- Ahora carga las aerolíneas desde `airlinesPolicies.ts` (con políticas completas)
- Las aerolíneas incluyen:
  - ✈️ Políticas de alcohol (volumen, destinos prohibidos, documentación)
  - 🍾 Políticas de botellas (reutilizar, rellenar, desechar)
  - 📋 Criterios de calidad específicos por aerolínea

### 3. **Mejorado el Dashboard**
- Nuevo botón "📥 Cargar Datos a Firebase" con confirmación
- Mensajes informativos de éxito/error
- Alerta cuando no hay datos en Firebase
- Recarga automática después de cargar

---

## 🚀 Cómo Cargar los Datos

### Opción 1: Desde el Dashboard (RECOMENDADO)

1. Abre la aplicación en: `http://localhost:5175/`
2. Ve a la pestaña **"📊 Dashboard"**
3. Haz clic en **"📥 Cargar Datos a Firebase"**
4. Confirma la acción en el diálogo
5. Espera a que termine (verás mensajes de progreso en la consola)
6. Los datos se recargarán automáticamente

### Opción 2: Desde la Consola del Navegador

```javascript
// 1. Importar la función
import { initializeFirebaseData } from './firebase/initializeData';

// 2. Ejecutar
await initializeFirebaseData();
```

---

## 📊 Datos que se Cargan

Al ejecutar la carga, se crean/actualizan las siguientes colecciones en Firebase:

### ✈️ **Aerolíneas** (4 registros)
- American Airlines (AA)
- Emirates (EK)
- Delta Air Lines (DL)
- LATAM Airlines (LA)

**Incluye:**
- Políticas de alcohol
- Políticas de botellas (reutilizar, rellenar, desechar)
- Criterios de calidad específicos
- Destinos prohibidos
- Documentación requerida

### 📦 **Productos** (múltiples categorías)
- Bebidas Alcohólicas (whisky, vodka, vino, cerveza, etc.)
- Bebidas No Alcohólicas (agua, jugos, café, té)
- Snacks (nueces, chocolates, galletas, etc.)
- Duty-Free
- Equipo de Cabina
- Documentación

### 📊 **Inventario**
- Múltiples ubicaciones de almacenamiento
- Niveles de stock por producto
- Alertas de stock bajo

### 🛫 **Pedidos de Catering**
- Varios pedidos de ejemplo
- Incluyen items con bebidas alcohólicas
- Estados: pendiente, en_preparacion, listo

### 🍾 **Botellas Devueltas**
- Ejemplos de análisis de botellas
- Acciones recomendadas (REUTILIZAR, RELLENAR, DESECHAR)
- Datos de control de calidad

---

## 🔍 Verificar la Carga

### En Firebase Console:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Deberías ver estas colecciones:
   - `aerolineas`
   - `productos`
   - `pedidosCatering`
   - `inventario`
   - `botellasDevueltas`

### En la Consola del Navegador:
Durante la carga verás mensajes como:
```
🚀 Iniciando población de Firebase...

📋 Creando aerolíneas con políticas completas...
✅ Aerolínea creada: American Airlines (AA)
   - Políticas de alcohol: ✓
   - Políticas de botellas: ✓
...

📦 Creando productos...
✅ Producto creado: Whisky Chivas Regal 12 años (LIQU_1001)
...

🎉 ¡Firebase inicializado exitosamente!

📊 RESUMEN DE DATOS CARGADOS:
   ✈️  Aerolíneas: 4 (con políticas completas)
   📦 Productos: X
   📊 Inventario: X ubicaciones
   🛫 Pedidos: X vuelos
   🍾 Botellas Devueltas: X botellas
```

---

## ⚠️ Notas Importantes

1. **Sobrescritura**: Esta operación sobrescribirá datos existentes en Firebase con el mismo ID
2. **Tiempo**: La carga puede tomar 10-30 segundos dependiendo de la cantidad de datos
3. **Conexión**: Asegúrate de tener conexión a internet estable
4. **Firebase Config**: Verifica que tu archivo `.env` tenga las credenciales correctas

---

## 🐛 Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Revisa que Firebase esté configurado en `src/firebase/config.ts`

### Error: "Permission denied"
- Verifica las reglas de seguridad en Firebase Console
- Asegúrate de tener permisos de escritura en Firestore

### Los datos no aparecen después de cargar
- Espera unos segundos y haz clic en "🔄 Recargar Datos"
- Revisa la consola del navegador para ver errores
- Verifica en Firebase Console que los datos se hayan guardado

---

## 📝 Archivos Modificados

- `src/data/airlinesPolicies.ts` - ✅ Corregidos errores de tipos
- `src/firebase/initializeData.ts` - ✅ Actualizado para cargar políticas completas
- `src/components/Dashboard.tsx` - ✅ Agregado botón de carga
- `src/styles.css` - ✅ Agregados estilos para mensajes

---

## 🎯 Próximos Pasos

Una vez cargados los datos:

1. **Probar Bottle Handling**: 
   - Ingresa `PED_AA100_20251105` en la búsqueda de vuelos
   - El sistema debería redirigir automáticamente a Bottle Handling
   - Ahora funcionará correctamente sin pantalla blanca

2. **Explorar el Dashboard**:
   - Ver estadísticas de aerolíneas, productos, pedidos
   - Revisar estados de pedidos

3. **Probar Pick & Pack**:
   - Seleccionar un vuelo
   - Elegir rol (PICK o PACK)
   - Procesar items

---

**¿Preguntas o problemas?** Revisa la consola del navegador para más información.
