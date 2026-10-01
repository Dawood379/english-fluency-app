import { dbFind } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { isMature } from "@/lib/fsrs-helpers";
import type { MonologueAttempt, DrillScore, SrsCard, JournalEntry } from "@/lib/types";
import { Card, H2, Badge, Meta, Empty } from "@/components/ui";
import { SparkLine, BarChart } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [monologues, drills, cards, journal, checks] = await Promise.all([
    dbFind<MonologueAttempt>("monologues", { userId: USER_ID }),
    dbFind<DrillScore>("drillScores", { userId: USER_ID }),
    dbFind<SrsCard>("cards", { userId: USER_ID }),
    dbFind<JournalEntry>("journal", { userId: USER_ID }),
    dbFind<{ date: string; correct: number; total: number }>("listeningChecks", { userId: USER_ID }),
  ]);
  monologues.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const byPrompt = [0, 1, 2].map((pid) => {
    const ms = monologues.filter((m) => m.promptId === pid);
    const first = ms[0];
    const last = ms[ms.length - 1];
    return { pid, count: ms.length, first, last };
  });

  const azureDrills = drills.filter((d) => d.mode === "azure" && d.pronScore !== undefined);
  const azureTrend = azureDrills.slice(-12).map((d) => d.pronScore as number);

  const errorByCategory = journal.reduce<Record<string, number>>((acc, j) => {
    acc[j.category] = (acc[j.category] ?? 0) + 1;
    return acc;
  }, {});
  const catLabels = Object.keys(errorByCategory);

  const mature = cards.filter((c) => isMature(c)).length;
  const listenScores = checks.slice(-10).map((c) => Math.round((c.correct / c.total) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-base text-ink-soft">Measured numbers only. Every score below carries its provenance.</p>
      </div>

      <Card>
        <H2>Monologue battery — Day 1 vs latest</H2>
        <Meta>Same prompts each time. WPM, duration and pauses are measured client-side.</Meta>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-faint">
                <th className="py-2 pr-3">Prompt</th><th className="py-2 pr-3">Attempts</th>
                <th className="py-2 pr-3">First WPM</th><th className="py-2 pr-3">Latest WPM</th><th className="py-2 pr-3">Δ pauses</th>
              </tr>
            </thead>
            <tbody>
              {byPrompt.map(({ pid, count, first, last }) => (
                <tr key={pid} className="border-b border-line/60">
                  <td className="py-2 pr-3 font-medium">Prompt {pid + 1}</td>
                  <td className="py-2 pr-3">{count}</td>
                  <td className="py-2 pr-3">{first ? first.wpm : "—"}</td>
                  <td className="py-2 pr-3 font-semibold">{last ? last.wpm : "—"}</td>
                  <td className="py-2 pr-3">
                    {first && last && first.pauseCount !== null && last.pauseCount !== null
                      ? (last.pauseCount - first.pauseCount)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <H2>Azure PronScore trend</H2>
          <Meta>measured (Azure Pronunciation Assessment)</Meta>
          <div className="mt-3">
            {azureTrend.length >= 2 ? <SparkLine values={azureTrend} /> : <Empty title="No scored drills yet" hint="Run a pronunciation drill with Azure keys for real scores." />}
          </div>
        </Card>
        <Card>
          <H2>Listening checks (%)</H2>
          <Meta>measured (self-marked quizzes)</Meta>
          <div className="mt-3">
            {listenScores.length >= 2 ? <SparkLine values={listenScores} /> : <Empty title="No listening checks yet" hint="Answer the quizzes on lesson pages." />}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <H2>Mistakes by category</H2>
          <Meta>{journal.length} journal entries total</Meta>
          <div className="mt-3">
            {catLabels.length > 0 ? (
              <BarChart values={catLabels.map((c) => errorByCategory[c])} labels={catLabels.map((c) => c.slice(0, 6))} />
            ) : <Empty title="No data yet" hint="Errors from speaking feedback appear here." />}
          </div>
        </Card>
        <Card>
          <H2>Flashcards</H2>
          <Meta>FSRS scheduling, local and free</Meta>
          <dl className="mt-3 space-y-2 text-base">
            <div className="flex justify-between"><dt>Total cards</dt><dd className="font-semibold">{cards.length}</dd></div>
            <div className="flex justify-between"><dt>Mature cards</dt><dd className="font-semibold">{mature}</dd></div>
            <div className="flex justify-between"><dt>From mistakes</dt><dd className="font-semibold">{cards.filter((c) => c.kind === "error").length}</dd></div>
          </dl>
          <div className="mt-3"><Badge tone="good">measured (FSRS state)</Badge></div>
        </Card>
      </div>
    </div>
  );
}
