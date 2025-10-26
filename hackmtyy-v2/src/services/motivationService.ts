// Servicio de motivación para PackView
// Basado en generateMotivation.mjs

const OPENROUTER_API_KEY = "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";
const ELEVENLABS_API_KEY = "sk_830a945e429d51462bf7e79649fa6bde4633e158e65814fa";
const ELEVENLABS_VOICE_ID = "zA6D7RyKdc2EClouEMkP";

interface MotivationResponse {
  text: string;
  audioUrl: string | null;
}

/**
 * Genera una frase motivadora usando OpenRouter (Gemini) y la convierte a audio con ElevenLabs
 */
export async function generatePackMotivation(): Promise<MotivationResponse | null> {
  try {
    console.log("🧠 Solicitando frase motivadora a OpenRouter...");

    // 1️⃣ Obtener la frase motivadora de Gemini
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
            content: "Genera una frase motivadora corta para trabajadores de empaque de aerolíneas, sin texto adicional. Solo la frase en español.",
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`❌ Error en OpenRouter (${response.status}):`, await response.text());
      return null;
    }

    const data = await response.json();
    const phrase =
      data?.choices?.[0]?.message?.content?.trim?.() ||
      data?.choices?.[0]?.message?.content?.[0]?.text?.trim?.();

    if (!phrase) {
      console.error("⚠ No se pudo extraer una frase del modelo.");
      return null;
    }

    console.log("✨ Frase generada:", phrase);

    // 2️⃣ Convertir texto a voz con ElevenLabs
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

    if (!ttsResponse.ok) {
      console.error(`❌ Error en ElevenLabs (${ttsResponse.status}):`, await ttsResponse.text());
      return { text: phrase, audioUrl: null };
    }

    // Convertir la respuesta a blob y crear URL
    const audioBlob = await ttsResponse.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log("✅ Audio generado exitosamente");

    return {
      text: phrase,
      audioUrl: audioUrl,
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
