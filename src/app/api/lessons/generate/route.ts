import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { dbFindOne, dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { getDay, targetSoundNote } from "@/lib/curriculum";
import { templateLesson } from "@/lib/lessons";
import { geminiJson, geminiConfigured } from "@/lib/gemini";
import type { LessonContent } from "@/lib/types";

/**
 * Generate a lesson ONCE and cache it in MongoDB keyed by a content hash
 * (day + lesson schema version). Replays and re-reads cost zero API calls.
 * Without a Gemini key, or if generation fails, returns the offline
 * template so the lesson page is never empty.
 */

const LESSON_VERSION = 1;

const LessonJsonSchema = `
Respond with JSON only, matching this TypeScript shape exactly:
{
  "dialogue": [{"speaker": string, "line": string, "urdu"?: string}],
  "shadowing": string[],
  "listeningText": string,
  "listeningQuestions": [{"q": string, "options": [string, string, string], "answer": number}],
  "drills": [{"sentence": string, "note"?: string}],
  "speakingPrompt": string,
  "writingPrompt": string,
  "phrases": [{"en": string, "urdu": string}],
  "vocab": [{"word": string, "meaning": string, "example": string}]
}
Rules: dialogue 6-8 lines; shadowing 5 short lines; listeningText ~120 words;
3 listening questions with exactly 3 options; 6 drills where EVERY sentence
practises the target sound; phrases 5 entries, urdu in Roman Urdu; vocab 5 entries.
The learner is an adult Urdu-speaking software developer from Pakistan.
All instructions and urdu fields in Roman Urdu. No emojis.`;

function promptFor(day: number): string {
  const o = getDay(day);
  return `Write Day ${day} of a 70-day English speaking course. Theme: "${o.theme}".
Track: ${o.track}. Scenario for the dialogue and speaking prompt: "${o.scenario}".
Target sound of the day: ${o.targetSound}. Guidance: ${targetSoundNote(o.targetSoundKey)}.
Vocabulary focus: ${o.vocabFocus.join(", ")}.
Keep the CEFR A2-B1 level, Pakistani cultural context, and make the dialogue a real situation (not a textbook).
${LessonJsonSchema}`;
}

const Body = z.object({ day: z.number().int().min(1).max(70) });

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  const day = body.data.day;
  const key = `lesson:v${LESSON_VERSION}:day${day}`;

  const cached = await dbFindOne<{ content: LessonContent }>("contentCache", { _id: key, userId: USER_ID });
  if (cached) return NextResponse.json({ lesson: cached.content, source: "cache" });

  if (!geminiConfigured()) {
    const lesson = templateLesson(day);
    return NextResponse.json({ lesson, source: "template", note: "Set GEMINI_API_KEY to generate the full lesson." });
  }

  const generated = await geminiJson<Omit<LessonContent, "day" | "title" | "source" | "targetSound" | "targetSoundNote">>(
    promptFor(day)
  );
  const outline = getDay(day);
  if (!generated) {
    const lesson = templateLesson(day);
    return NextResponse.json({ lesson, source: "template", note: "Generation failed or free-tier limit reached — using the offline template for today." });
  }
  const lesson: LessonContent = {
    ...generated.data,
    day,
    title: outline.theme,
    source: "generated",
    targetSound: outline.targetSound,
    targetSoundNote: targetSoundNote(outline.targetSoundKey),
  };
  await dbInsert("contentCache", {
    _id: key,
    userId: USER_ID,
    kind: "lesson",
    day,
    version: LESSON_VERSION,
    hash: crypto.createHash("sha256").update(promptFor(day)).digest("hex"),
    content: lesson,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ lesson, source: "generated", model: generated.model });
}
