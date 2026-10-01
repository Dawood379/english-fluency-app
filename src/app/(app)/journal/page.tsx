import { dbFind } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import type { JournalEntry } from "@/lib/types";
import JournalList from "@/components/JournalList";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries = await dbFind<JournalEntry>("journal", { userId: USER_ID });
  entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <JournalList initial={entries} />;
}
