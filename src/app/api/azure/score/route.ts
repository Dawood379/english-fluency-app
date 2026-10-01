import { NextResponse } from "next/server";
import { z } from "zod";
import { azurePronunciationScore, azureConfigured } from "@/lib/azure";
import { dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { todayStr } from "@/lib/dates";

/**
 * Pronunciation scoring — the ONLY endpoint allowed to return pronunciation
 * scores, and only when Azure keys are configured. Otherwise the drill runs
 * in practice mode (record + listen back), clearly labelled.
 */

const Body = z.object({
  referenceText: z.string().min(1).max(1000),
  durationSec: z.number().min(1).max(600),
  contentType: z.string().max(80),
  day: z.number().int().min(1).max(70),
  targetSound: z.string().max(60),
  audioB64: z.string().max(20_000_000),
});

export async function POST(req: Request) {
  if (!azureConfigured()) {
    return NextResponse.json({ mode: "practice", note: "Add AZURE_SPEECH_KEY + AZURE_SPEECH_REGION for real scores. Practice mode: record, listen back, and compare yourself against the target sound." });
  }
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { referenceText, durationSec, contentType, day, targetSound, audioB64 } = body.data;

  const audioBuf = Buffer.from(audioB64, "base64");
  const audio = audioBuf.buffer.slice(audioBuf.byteOffset, audioBuf.byteOffset + audioBuf.byteLength) as ArrayBuffer;
  const score = await azurePronunciationScore(audio, contentType, referenceText, durationSec);
  if (!score) {
    return NextResponse.json({ mode: "practice", note: "Azure scoring failed for this take — counted as practice. Check your Azure key/region in Settings." });
  }
  await dbInsert("drillScores", {
    _id: newId(),
    userId: USER_ID,
    date: todayStr(),
    day,
    targetSound,
    mode: "azure",
    accuracy: score.accuracy,
    fluency: score.fluency,
    completeness: score.completeness,
    pronScore: score.pronScore,
    sentences: 1,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ mode: "azure", score, provenance: "measured (Azure Pronunciation Assessment)" });
}
