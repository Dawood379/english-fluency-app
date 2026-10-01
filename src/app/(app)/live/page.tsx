"use client";

import { useEffect, useRef, useState } from "react";
import { Timer, AlertTriangle } from "lucide-react";
import { Card, H2, Badge, Btn } from "@/components/ui";

/**
 * Live conversation page — structured placeholder.
 *
 * TODO: wire to the Gemini Live API via a WebSocket + ephemeral token flow
 * when ready. Design from the research: 2–3×/week, 8–10 minutes max, hard
 * timer enforced in the UI, transcript saved to the Mistake Journal after.
 * Live is for fluency practice only — pronunciation scores still come from
 * Azure drills, never from a Live session.
 */

const SCENARIOS = [
  "Client discovery call",
  "Project status update",
  "Job interview",
  "Coffee break small talk",
];

const LIVE_BUDGET_SECONDS = 8 * 60;

export default function LivePage() {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= LIVE_BUDGET_SECONDS) {
          setRunning(false);
          return LIVE_BUDGET_SECONDS;
        }
        return e + 1;
      });
    }, 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [running]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  async function saveNotes() {
    if (!notes.trim()) return;
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "fluency",
        original: `Live session (${scenario})`,
        correction: notes.trim().slice(0, 400),
        explanationEn: "Session notes — mistakes to drill this week.",
        explanationUrdu: "",
        day: 1,
        source: "manual",
      }),
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Live conversation</h1>
        <p className="mt-1 text-base text-ink-soft">
          Real-time speaking practice — 2–3 times a week, 8–10 minutes each. Hard timer keeps free-tier usage tiny.
        </p>
        <div className="mt-2"><Badge tone="warn">Placeholder — Gemini Live wiring is a TODO (see below)</Badge></div>
      </div>

      <Card>
        <H2>Session setup</H2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${scenario === s ? "border-accent bg-accent-soft text-accent-dark" : "border-line"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Timer size={22} className="text-accent-dark" aria-hidden />
          <span className="font-mono text-4xl font-semibold tabular-nums">{mm}:{ss}</span>
          <span className="text-sm text-ink-faint">/ 08:00 max</span>
        </div>
        {!running && elapsed === 0 && (
          <Btn className="mt-4" onClick={() => setRunning(true)}>Start {scenario} practice</Btn>
        )}
        {running && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-line bg-desk/60 p-4">
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <AlertTriangle size={15} className="text-warn" aria-hidden />
                Gemini Live is not wired yet. For now, practise aloud with a timer — describe, for 8 minutes,
                how you would handle <strong>{scenario.toLowerCase()}</strong>. Then write your notes below.
              </p>
            </div>
            <Btn variant="danger" onClick={() => setRunning(false)}>End session</Btn>
          </div>
        )}
        {!running && elapsed > 0 && (
          <div className="mt-4">
            <p className="text-base font-medium">Session recap — what went wrong, in your own words:</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-line bg-paper p-3 text-base"
              placeholder="Example: I froze when the client asked about the deadline. I kept saying 'umm' before numbers…"
            />
            {!saved ? (
              <Btn className="mt-2" onClick={saveNotes} disabled={!notes.trim()}>Save recap to journal</Btn>
            ) : (
              <p className="mt-2 text-sm text-good">Saved to your Mistake Journal.</p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <H2>Wiring checklist (developer TODO)</H2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-base text-ink-soft">
          <li>Server route issues a Gemini Live ephemeral token (never expose the API key in the browser).</li>
          <li>Client opens a WebSocket to the Live endpoint; 16kHz audio in, 24kHz out.</li>
          <li>Enforce the 8-minute hard timer above; handle GoAway / session-resumption on ~10-min connections.</li>
          <li>After the call: transcribe, summarise top 3 errors into the journal + cards.</li>
          <li>Never take pronunciation scores from Live — Azure drills only.</li>
        </ol>
      </Card>
    </div>
  );
}
