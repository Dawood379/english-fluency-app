import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, dbFind, dbUpdate, dbDelete, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { todayStr } from "@/lib/dates";
import type { JournalEntry } from "@/lib/types";

const CATEGORIES = [
  "articles", "word-order", "prepositions", "verb-forms", "v-w", "th",
  "pronunciation", "vocabulary", "fluency", "other",
] as const;

const Body = z.object({
  category: z.enum(CATEGORIES),
  original: z.string().min(1).max(500),
  correction: z.string().min(1).max(500),
  explanationEn: z.string().min(1).max(500),
  explanationUrdu: z.string().max(500).optional().default(""),
  source: z.enum(["speaking", "writing", "manual", "drill"]).default("manual"),
  day: z.number().int().min(1).max(70),
});

export async function GET() {
  const entries = await dbFind<JournalEntry>("journal", { userId: USER_ID });
  entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid entry." }, { status: 400 });
  const entry: JournalEntry = {
    _id: newId(),
    userId: USER_ID,
    date: todayStr(),
    ...body.data,
    createdAt: new Date().toISOString(),
  };
  await dbInsert("journal", entry);
  return NextResponse.json({ entry });
}

const DeleteBody = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  const body = DeleteBody.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  await dbDelete("journal", body.data.id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const body = z.object({ id: z.string().min(1), cardId: z.string().optional() }).safeParse(
    await req.json().catch(() => ({}))
  );
  if (!body.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await dbUpdate("journal", body.data.id, { cardId: body.data.cardId });
  return NextResponse.json({ ok: true });
}
