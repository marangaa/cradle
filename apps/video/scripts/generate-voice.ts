import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { narrationText } from "../src/story";

const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
const outputPath = resolve(import.meta.dirname, "../../../public/video/audio/cradle-narration.mp3");

if (!apiKey || !voiceId) {
  throw new Error("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in apps/video/.env before generating narration.");
}

const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "xi-api-key": apiKey,
    Accept: "audio/mpeg",
  },
  body: JSON.stringify({
    text: narrationText,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.48, similarity_boost: 0.74, style: 0.18, use_speaker_boost: true },
  }),
});

if (!response.ok) {
  throw new Error(`ElevenLabs request failed (${response.status}): ${await response.text()}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
console.info(`Wrote narration to ${outputPath}`);
