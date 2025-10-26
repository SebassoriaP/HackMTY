/**
 * Utilidad para limpiar completamente elementos de audio
 * Previene loops y superposición de sonidos
 */

/**
 * Detiene y limpia completamente un elemento de audio HTML
 * @param audio - Elemento de audio a limpiar
 */
export function cleanupAudio(audio: HTMLAudioElement | null): void {
  if (!audio) return;

  try {
    // 1. Pausar reproducción
    audio.pause();
    
    // 2. Resetear posición
    audio.currentTime = 0;
    
    // 3. Desactivar loop
    audio.loop = false;
    
    // 4. Remover eventos
    audio.onended = null;
    audio.onerror = null;
    audio.onplay = null;
    audio.onpause = null;
    
    // 5. Limpiar source
    audio.src = '';
    
    // 6. Limpiar srcObject (para streams)
    audio.srcObject = null;
    
    // 7. Forzar recarga para limpiar buffer
    audio.load();
    
    console.log("🔇 Audio limpiado correctamente");
  } catch (error) {
    console.warn("⚠️ Error al limpiar audio:", error);
  }
}

/**
 * Detiene todos los elementos de audio activos en la página
 * Útil para garantizar que no haya sonidos superpuestos
 */
export function stopAllAudio(): void {
  try {
    const allAudioElements = document.querySelectorAll('audio');
    console.log(`🔇 Deteniendo ${allAudioElements.length} elementos de audio...`);
    
    allAudioElements.forEach((audio) => {
      cleanupAudio(audio);
    });
    
    console.log("✅ Todos los audios detenidos");
  } catch (error) {
    console.warn("⚠️ Error al detener todos los audios:", error);
  }
}
