import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { todayStr } from "@/lib/dates";

/** Records a listening self-check: score out of the lesson's questions. */
const Body = z.object({
  day: z.number().int().min(1).max(70),
  correct: z.number().int().min(0).max(20),
  total: z.number().int().min(1).max(20),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid check." }, { status: 400 });
  await dbInsert("listeningChecks", {
    _id: newId(),
    userId: USER_ID,
    date: todayStr(),
    day: body.data.day,
    correct: body.data.correct,
    total: body.data.total,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
