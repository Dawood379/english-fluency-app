import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { todayStr } from "@/lib/dates";

const Body = z.object({
  day: z.number().int().min(1).max(70),
  stepsCompleted: z.array(z.string().max(40)).max(20),
  minutes: z.number().min(0).max(600),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid session record." }, { status: 400 });
  const date = todayStr();
  await dbInsert("sessions", {
    _id: `${date}-${newId()}`,
    userId: USER_ID,
    date,
    day: body.data.day,
    stepsCompleted: body.data.stepsCompleted,
    minutes: body.data.minutes,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
