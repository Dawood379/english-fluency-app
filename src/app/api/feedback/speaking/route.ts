import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { geminiJson, geminiConfigured } from "@/lib/gemini";
import { todayStr } from "@/lib/dates";
import { emptyFsrsState } from "@/lib/fsrs-helpers";
import type { JournalEntry, SrsCard } from "@/lib/types";

/**
 * ONE batched Gemini call per speaking take: grammar + fluency + better
 * phrases, with Urdu explanations. Grammar feedback from a transcript is
 * valid (transcription errors are the only caveat — they are labelled).
 * Pronunciation is NEVER judged here; that belongs to the Azure module.
 */

const Body = z.object({
  transcript: z.string().min(1).max(8000),
  scenario: z.string().max(300),
  day: z.number().int().min(1).max(70),
  audioPath: z.string().optional(),
});

const PROMPT = (transcript: string, scenario: string) => `You are an English coach for an adult Urdu-speaking software developer from Pakistan (CEFR A2-B1).
Scenario: "${scenario}".
Here is their transcribed spoken answer (note: the transcript may contain small ASR errors; never comment on pronunciation — you cannot judge pronunciation from text):

"${transcript}"

Respond with JSON only:
{
  "errors": [{"original": string, "correction": string, "category": "articles|word-order|prepositions|verb-forms|vocabulary|fluency|other", "explanationEn": string (one short sentence), "explanationUrdu": string (one short sentence, Roman Urdu)}],
  "fluencyNotes": string (2-3 sentences: pacing, filler words, sentence length),
  "betterPhrases": [string, string, string] (native-like upgrades of things they said),
  "summary": string (2 sentences of encouragement + the single most important fix)
}
Rules: maximum 6 errors, ranked by importance. If the transcript is fine, return empty errors and say so. No emojis.`;

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { transcript, scenario, day, audioPath } = body.data;

  if (!geminiConfigured()) {
    return NextResponse.json({
      error: "GEMINI_API_KEY is not configured — feedback needs the key. Your recording and transcript were kept; run feedback later from Settings.",
      transcript,
    }, { status: 503 });
  }

  const result = await geminiJson<{
    errors: { original: string; correction: string; category: string; explanationEn: string; explanationUrdu: string }[];
    fluencyNotes: string;
    betterPhrases: string[];
    summary: string;
  }>(PROMPT(transcript, scenario));

  if (!result) {
    return NextResponse.json({
      error: "Feedback failed (free-tier limit may be reached). Your recording is saved — try again later or tomorrow.",
      transcript,
    }, { status: 429 });
  }

  // Write errors to the Mistake Journal + spawn FSRS cards automatically.
  const date = todayStr();
  const journalIds: string[] = [];
  const cardIds: string[] = [];
  for (const e of result.data.errors.slice(0, 6)) {
    const entryId = newId();
    const entry: JournalEntry = {
      _id: entryId,
      userId: USER_ID,
      date,
      day,
      category: e.category as JournalEntry["category"],
      original: e.original,
      correction: e.correction,
      explanationEn: e.explanationEn,
      explanationUrdu: e.explanationUrdu,
      source: "speaking",
      createdAt: new Date().toISOString(),
    };
    await dbInsert("journal", entry);
    journalIds.push(entryId);

    const cardId = newId();
    const card: SrsCard = {
      _id: cardId,
      userId: USER_ID,
      front: `Fix: ${e.original}`,
      back: `${e.correction}\n${e.explanationEn}\n${e.explanationUrdu}`,
      kind: "error",
      sourceId: entryId,
      ...emptyFsrsState(),
      createdAt: new Date().toISOString(),
    };
    await dbInsert("cards", card);
    cardIds.push(cardId);
  }

  return NextResponse.json({
    feedback: result.data,
    model: result.model,
    provenance: "AI-judged (from transcript; pronunciation excluded)",
    journalIds,
    cardIds,
    transcript,
    audioPath,
  });
}
