import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query,
  where,
  WhereFilterOp,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import type {
  Aerolinea,
  Producto,
  PedidoCatering,
  Inventario,
  AccionBotella,
  AlcoholAlmacenado
} from '../types';

// ===============================================
// COLECCIONES DE FIREBASE
// ===============================================

export const COLLECTIONS = {
  AEROLINEAS: 'aerolineas',
  PRODUCTOS: 'productos',
  PEDIDOS_CATERING: 'pedidosCatering',
  INVENTARIO: 'inventario',
  BOTELLAS_DEVUELTAS: 'botellasDevueltas'
} as const;

// ===============================================
// FUNCIONES GENÉRICAS CRUD
// ===============================================

/**
 * Crear o actualizar un documento en una colección
 */
export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Obtener un documento por ID
 */
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

/**
 * Obtener todos los documentos de una colección
 */
export async function getAllDocuments<T>(
  collectionName: string
): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}

/**
 * Consulta con filtros
 */
export async function queryDocuments<T>(
  collectionName: string,
  filters: Array<{ field: string; operator: WhereFilterOp; value: any }>
): Promise<T[]> {
  const constraints: QueryConstraint[] = filters.map(f => 
    where(f.field, f.operator, f.value)
  );
  
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}

/**
 * Actualizar un documento
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

/**
 * Eliminar un documento
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// ===============================================
// FUNCIONES ESPECÍFICAS - AEROLÍNEAS
// ===============================================

export async function createAerolinea(aerolinea: Aerolinea): Promise<void> {
  await setDocument(COLLECTIONS.AEROLINEAS, aerolinea.codigo, aerolinea);
}

export async function getAerolinea(codigo: string): Promise<Aerolinea | null> {
  return getDocument<Aerolinea>(COLLECTIONS.AEROLINEAS, codigo);
}

export async function getAllAerolineas(): Promise<Aerolinea[]> {
  return getAllDocuments<Aerolinea>(COLLECTIONS.AEROLINEAS);
}

export async function updateAerolinea(
  codigo: string,
  data: Partial<Aerolinea>
): Promise<void> {
  await updateDocument(COLLECTIONS.AEROLINEAS, codigo, data);
}

// ===============================================
// FUNCIONES ESPECÍFICAS - PRODUCTOS
// ===============================================

export async function createProducto(producto: Producto): Promise<void> {
  await setDocument(COLLECTIONS.PRODUCTOS, producto.idProducto, producto);
}

export async function getProducto(idProducto: string): Promise<Producto | null> {
  return getDocument<Producto>(COLLECTIONS.PRODUCTOS, idProducto);
}

export async function getAllProductos(): Promise<Producto[]> {
  return getAllDocuments<Producto>(COLLECTIONS.PRODUCTOS);
}

export async function getProductosByCategoria(categoria: string): Promise<Producto[]> {
  return queryDocuments<Producto>(COLLECTIONS.PRODUCTOS, [
    { field: 'categoria', operator: '==', value: categoria }
  ]);
}

export async function updateProducto(
  idProducto: string,
  data: Partial<Producto>
): Promise<void> {
  await updateDocument(COLLECTIONS.PRODUCTOS, idProducto, data);
}

// ===============================================
// FUNCIONES ESPECÍFICAS - PEDIDOS DE CATERING
// ===============================================

export async function createPedidoCatering(pedido: PedidoCatering): Promise<void> {
  const pedidoConFechas = {
    ...pedido,
    fechaCreacion: pedido.fechaCreacion || new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    estado: pedido.estado || 'pendiente'
  };
  await setDocument(COLLECTIONS.PEDIDOS_CATERING, pedido.idPedido, pedidoConFechas);
}

export async function getPedidoCatering(idPedido: string): Promise<PedidoCatering | null> {
  return getDocument<PedidoCatering>(COLLECTIONS.PEDIDOS_CATERING, idPedido);
}

export async function getAllPedidosCatering(): Promise<PedidoCatering[]> {
  return getAllDocuments<PedidoCatering>(COLLECTIONS.PEDIDOS_CATERING);
}

export async function getPedidosByAerolinea(codigoAerolinea: string): Promise<PedidoCatering[]> {
  return queryDocuments<PedidoCatering>(COLLECTIONS.PEDIDOS_CATERING, [
    { field: 'aerolinea', operator: '==', value: codigoAerolinea }
  ]);
}

export async function getPedidosByVuelo(vuelo: string): Promise<PedidoCatering[]> {
  return queryDocuments<PedidoCatering>(COLLECTIONS.PEDIDOS_CATERING, [
    { field: 'vuelo', operator: '==', value: vuelo }
  ]);
}

export async function updatePedidoCatering(
  idPedido: string,
  data: Partial<PedidoCatering>
): Promise<void> {
  const updateData = {
    ...data,
    fechaActualizacion: new Date().toISOString()
  };
  await updateDocument(COLLECTIONS.PEDIDOS_CATERING, idPedido, updateData);
}

/**
 * Validar que un pedido cumple con las políticas de alcohol de la aerolínea
 */
export async function validarPoliticasAlcohol(
  pedido: PedidoCatering
): Promise<{ valido: boolean; errores: string[] }> {
  const errores: string[] = [];
  
  // Obtener la aerolínea
  const aerolinea = await getAerolinea(pedido.aerolinea);
  if (!aerolinea) {
    errores.push(`Aerolínea ${pedido.aerolinea} no encontrada`);
    return { valido: false, errores };
  }
  
  const { politicasAlcohol } = aerolinea;
  
  // Validar volumen máximo
  if (pedido.volumenTotalAlcohol > politicasAlcohol.maxVolumenPorPasajero) {
    errores.push(
      `Volumen total de alcohol (${pedido.volumenTotalAlcohol}L) excede el máximo permitido (${politicasAlcohol.maxVolumenPorPasajero}L)`
    );
  }
  
  // Validar destinos prohibidos
  if (politicasAlcohol.destinosProhibidos.includes(pedido.destino)) {
    errores.push(
      `El destino ${pedido.destino} tiene prohibido el transporte de alcohol`
    );
  }
  
  // Validar empaque de bebidas alcohólicas
  const itemsAlcoholicos = pedido.items.filter(
    item => item.categoria === 'BebidasAlcoholicas'
  );
  
  for (const item of itemsAlcoholicos) {
    const producto = await getProducto(item.productoId);
    if (producto?.controlCalidad?.sealStatus !== 'sellado') {
      errores.push(
        `El producto ${item.nombre} no cumple con requisitos de empaque (debe estar sellado)`
      );
    }
  }
  
  return { valido: errores.length === 0, errores };
}

// ===============================================
// FUNCIONES ESPECÍFICAS - INVENTARIO
// ===============================================

export async function createInventario(inventario: Inventario): Promise<string> {
  const id = inventario.id || `INV_${Date.now()}`;
  await setDocument(COLLECTIONS.INVENTARIO, id, { ...inventario, id });
  return id;
}

export async function getInventario(id: string): Promise<Inventario | null> {
  return getDocument<Inventario>(COLLECTIONS.INVENTARIO, id);
}

export async function getAllInventario(): Promise<Inventario[]> {
  return getAllDocuments<Inventario>(COLLECTIONS.INVENTARIO);
}

export async function getInventarioByProducto(productoId: string): Promise<Inventario[]> {
  return queryDocuments<Inventario>(COLLECTIONS.INVENTARIO, [
    { field: 'productoId', operator: '==', value: productoId }
  ]);
}

export async function getInventarioByUbicacion(ubicacion: string): Promise<Inventario[]> {
  return queryDocuments<Inventario>(COLLECTIONS.INVENTARIO, [
    { field: 'ubicacion', operator: '==', value: ubicacion }
  ]);
}

export async function updateInventario(
  id: string,
  data: Partial<Inventario>
): Promise<void> {
  await updateDocument(COLLECTIONS.INVENTARIO, id, data);
}

/**
 * Actualizar stock después de un pedido
 */
export async function actualizarStockPorPedido(pedido: PedidoCatering): Promise<void> {
  for (const item of pedido.items) {
    const inventarios = await getInventarioByProducto(item.productoId);
    
    if (inventarios.length === 0) {
      console.warn(`No hay inventario para el producto ${item.productoId}`);
      continue;
    }
    
    // Usar el primer inventario disponible (o implementar lógica más compleja)
    const inventario = inventarios[0];
    const nuevaCantidad = inventario.cantidadDisponible - item.cantidad;
    
    await updateInventario(inventario.id!, {
      cantidadDisponible: Math.max(0, nuevaCantidad),
      ultimoInventario: new Date().toISOString()
    });
    
    // Verificar alerta de stock
    const producto = await getProducto(item.productoId);
    if (producto?.stockMinimo && nuevaCantidad < producto.stockMinimo) {
      await updateInventario(inventario.id!, { alertaStock: true });
    }
  }
}

/**
 * Obtener productos con stock bajo
 */
export async function getProductosStockBajo(): Promise<Array<{ producto: Producto; inventario: Inventario }>> {
  const inventarios = await queryDocuments<Inventario>(COLLECTIONS.INVENTARIO, [
    { field: 'alertaStock', operator: '==', value: true }
  ]);
  
  const resultado = [];
  for (const inv of inventarios) {
    const producto = await getProducto(inv.productoId);
    if (producto) {
      resultado.push({ producto, inventario: inv });
    }
  }
  
  return resultado;
}

// ===============================================
// FUNCIONES ESPECÍFICAS - BOTELLAS DEVUELTAS
// ===============================================

import type { BotellaDevuelta, PoliticasBotellas } from '../types';
import { decidirAccionBotella } from '../services/bottleDecisionEngine';

export async function createBotellaDevuelta(botella: BotellaDevuelta): Promise<void> {
  await setDocument(COLLECTIONS.BOTELLAS_DEVUELTAS, botella.idBotella, botella);
}

export async function getBotellaDevuelta(idBotella: string): Promise<BotellaDevuelta | null> {
  return getDocument<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, idBotella);
}

export async function getAllBotellasDevueltas(): Promise<BotellaDevuelta[]> {
  return getAllDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS);
}

export async function getBotellasByVuelo(vuelo: string): Promise<BotellaDevuelta[]> {
  return queryDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, [
    { field: 'vuelo', operator: '==', value: vuelo }
  ]);
}

export async function getBotellasByTipo(tipo: string): Promise<BotellaDevuelta[]> {
  return queryDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, [
    { field: 'tipo', operator: '==', value: tipo }
  ]);
}

export async function getBotellasByAccion(accion: string): Promise<BotellaDevuelta[]> {
  return queryDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, [
    { field: 'accionRecomendada', operator: '==', value: accion }
  ]);
}

export async function updateBotellaDevuelta(
  idBotella: string,
  data: Partial<BotellaDevuelta>
): Promise<void> {
  await updateDocument(COLLECTIONS.BOTELLAS_DEVUELTAS, idBotella, data);
}

/**
 * Procesar botella devuelta y aplicar decisión automática
 */
export async function procesarBotellaDevuelta(
  botella: BotellaDevuelta,
  politicasBotellas: PoliticasBotellas,
  botellasHoldingArea: BotellaDevuelta[] = []
): Promise<BotellaDevuelta> {
  // Aplicar motor de decisiones
  const decision = decidirAccionBotella(botella, politicasBotellas, botellasHoldingArea);
  
  // Actualizar botella con decisión
  const botellaActualizada: BotellaDevuelta = {
    ...botella,
    accionRecomendada: decision.accion,
    reglaAplicada: decision.reglaAplicada,
    relleno: decision.relleno,
    reutilizacionAgregada: decision.reutilizacionAgregada,
    datosAuditoria: {
      empleadoId: botella.empleadoId,
      timestamp: new Date().toISOString(),
      fotos: [botella.fotoEvidenceUrl],
      versionRegla: "v3.0"
    }
  };
  
  // Guardar en Firebase
  await createBotellaDevuelta(botellaActualizada);
  
  return botellaActualizada;
}

/**
 * Procesar múltiples botellas en lote
 */
export async function procesarLoteBotellas(
  botellas: BotellaDevuelta[],
  politicasBotellas: PoliticasBotellas
): Promise<BotellaDevuelta[]> {
  const procesadas: BotellaDevuelta[] = [];
  
  for (const botella of botellas) {
    const procesada = await procesarBotellaDevuelta(botella, politicasBotellas, botellas);
    procesadas.push(procesada);
  }
  
  return procesadas;
}

/**
 * Obtener botellas devueltas por vuelo
 */
export async function getBotellasDevueltasByVuelo(vueloId: string): Promise<BotellaDevuelta[]> {
  return queryDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, [
    { field: 'vuelo', operator: '==', value: vueloId }
  ]);
}

/**
 * Obtener botellas devueltas sin procesar
 */
export async function getBotellasDevueltasSinProcesar(): Promise<BotellaDevuelta[]> {
  return queryDocuments<BotellaDevuelta>(COLLECTIONS.BOTELLAS_DEVUELTAS, [
    { field: 'accionRecomendada', operator: '==', value: null }
  ]);
}

/**
 * Actualizar estado de botella procesada
 */
export async function actualizarBotellaProcessada(
  idBotella: string,
  accion: AccionBotella,
  detalles: Partial<BotellaDevuelta>
): Promise<void> {
  await updateDocument(COLLECTIONS.BOTELLAS_DEVUELTAS, idBotella, {
    accionRecomendada: accion,
    ...detalles,
    fechaActualizacion: new Date().toISOString()
  });
}

/**
 * Obtener estadísticas de botellas devueltas
 */
export async function getEstadisticasBotellas(): Promise<{
  total: number;
  reutilizar: number;
  rellenar: number;
  desechar: number;
  porTipo: Record<string, number>;
}> {
  const botellas = await getAllBotellasDevueltas();
  
  const stats = {
    total: botellas.length,
    reutilizar: 0,
    rellenar: 0,
    desechar: 0,
    porTipo: {} as Record<string, number>
  };
  
  botellas.forEach(b => {
    if (b.accionRecomendada === 'REUTILIZAR') stats.reutilizar++;
    if (b.accionRecomendada === 'RELLENAR') stats.rellenar++;
    if (b.accionRecomendada === 'DESECHAR') stats.desechar++;
    
    stats.porTipo[b.tipo] = (stats.porTipo[b.tipo] || 0) + 1;
  });
  
  return stats;
}

// ===============================================
// FUNCIONES DE ALCOHOL ALMACENADO (NUEVA TABLA)
// ===============================================

/**
 * Obtener todo el alcohol almacenado disponible
 */
export async function getAlcoholAlmacenado(): Promise<AlcoholAlmacenado[]> {
  const snapshot = await getDocs(collection(db, 'alcoholAlmacenado'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlcoholAlmacenado));
}

/**
 * Obtener alcohol almacenado por producto
 */
export async function getAlcoholAlmacenadoByProducto(productoId: string): Promise<AlcoholAlmacenado[]> {
  const q = query(
    collection(db, 'alcoholAlmacenado'),
    where('productoId', '==', productoId),
    where('disponibleParaRellenar', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlcoholAlmacenado));
}

/**
 * Agregar nueva botella al almacén
 */
export async function agregarAlcoholAlmacenado(alcohol: Omit<AlcoholAlmacenado, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'alcoholAlmacenado'), alcohol);
  return docRef.id;
}

/**
 * Actualizar volumen de alcohol almacenado después de rellenar
 */
export async function actualizarVolumenAlcoholAlmacenado(
  id: string, 
  nuevoVolumen_ml: number
): Promise<void> {
  const nivelLlenado = (nuevoVolumen_ml / (await getDoc(doc(db, 'alcoholAlmacenado', id))).data()!.volumenOriginal_ml) * 100;
  
  await updateDoc(doc(db, 'alcoholAlmacenado', id), {
    volumenActual_ml: nuevoVolumen_ml,
    nivelLlenado: Math.round(nivelLlenado),
    disponibleParaRellenar: nuevoVolumen_ml > 0
  });
}

/**
 * Marcar alcohol como consumido/usado
 */
export async function marcarAlcoholComoUsado(id: string): Promise<void> {
  await updateDoc(doc(db, 'alcoholAlmacenado', id), {
    disponibleParaRellenar: false,
    volumenActual_ml: 0
  });
}


