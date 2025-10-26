// --- 🔑 API KEYS ---
const OPENROUTER_API_KEY = "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";
const ELEVENLABS_API_KEY = "sk_830a945e429d51462bf7e79649fa6bde4633e158e65814fa";
const ELEVENLABS_VOICE_ID = "zA6D7RyKdc2EClouEMkP";

// --- Generar frase motivadora y convertirla a audio ---
export async function generateMotivationalAudio(): Promise<Blob | null> {
  console.log("🧠 Solicitando frase motivadora a OpenRouter...");

  // --- 1️⃣ Obtener la frase motivadora ---
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        {
          role: "user",
          content: "Genera una frase motivadora corta, sin texto adicional. Solo la frase.",
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

  // --- 2️⃣ Convertir texto a voz con ElevenLabs ---
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
    console.error("❌ Error en ElevenLabs:", await ttsResponse.text());
    return null;
  }

  const audioBlob = await ttsResponse.blob();
  console.log("✅ Audio generado correctamente");

  return audioBlob;
}

// --- Ejemplo de uso en el navegador ---
export async function playMotivationalAudio() {
  const audioBlob = await generateMotivationalAudio();
  
  if (!audioBlob) {
    console.error("❌ No se pudo generar el audio");
    return;
  }

  // Crear URL temporal del audio y reproducirlo
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  audio.play().catch((err) => {
    console.error("❌ Error al reproducir:", err);
  });

  console.log("🎧 Reproduciendo audio motivacional...");
}
