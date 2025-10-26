// Servicio de música para PickView
// Basado en generateMusic.mjs

const ELEVENLABS_API_KEY = "sk_830a945e429d51462bf7e79649fa6bde4633e158e65814fa";

/**
 * Genera música relajante usando ElevenLabs Text-to-Sound-Effects
 */
export async function generatePickMusic(): Promise<string | null> {
  try {
    console.log("🎶 Generando música relajante con ElevenLabs...");

    // Nota: La API de text-to-sound-effects de ElevenLabs puede requerir un endpoint específico
    // Aquí usamos el endpoint de text-to-sound-effects
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-sound-effects",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "relaxing instrumental ambient music with violin and soft synths, calm meditation music",
          duration_seconds: 30,
          prompt_influence: 0.5,
        }),
      }
    );

    if (!response.ok) {
      console.error(`❌ Error en ElevenLabs (${response.status}):`, await response.text());
      return null;
    }

    // Convertir la respuesta a blob y crear URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log("✅ Música generada exitosamente");

    return audioUrl;
  } catch (error) {
    console.error("❌ Error al generar música:", error);
    return null;
  }
}

/**
 * Reproduce un audio de música
 */
export function playAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.volume = 0.5; // Volumen al 50% para música de fondo
  audio.loop = true; // Repetir la música
  audio.play().catch((err) => {
    console.error("❌ Error al reproducir música:", err);
  });
  return audio;
}
