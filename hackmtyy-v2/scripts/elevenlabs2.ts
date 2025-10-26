import fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// --- 🔑 Tu API Key de ElevenLabs ---
const ELEVENLABS_API_KEY = "sk_830a945e429d51462bf7e79649fa6bde4633e158e65814fa";

// --- Cliente de ElevenLabs ---
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
  environment: "https://api.elevenlabs.io",
});

async function main() {
  console.log("🎶 Generando música relajante con ElevenLabs...");

  // --- Generar música ---
  const track = await client.music.compose({
    prompt: "relaxing instrumental ambient music with piano and soft synths",
    duration_seconds: 30, // duración deseada (máx. 120s)
    title: "Relax Track",
  });

  // --- Guardar el audio ---
  const outputPath = "musica.mp3";
  const file = fs.createWriteStream(outputPath);

  for await (const chunk of track) {
    file.write(chunk);
  }
  file.end();

  console.log(✅ Música guardada como ${outputPath});

  // --- Reproducir directamente (macOS) ---
  const { execSync } = await import("child_process");
  execSync(afplay ${outputPath});
}

main().catch((err) => {
  console.error("❌ Error:", err.response?.data || err.message);
});