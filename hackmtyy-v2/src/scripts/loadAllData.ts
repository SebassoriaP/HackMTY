/**
 * Script para cargar TODOS los datos a Firebase
 * Ejecutar desde la consola del navegador o como script independiente
 */

import { initializeFirebaseData } from '../firebase/initializeData';

/**
 * Función principal para ejecutar la carga
 */
async function loadAllDataToFirebase() {
  try {
    console.log('🚀 Iniciando carga completa de datos a Firebase...\n');
    
    await initializeFirebaseData();
    
    console.log('\n✅ ¡Todos los datos han sido cargados exitosamente a Firebase!');
    console.log('📊 Puedes verificar los datos en la consola de Firebase Firestore');
    
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    throw error;
  }
}

// Auto-ejecutar si se importa el módulo
loadAllDataToFirebase()
  .then(() => console.log('✨ Proceso completado'))
  .catch((error) => console.error('💥 Proceso fallido:', error));

export { loadAllDataToFirebase };
