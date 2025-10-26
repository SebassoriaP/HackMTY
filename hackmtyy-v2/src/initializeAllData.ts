/**
 * Script para inicializar TODOS los datos en Firebase
 * Ejecutar desde consola del navegador:
 * 
 * import { initializeAllData } from './src/initializeAllData';
 * await initializeAllData();
 */

import { initializeFirebaseData } from './firebase/initializeData';

/**
 * Función principal para inicializar todos los datos
 */
export async function initializeAllData() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  🚀 INICIALIZACIÓN COMPLETA DE FIREBASE 🚀  ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    await initializeFirebaseData();
    
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║  ✅ ¡INICIALIZACIÓN COMPLETADA CON ÉXITO! ✅  ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
    
    console.log('📝 Próximos pasos:');
    console.log('   1. Verifica los datos en Firebase Console');
    console.log('   2. Prueba buscar un vuelo: PED_AA100_20251105');
    console.log('   3. El sistema está listo para usar\n');
    
    return true;
  } catch (error) {
    console.error('\n╔═══════════════════════════════════════════════╗');
    console.error('║  ❌ ERROR EN LA INICIALIZACIÓN ❌            ║');
    console.error('╚═══════════════════════════════════════════════╝\n');
    console.error('Detalles del error:', error);
    
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    
    return false;
  }
}

// Hacer disponible globalmente en el navegador para fácil acceso
if (typeof window !== 'undefined') {
  (window as any).initializeAllData = initializeAllData;
  console.log('💡 Script de inicialización cargado.');
  console.log('💡 Ejecuta: initializeAllData() para poblar Firebase');
}
