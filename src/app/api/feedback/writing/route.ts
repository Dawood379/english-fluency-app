import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiJson, geminiConfigured } from "@/lib/gemini";

const Body = z.object({
  text: z.string().min(1).max(2000),
  prompt: z.string().max(300),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!geminiConfigured()) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 503 });
  }
  const result = await geminiJson<{
    corrected: string;
    errors: { original: string; correction: string; explanationEn: string; explanationUrdu: string }[];
  }>(`Correct this short English paragraph written by an adult Urdu-speaking learner (CEFR A2-B1). Keep the writer's meaning. Respond JSON only:
{"corrected": string, "errors": [{"original": string, "correction": string, "explanationEn": string, "explanationUrdu": string (Roman Urdu)}]}
Writing prompt was: "${body.data.prompt}"
Their text: "${body.data.text}"`);
  if (!result) return NextResponse.json({ error: "Correction failed (free-tier limit may be reached)." }, { status: 429 });
  return NextResponse.json({ ...result.data, provenance: "AI-judged" });
}
