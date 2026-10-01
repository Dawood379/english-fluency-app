/**
 * Central configuration. Every model ID is configurable via env because
 * free-tier model availability changes often. Nothing here reads secrets
 * into client code — this module is imported by server code only, except
 * for the pure constants (budgets) which contain no secrets.
 */

export const USER_ID = "owner";

export const MODELS = {
  /** Default workhorse for generation + batched feedback (free tier friendly). */
  lite: process.env.GEMINI_MODEL_LITE || "gemini-2.5-flash-lite",
  /** Alternate Lite used by the 429 fallback chain. */
  liteAlt: process.env.GEMINI_MODEL_LITE_ALT || "gemini-2.0-flash-lite",
  /** Full Flash — guarded, weekly review / hardest jobs only (~20 req/day). */
  flash: process.env.GEMINI_MODEL_FLASH || "gemini-2.5-flash",
};

export const GROQ_MODEL = process.env.GROQ_MODEL || "whisper-large-v3-turbo";

/** Planned daily budgets from the design research. The dashboard compares
 *  today's usage ledger against these numbers. */
export const BUDGETS = {
  geminiLitePerDay: 500,
  geminiFlashPerDay: 20,
  groqAudioSecondsPerDay: 8 * 60 * 60, // Groq free tier ≈ 8 audio-hours/day
  azureAudioSecondsPerMonth: 5 * 60 * 60, // Azure F0 free tier = 5 audio hrs/month
};

export function providerStatus() {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    azure: Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION),
    mongo: Boolean(process.env.MONGODB_URI),
    passwordGate: Boolean(process.env.APP_PASSWORD),
  };
}
