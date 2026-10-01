export function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function dayNumber(programStart: string, d = new Date()): number {
  const start = new Date(programStart + "T00:00:00Z").getTime();
  const now = new Date(todayStr(d) + "T00:00:00Z").getTime();
  const n = Math.floor((now - start) / 86400000) + 1;
  return Math.min(Math.max(n, 1), 70);
}

/**
 * Forgiving streak: count consecutive practised days ending today (or
 * yesterday). A single missed day does NOT zero the streak — it is only
 * broken by two missed days in a row.
 */
export function forgivingStreak(sessionDates: string[], d = new Date()): number {
  const set = new Set(sessionDates);
  let streak = 0;
  let misses = 0;
  const cursor = new Date(todayStr(d) + "T00:00:00Z");
  // If today has no session yet, start from yesterday without penalty.
  if (!set.has(todayStr(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (misses <= 1) {
    const key = todayStr(cursor);
    if (set.has(key)) {
      streak += 1;
      misses = 0;
    } else {
      misses += 1;
      if (streak === 0 && misses > 1) break;
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 0 && misses > 1) break;
  }
  return streak;
}

export function fmtSeconds(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)}m`;
  return `${(sec / 3600).toFixed(1)}h`;
}
