"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { MonologueAttempt } from "@/lib/types";
import { Card, H2, Badge, Btn, Empty, Meta } from "@/components/ui";
import Recorder, { persistRecording, type RecordingResult } from "@/components/Recorder";

const MILESTONES: Record<number, string> = { 1: "Day 1 baseline", 30: "Day 30", 60: "Day 60", 90: "Day 90" };

export default function MonologueTests({ initial, prompts, day }: {
  initial: MonologueAttempt[];
  prompts: string[];
  day: number;
}) {
  const [attempts, setAttempts] = useState(initial);
  const [promptId, setPromptId] = useState(0);
  const [take, setTake] = useState<RecordingResult | null>(null);
  const [manualTranscript, setManualTranscript] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const milestone = MILESTONES[day] ?? `Day ${day}`;

  function words(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  async function save() {
    if (!take) return;
    const transcript = take.transcript || manualTranscript.trim();
    setSaving(true);
    setError(null);
    try {
      const audioPath = (await persistRecording(take.blob, take.durationSec)) ?? undefined;
      const wc = words(transcript);
      const wpm = take.durationSec > 0 ? Math.round((wc / take.durationSec) * 60) : 0;
      const res = await fetch("/api/monologue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId,
          day,
          milestone,
          durationSec: take.durationSec,
          wordCount: wc,
          wpm,
          pauseCount: take.pauseCount,
          transcript,
          transcriptSource: take.transcriptSource === "web-speech" ? "web-speech" : manualTranscript.trim() ? "manual" : "none",
          audioPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setAttempts((a) => [...a, data.attempt]);
      setTake(null);
      setManualTranscript("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Monologue tests</h1>
        <p className="mt-1 text-base text-ink-soft">
          The same 3 prompts every time — Day 1, 30, 60 and 90. Identical prompts make your progress measurable.
        </p>
      </div>

      <Card>
        <H2>Record a test — {milestone}</H2>
        <Meta>Duration, words-per-minute and pauses are measured. AI never scores these.</Meta>
        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setPromptId(i); setTake(null); }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${promptId === i ? "border-accent bg-accent-soft text-accent-dark" : "border-line"}`}
            >
              Prompt {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-desk/60 p-3 text-base">{prompts[promptId]}</p>
        {!take ? (
          <div className="mt-3">
            <Recorder maxSeconds={150} buttonLabel="Record your answer (up to 2:30)" onDone={(r) => setTake(r)} />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <audio controls src={take.audioUrl} className="h-10 w-full" />
            {take.transcript ? (
              <p className="rounded-lg bg-desk p-3 text-sm italic">"{take.transcript}"</p>
            ) : (
              <div>
                <p className="text-sm text-ink-faint">No browser transcript — type what you said (used for word count):</p>
                <textarea
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-line bg-paper p-3 text-base"
                  placeholder="Type your transcript…"
                />
              </div>
            )}
            {error && <p className="text-sm text-bad" role="alert">{error}</p>}
            <div className="flex gap-2">
              <Btn onClick={save} disabled={saving}>
                {saving && <Loader2 size={16} className="animate-spin" />} Save attempt
              </Btn>
              <Btn variant="ghost" onClick={() => setTake(null)}>Discard</Btn>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <H2>Attempts ({attempts.length})</H2>
        {attempts.length === 0 && <Empty title="No attempts yet" hint="Record your Day 1 baseline today — it becomes the ruler for everything after." />}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-faint">
                <th className="py-2 pr-3">Milestone</th>
                <th className="py-2 pr-3">Prompt</th>
                <th className="py-2 pr-3">Duration</th>
                <th className="py-2 pr-3">WPM</th>
                <th className="py-2 pr-3">Pauses</th>
                <th className="py-2 pr-3">Provenance</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a._id} className="border-b border-line/60">
                  <td className="py-2 pr-3 font-medium">{a.milestone}</td>
                  <td className="py-2 pr-3">#{a.promptId + 1}</td>
                  <td className="py-2 pr-3">{a.durationSec}s</td>
                  <td className="py-2 pr-3">{a.wpm}</td>
                  <td className="py-2 pr-3">{a.pauseCount ?? "—"}</td>
                  <td className="py-2 pr-3"><Badge tone="good">measured</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
