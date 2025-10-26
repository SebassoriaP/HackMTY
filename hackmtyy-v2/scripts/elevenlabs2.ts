import fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// --- 🔑 Obtener API Key desde .env ---
const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  throw new Error("VITE_ELEVENLABS_API_KEY no está configurada en .env");
}

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