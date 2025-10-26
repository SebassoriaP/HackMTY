import fs from "fs";
import { ElevenLabsClient } from "elevenlabs";
import dotenv from "dotenv";

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
});

async function main() {
  console.log("🎶 Generando música relajante con ElevenLabs...");

  try {
    // --- Generar música ---
    const track = await client.textToSoundEffects.convert({
      text: "relaxing instrumental ambient music with violin and soft synths, calm meditation music",
      duration_seconds: 30, // duración deseada
      prompt_influence: 0.5,
    });

    // --- Guardar el audio ---
    const outputPath = "musica.mp3";
    const fileStream = fs.createWriteStream(outputPath);

    // Escribir los chunks de audio
    for await (const chunk of track) {
      fileStream.write(chunk);
    }
    
    fileStream.end();

    // Esperar a que termine de escribir
    await new Promise((resolve) => fileStream.on('finish', resolve));

    console.log(`✅ Música guardada como ${outputPath}`);

    // --- Reproducir directamente (Windows) ---
    console.log("🎧 Reproduciendo...");
    const { execSync } = await import("child_process");
    
    try {
      execSync(`start ${outputPath}`, { shell: true });
      console.log("🎵 Música abierta en tu reproductor predeterminado");
    } catch (err) {
      console.log(`⚠️ No se pudo abrir automáticamente. Abre ${outputPath} manualmente.`);
    }
  } catch (error) {
    console.error("❌ Error al generar música:", error.message);
    if (error.response?.data) {
      console.error("Detalles:", error.response.data);
    }
  }
}

main().catch((err) => {
  console.error("❌ Error general:", err.message);
});
