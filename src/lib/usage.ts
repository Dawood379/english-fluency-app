import { dbFind, dbFindOne, dbInsert, dbUpdate, newId } from "./db";
import { USER_ID } from "./config";
import { todayStr } from "./dates";
import type { UsageDoc } from "./types";

/** Increment the per-day, per-provider usage ledger. Called by the provider
 *  layer on every external API call so the dashboard can show today's
 *  usage vs the planned free-tier budgets. */
export async function recordUsage(opts: {
  provider: "gemini" | "groq" | "azure";
  model: string;
  requests?: number;
  errors429?: number;
  audioSeconds?: number;
}): Promise<void> {
  const date = todayStr();
  try {
    const existing = await dbFindOne<UsageDoc>("usageLedger", {
      userId: USER_ID,
      date,
      provider: opts.provider,
      model: opts.model,
    });
    if (existing) {
      await dbUpdate("usageLedger", existing._id, {
        requests: existing.requests + (opts.requests ?? 0),
        errors429: existing.errors429 + (opts.errors429 ?? 0),
        audioSeconds: existing.audioSeconds + (opts.audioSeconds ?? 0),
      });
    } else {
      await dbInsert("usageLedger", {
        _id: newId(),
        userId: USER_ID,
        date,
        provider: opts.provider,
        model: opts.model,
        requests: opts.requests ?? 0,
        errors429: opts.errors429 ?? 0,
        audioSeconds: opts.audioSeconds ?? 0,
      });
    }
  } catch {
    // Usage accounting must never break the learning flow.
  }
}

export async function usageForDate(date: string): Promise<UsageDoc[]> {
  return dbFind<UsageDoc>("usageLedger", { userId: USER_ID, date });
}

export async function usageForMonth(monthPrefix: string): Promise<UsageDoc[]> {
  const all = await dbFind<UsageDoc>("usageLedger", { userId: USER_ID });
  return all.filter((u) => u.date.startsWith(monthPrefix));
}
