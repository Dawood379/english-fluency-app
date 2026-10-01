import { dbFind, ensureUser } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { dayNumber } from "@/lib/dates";
import type { MonologueAttempt } from "@/lib/types";
import MonologueTests from "@/components/MonologueTests";
import { MONOLOGUE_PROMPTS } from "@/lib/monologue";

export const dynamic = "force-dynamic";

export default async function MonologuePage() {
  const user = (await ensureUser(USER_ID)) as { programStart: string };
  const day = dayNumber(String(user.programStart ?? ""));
  const attempts = await dbFind<MonologueAttempt>("monologues", { userId: USER_ID });
  attempts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return <MonologueTests initial={attempts} prompts={MONOLOGUE_PROMPTS} day={day} />;
}
