import Link from "next/link";
import { CalendarDays, ArrowRight, Flame } from "lucide-react";
import { dbFind, ensureUser } from "@/lib/db";
import { USER_ID, BUDGETS } from "@/lib/config";
import { dayNumber, forgivingStreak, todayStr, fmtSeconds } from "@/lib/dates";
import { getDay } from "@/lib/curriculum";
import { isDue, isMature } from "@/lib/fsrs-helpers";
import { usageForDate, usageForMonth } from "@/lib/usage";
import type { SessionRecord, SrsCard, MonologueAttempt, DrillScore } from "@/lib/types";
import { Card, H2, Meta, Badge, Empty } from "@/components/ui";
import { SparkLine } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = (await ensureUser(USER_ID)) as { programStart: string };
  const day = dayNumber(String(user.programStart ?? todayStr()));
  const outline = getDay(day);

  const sessions = await dbFind<SessionRecord>("sessions", { userId: USER_ID });
  const sessionDates = sessions.map((s) => s.date);
  const streak = forgivingStreak(sessionDates);
  const todayDone = sessionDates.includes(todayStr());

  const cards = await dbFind<SrsCard>("cards", { userId: USER_ID });
  const dueCount = cards.filter((c) => isDue(c)).length;
  const matureCount = cards.filter((c) => isMature(c)).length;

  const monologues = await dbFind<MonologueAttempt>("monologues", { userId: USER_ID });
  const wpmTrend = monologues.slice(-10).map((m) => m.wpm);

  const drills = await dbFind<DrillScore>("drillScores", { userId: USER_ID });
  const scoredDrills = drills.filter((d) => d.mode === "azure");
  const lastScore = scoredDrills.length ? (scoredDrills[scoredDrills.length - 1].pronScore ?? null) : null;

  // Usage vs budget
  const today = todayStr();
  const usageToday = await usageForDate(today);
  const geminiToday = usageToday.filter((u) => u.provider === "gemini").reduce((a, u) => a + u.requests, 0);
  const groqSec = usageToday.filter((u) => u.provider === "groq").reduce((a, u) => a + u.audioSeconds, 0);
  const azureMonth = (await usageForMonth(today.slice(0, 7)))
    .filter((u) => u.provider === "azure")
    .reduce((a, u) => a + u.audioSeconds, 0);

  const checklist = [
    { label: "Daily session completed", done: todayDone, href: "/session" },
    { label: `Flashcards reviewed (${dueCount} due)`, done: dueCount === 0 && cards.length > 0, href: "/flashcards" },
    { label: "Today's lesson opened", done: false, href: `/curriculum/${day}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Good morning. Day {day} of 70.</h1>
        <p className="mt-1 text-base text-ink-soft">
          {todayDone
            ? "Today's session is done — nicely done."
            : "Your daily session is waiting. Small and daily beats big and rare."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Flame size={16} aria-hidden /> Streak
          </div>
          <p className="mt-1 text-3xl font-semibold">{streak} <span className="text-base font-normal text-ink-faint">days</span></p>
          <Meta>One missed day never breaks it — two in a row do.</Meta>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <CalendarDays size={16} aria-hidden /> Flashcards
          </div>
          <p className="mt-1 text-3xl font-semibold">{dueCount} <span className="text-base font-normal text-ink-faint">due</span></p>
          <Meta>{cards.length} total cards · {matureCount} mature</Meta>
        </Card>
        <Card>
          <H2>Pronunciation</H2>
          <p className="mt-1 text-3xl font-semibold">
            {lastScore !== null ? `${Math.round(lastScore)}` : "—"}
            <span className="text-base font-normal text-ink-faint">{lastScore !== null ? " last Azure score" : " no Azure score yet"}</span>
          </p>
          <Meta>{scoredDrills.length} scored drills recorded</Meta>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <H2>Today's checklist</H2>
          <Link href="/session" className="inline-flex items-center gap-1 text-sm font-medium text-accent-dark hover:underline">
            Start session <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${c.done ? "border-accent bg-accent text-white" : "border-ink-faint"}`}
                aria-hidden
              >
                {c.done ? "✓" : ""}
              </span>
              <Link href={c.href} className="text-base hover:text-accent-dark hover:underline">{c.label}</Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-medium text-ink-soft">Today's lesson: {outline.theme}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="accent">{outline.track}</Badge>
            <Badge>{outline.targetSound}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <H2>Speaking speed (WPM)</H2>
          <Meta>From monologue tests — measured, not guessed.</Meta>
          <div className="mt-3">
            {wpmTrend.length >= 2 ? <SparkLine values={wpmTrend} /> : <Empty title="No trend yet" hint="Record your Day 1 monologue to start the chart." />}
          </div>
        </Card>
        <Card>
          <H2>Free-tier usage today</H2>
          <Meta>Watched so a free tier never surprises you.</Meta>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Gemini calls</dt><dd className="font-medium">{geminiToday} / {BUDGETS.geminiLitePerDay + BUDGETS.geminiFlashPerDay} planned</dd></div>
            <div className="flex justify-between"><dt>Groq audio</dt><dd className="font-medium">{fmtSeconds(groqSec)} / {fmtSeconds(BUDGETS.groqAudioSecondsPerDay)}</dd></div>
            <div className="flex justify-between"><dt>Azure audio (month)</dt><dd className="font-medium">{fmtSeconds(azureMonth)} / {fmtSeconds(BUDGETS.azureAudioSecondsPerMonth)}</dd></div>
          </dl>
          <Link href="/settings" className="mt-3 inline-block text-sm font-medium text-accent-dark hover:underline">Manage providers</Link>
        </Card>
      </div>
    </div>
  );
}
