import fs from "fs";
import process from "node:process";
import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// --- 🔑 OBTENER CLAVES DESDE .ENV ---
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.VITE_ELEVENLABS_VOICE_ID;

// --- SOLICITUD A GEMINI (VÍA OPENROUTER) ---
const payload = {
  model: "google/gemini-2.5-pro",
  messages: [
    {
      role: "user",
      content: "Genera una frase motivadora corta mexicana, sin texto adicional. Solo la frase.",
    },
  ],
};

async function main() {
  console.log("🧠 Solicitando frase motivadora a OpenRouter...");

  // --- 1️⃣ Obtener la frase motivadora ---
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`❌ Error en OpenRouter (${response.status}):`, await response.text());
    process.exit(1);
  }

  const data = await response.json();
  const phrase =
    data?.choices?.[0]?.message?.content?.trim?.() ||
    data?.choices?.[0]?.message?.content?.[0]?.text?.trim?.();

  if (!phrase) {
    console.error("⚠ No se pudo extraer una frase del modelo.");
    process.exit(1);
  }

  console.log("\n✨ Frase generada:");
  console.log(phrase);

  // --- 2️⃣ Convertir texto a voz con ElevenLabs ---
  console.log("\n🎙 Generando audio con ElevenLabs...");

  const ttsResponse = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      text: phrase,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.4, similarity_boost: 0.8 },
    },
    {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer", // 🔥 importante para recibir bytes
    }
  );

  fs.writeFileSync("motivacion.mp3", ttsResponse.data);
  console.log("✅ Audio guardado como motivacion.mp3");

  // --- 3️⃣ Reproducir el audio (Windows) ---
  console.log("🎧 Reproduciendo...");
  const { execSync } = await import("child_process");
  
  // Para Windows: abre el archivo con el reproductor predeterminado
  try {
    execSync('start motivacion.mp3', { shell: true });
    console.log("🎵 Audio abierto en tu reproductor predeterminado");
  } catch (err) {
    console.log("⚠️ No se pudo abrir automáticamente. Abre motivacion.mp3 manualmente.");
  }
}

main().catch((err) => {
  console.error("❌ Error general:", err.response?.data || err.message);
});
