// Servicio de motivación para PackView
// Basado en generateMotivation.mjs

// Obtener credenciales desde variables de entorno
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

// Frases motivadoras de fallback (cuando la API no está disponible)
const FALLBACK_PHRASES = [
  "¡Tú puedes! Cada paquete que preparas hace la diferencia.",
  "¡Excelente trabajo! Tu dedicación es inspiradora.",
  "¡Sigue así! Eres parte importante del equipo.",
  "¡Ánimo! Tu esfuerzo no pasa desapercibido.",
  "¡Increíble desempeño! Cada detalle cuenta.",
  "¡Vas muy bien! Tu precisión es admirable.",
  "¡Bravo! Tu trabajo es fundamental para el éxito.",
  "¡Continúa! Eres un profesional excepcional.",
  "¡Magnífico! Tu compromiso marca la diferencia.",
  "¡Adelante! Cada empaque es una obra de arte.",
];

interface MotivationResponse {
  text: string;
  audioUrl: string | null;
}

/**
 * Obtiene una frase motivadora (API o fallback)
 */
async function getMotivationalPhrase(): Promise<string> {
  try {
    console.log("🧠 Solicitando frase motivadora a OpenRouter...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: "Genera una frase motivadora corta mexicana para trabajadores, sin texto adicional. Solo la frase en español.",
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const phrase =
        data?.choices?.[0]?.message?.content?.trim?.() ||
        data?.choices?.[0]?.message?.content?.[0]?.text?.trim?.();

      if (phrase) {
        console.log("✨ Frase generada por IA:", phrase);
        return phrase;
      }
    } else {
      console.warn(`⚠️ Error en OpenRouter (${response.status}), usando frase de fallback`);
    }
  } catch (error) {
    console.warn("⚠️ Error al generar frase con IA:", error);
  }

  // Usar frase de fallback
  const randomIndex = Math.floor(Math.random() * FALLBACK_PHRASES.length);
  const fallbackPhrase = FALLBACK_PHRASES[randomIndex];
  console.log("💬 Usando frase de fallback:", fallbackPhrase);
  return fallbackPhrase;
}

/**
 * Genera una frase motivadora usando OpenRouter (Gemini) y la convierte a audio con ElevenLabs
 */
export async function generatePackMotivation(): Promise<MotivationResponse | null> {
  try {
    // 1️⃣ Obtener la frase motivadora (IA o fallback)
    const phrase = await getMotivationalPhrase();

    if (!phrase) {
      console.error("⚠ No se pudo obtener una frase motivadora.");
      return null;
    }

    // 2️⃣ Intentar convertir texto a voz con ElevenLabs
    try {
      console.log("🎙 Generando audio con ElevenLabs...");

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: phrase,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.4, similarity_boost: 0.8 },
          }),
        }
      );

      if (ttsResponse.ok) {
        // Convertir la respuesta a blob y crear URL
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("✅ Audio generado exitosamente");
        
        return {
          text: phrase,
          audioUrl: audioUrl,
        };
      } else {
        console.warn(`⚠️ Error en ElevenLabs (${ttsResponse.status}), solo texto sin audio`);
      }
    } catch (audioError) {
      console.warn("⚠️ Error al generar audio:", audioError);
    }

    // Retornar solo el texto si falla el audio
    return {
      text: phrase,
      audioUrl: null,
    };
  } catch (error) {
    console.error("❌ Error al generar motivación:", error);
    return null;
  }
}

/**
 * Reproduce un audio motivacional
 */
export function playMotivationalAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.volume = 0.7; // Volumen al 70%
  audio.play().catch((err) => {
    console.error("❌ Error al reproducir audio:", err);
  });
  return audio;
}
