import fs from "fs";
import { ElevenLabsClient } from "elevenlabs";

// --- 🔑 Tu API Key de ElevenLabs ---
const ELEVENLABS_API_KEY = "sk_830a945e429d51462bf7e79649fa6bde4633e158e65814fa";

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
