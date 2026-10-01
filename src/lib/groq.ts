import { GROQ_MODEL } from "./config";
import { recordUsage } from "./usage";

/** Optional speech-to-text via Groq's free Whisper tier.
 *  Returns null when not configured — callers fall back to the browser
 *  Web Speech API or manual transcripts. */

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function groqTranscribe(
  audio: Blob,
  filename = "audio.webm"
): Promise<{ text: string; durationSec: number } | null> {
  if (!groqConfigured()) return null;
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", GROQ_MODEL);
  form.append("response_format", "verbose_json");
  form.append("language", "en");
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });
  if (res.status === 429) {
    await recordUsage({ provider: "groq", model: GROQ_MODEL, requests: 1, errors429: 1 });
    return null;
  }
  await recordUsage({ provider: "groq", model: GROQ_MODEL, requests: 1 });
  if (!res.ok) return null;
  const data = (await res.json()) as { text?: string; duration?: number };
  const durationSec = data.duration ?? 0;
  if (durationSec > 0) {
    await recordUsage({ provider: "groq", model: GROQ_MODEL, audioSeconds: durationSec });
  }
  return { text: data.text ?? "", durationSec };
}
