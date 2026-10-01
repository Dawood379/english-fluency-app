import { dbFind, ensureUser } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { dayNumber } from "@/lib/dates";
import { getLessonServer } from "@/lib/lesson-server";
import { isDue } from "@/lib/fsrs-helpers";
import type { SrsCard } from "@/lib/types";
import SessionRunner from "@/components/SessionRunner";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const user = (await ensureUser(USER_ID)) as { programStart: string };
  const day = dayNumber(String(user.programStart ?? ""));
  const lesson = await getLessonServer(day);
  const cards = await dbFind<SrsCard>("cards", { userId: USER_ID });
  const due = cards.filter((c) => isDue(c));
  return <SessionRunner day={day} lesson={lesson} dueCards={due} />;
}
