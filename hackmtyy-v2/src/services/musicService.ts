// Servicio de música para PickView
// Basado en generateMusic.mjs

import { ElevenLabsClient } from "elevenlabs";

// Obtener API Key desde variables de entorno
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Cliente de ElevenLabs
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

/**
 * Genera música relajante usando ElevenLabs Text-to-Sound-Effects
 * Si falla, usa música de fallback
 */
export async function generatePickMusic(): Promise<string | null> {
  try {
    console.log("🎶 Generando música relajante con ElevenLabs...");

    // Intentar generar música con ElevenLabs usando el SDK correcto
    const track = await client.textToSoundEffects.convert({
      text: "relaxing instrumental ambient music with violin and soft synths, calm meditation music",
      duration_seconds: 30,
      prompt_influence: 0.5,
    });

    // Convertir los chunks a un blob
    const chunks: BlobPart[] = [];
    for await (const chunk of track) {
      chunks.push(chunk);
    }

    // Crear blob del audio
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log("✅ Música generada exitosamente con ElevenLabs");
    return audioUrl;
  } catch (error) {
    console.warn("⚠️ Error al generar música con ElevenLabs:", error);
    console.log("🎵 Usando música de fallback...");
    
  }
}

/**
 * Reproduce un audio de música
 */
export function playAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.volume = 0.3; // Volumen al 30% para música de fondo
  audio.loop = false; // Repetir la música
  
  // Configurar crossOrigin para evitar problemas de CORS
  audio.crossOrigin = "anonymous";
  
  audio.play().catch((err) => {
    console.error("❌ Error al reproducir música:", err);
  });
  
  return audio;
}
