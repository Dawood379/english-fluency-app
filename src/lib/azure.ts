import { recordUsage } from "./usage";

/**
 * Azure AI Speech — Pronunciation Assessment (optional provider).
 *
 * This is the ONLY component allowed to produce pronunciation scores.
 * Research basis: an LLM judging pronunciation from a transcript is
 * invalid (ASR auto-corrects learner errors), and LLM audio judgement is
 * unreliable. Gemini explains these scores; it never invents them.
 *
 * Free F0 tier: 5 audio hours/month — plenty for daily drills.
 * Without AZURE_SPEECH_KEY / AZURE_SPEECH_REGION the drills run in
 * practice mode (record + listen back + target-sound guidance).
 */

export function azureConfigured(): boolean {
  return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
}

export interface WordScore {
  word: string;
  accuracy: number;
  errorType: string;
}

export interface PronScore {
  accuracy: number;
  fluency: number;
  completeness: number;
  pronScore: number;
  words: WordScore[];
}

export async function azurePronunciationScore(
  audio: ArrayBuffer,
  contentType: string,
  referenceText: string,
  durationSec: number
): Promise<PronScore | null> {
  if (!azureConfigured()) return null;
  const region = process.env.AZURE_SPEECH_REGION as string;
  const key = process.env.AZURE_SPEECH_KEY as string;
  const params = Buffer.from(
    JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true,
    })
  ).toString("base64");
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Pronunciation-Assessment": params,
      "Content-Type": contentType,
      Accept: "application/json",
    },
    body: audio,
  });
  await recordUsage({
    provider: "azure",
    model: "pronunciation-assessment",
    requests: 1,
    audioSeconds: durationSec,
    errors429: res.status === 429 ? 1 : 0,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    NBest?: {
      PronunciationAssessment?: {
        AccuracyScore?: number;
        FluencyScore?: number;
        CompletenessScore?: number;
        PronScore?: number;
      };
      Words?: {
        Word?: string;
        PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
      }[];
    }[];
  };
  const best = data.NBest?.[0];
  if (!best?.PronunciationAssessment) return null;
  const pa = best.PronunciationAssessment;
  return {
    accuracy: pa.AccuracyScore ?? 0,
    fluency: pa.FluencyScore ?? 0,
    completeness: pa.CompletenessScore ?? 0,
    pronScore: pa.PronScore ?? 0,
    words: (best.Words ?? []).map((w) => ({
      word: w.Word ?? "",
      accuracy: w.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: w.PronunciationAssessment?.ErrorType ?? "None",
    })),
  };
}
