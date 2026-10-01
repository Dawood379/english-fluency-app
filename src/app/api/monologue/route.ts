import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import { MONOLOGUE_PROMPTS } from "@/lib/monologue";
import type { MonologueAttempt } from "@/lib/types";

export { MONOLOGUE_PROMPTS };

const Body = z.object({
  promptId: z.number().int().min(0).max(2),
  day: z.number().int().min(1).max(70),
  milestone: z.string().max(40),
  durationSec: z.number().min(1).max(900),
  wordCount: z.number().min(0).max(10000),
  wpm: z.number().min(0).max(500),
  pauseCount: z.number().int().min(0).max(500).nullable(),
  transcript: z.string().max(12000).default(""),
  transcriptSource: z.enum(["web-speech", "groq", "manual", "none"]),
  audioPath: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid attempt." }, { status: 400 });
  const attempt: MonologueAttempt = {
    _id: newId(),
    userId: USER_ID,
    date: todayStr(),
    ...body.data,
    createdAt: new Date().toISOString(),
  };
  await dbInsert("monologues", attempt);
  return NextResponse.json({ attempt });
}

export async function GET() {
  const { dbFind } = await import("@/lib/db");
  const attempts = await dbFind<MonologueAttempt>("monologues", { userId: USER_ID });
  attempts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return NextResponse.json({ attempts, prompts: MONOLOGUE_PROMPTS });
}
