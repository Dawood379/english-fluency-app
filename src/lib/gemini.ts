import { MODELS } from "./config";
import { recordUsage } from "./usage";

/**
 * Gemini provider — async-first, batch-friendly.
 *
 * Fallback chain on HTTP 429 (free-tier rate limit):
 *   Flash-Lite → alternate Lite → full Flash (guarded budget) → null
 * Returning null means "degrade gracefully": offline parts of the lesson
 * must always work, AI extras simply switch off for today.
 */

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GenResult {
  text: string;
  model: string;
}

async function callGemini(model: string, prompt: string, jsonMode: boolean): Promise<GenResult> {
  const key = process.env.GEMINI_API_KEY as string;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 4096,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });
  if (res.status === 429) {
    await recordUsage({ provider: "gemini", model, requests: 1, errors429: 1 });
    const err = new Error("RATE_LIMIT");
    (err as Error & { rateLimit?: boolean }).rateLimit = true;
    throw err;
  }
  await recordUsage({ provider: "gemini", model, requests: 1 });
  if (!res.ok) {
    throw new Error(`Gemini ${model} failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error(`Gemini ${model} returned an empty response`);
  return { text, model };
}

/** Full Flash budget guard: at most N calls/day (default from BUDGETS). */
let flashCallsToday = 0;
let flashDayStamp = "";
function flashAllowed(maxPerDay: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (flashDayStamp !== today) {
    flashDayStamp = today;
    flashCallsToday = 0;
  }
  if (flashCallsToday >= maxPerDay) return false;
  flashCallsToday += 1;
  return true;
}

export async function geminiGenerate(
  prompt: string,
  opts: { json?: boolean; allowFlash?: boolean; flashMaxPerDay?: number } = {}
): Promise<GenResult | null> {
  if (!geminiConfigured()) return null;
  const chain = [MODELS.lite, MODELS.liteAlt];
  for (const model of chain) {
    try {
      return await callGemini(model, prompt, Boolean(opts.json));
    } catch (e) {
      if ((e as { rateLimit?: boolean }).rateLimit) continue;
      throw e;
    }
  }
  if (opts.allowFlash && flashAllowed(opts.flashMaxPerDay ?? 20)) {
    try {
      return await callGemini(MODELS.flash, prompt, Boolean(opts.json));
    } catch {
      return null;
    }
  }
  return null;
}

export async function geminiJson<T>(
  prompt: string,
  opts: { allowFlash?: boolean } = {}
): Promise<{ data: T; model: string } | null> {
  const res = await geminiGenerate(prompt, { json: true, allowFlash: opts.allowFlash });
  if (!res) return null;
  try {
    return { data: JSON.parse(res.text) as T, model: res.model };
  } catch {
    return null;
  }
}
