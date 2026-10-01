"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Mic } from "lucide-react";
import type { LessonContent, SrsCard } from "@/lib/types";
import { Card, H2, Badge, Btn, Empty } from "@/components/ui";
import SpeakButton from "@/components/SpeakButton";
import Recorder, { persistRecording, type RecordingResult } from "@/components/Recorder";
import { blobToWav16k, b64encode } from "@/lib/audio-utils";
import type { PronScore } from "@/lib/azure";

const STEPS = ["Warm-up", "Input", "Shadowing", "Drill", "Speaking", "Writing", "Recap"] as const;

interface Feedback {
  errors: { original: string; correction: string; category: string; explanationEn: string; explanationUrdu: string }[];
  fluencyNotes: string;
  betterPhrases: string[];
  summary: string;
  provenance: string;
}

export default function SessionRunner({ day, lesson, dueCards }: {
  day: number;
  lesson: LessonContent;
  dueCards: SrsCard[];
}) {
  const [step, setStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<string[]>([]);
  const [warmDone, setWarmDone] = useState<Record<string, boolean>>({});
  const [shadowIdx, setShadowIdx] = useState(0);
  const [shadowTakes, setShadowTakes] = useState<number>(0);
  const [drillScores, setDrillScores] = useState<{ sentence: string; score: PronScore | null; mode: string }[]>([]);
  const [scoring, setScoring] = useState(false);
  const [speakTake, setSpeakTake] = useState<RecordingResult | null>(null);
  const [manualTranscript, setManualTranscript] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [writing, setWriting] = useState("");
  const [writingResult, setWritingResult] = useState<{ corrected: string; errors: { original: string; correction: string; explanationEn: string; explanationUrdu: string }[] } | null>(null);
  const [writingLoading, setWritingLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  const markDone = (name: string) => setDoneSteps((d) => (d.includes(name) ? d : [...d, name]));
  const warmRemaining = useMemo(() => dueCards.filter((c) => !warmDone[c._id]), [dueCards, warmDone]);

  // ---- Drill: score one take ----
  async function scoreDrill(sentence: string, take: RecordingResult) {
    setScoring(true);
    try {
      const { wav, durationSec } = await blobToWav16k(take.blob);
      const res = await fetch("/api/azure/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceText: sentence,
          durationSec: Math.max(1, Math.round(durationSec)),
          contentType: "audio/wav",
          day,
          targetSound: lesson.targetSound,
          audioB64: b64encode(wav),
        }),
      });
      const data = (await res.json()) as { mode: string; score?: PronScore; note?: string };
      setDrillScores((s) => [...s, { sentence, score: data.score ?? null, mode: data.mode }]);
    } catch {
      setDrillScores((s) => [...s, { sentence, score: null, mode: "practice" }]);
    } finally {
      setScoring(false);
    }
  }

  // ---- Guided speaking feedback (ONE batched Gemini call) ----
  async function getFeedback() {
    const transcript = speakTake?.transcript || manualTranscript.trim();
    if (!transcript) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      let audioPath: string | undefined;
      if (speakTake) audioPath = (await persistRecording(speakTake.blob, speakTake.durationSec)) ?? undefined;
      const res = await fetch("/api/feedback/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, scenario: lesson.speakingPrompt, day, audioPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Feedback failed.");
      setFeedback(data.feedback as Feedback);
      markDone("Speaking");
    } catch (e) {
      setFeedbackError((e as Error).message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function improveTranscript() {
    if (!speakTake) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const fd = new FormData();
      fd.append("file", speakTake.blob, "speaking.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Transcription failed.");
      setManualTranscript(data.text ?? "");
    } catch (e) {
      setFeedbackError((e as Error).message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function correctWriting() {
    if (!writing.trim()) return;
    setWritingLoading(true);
    try {
      const res = await fetch("/api/feedback/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: writing, prompt: lesson.writingPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Correction failed.");
      setWritingResult(data);
      markDone("Writing");
    } catch {
      setWritingLoading(false);
    }
    setWritingLoading(false);
  }

  async function finish() {
    setFinishing(true);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    await fetch("/api/sessions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, stepsCompleted: [...new Set(doneSteps)], minutes }),
    });
    setFinishing(false);
    setFinished(true);
  }

  const go = (d: number) => setStep((s) => Math.min(Math.max(s + d, 0), STEPS.length - 1));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Day {day} session</p>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <ol className="mt-4 flex flex-wrap gap-2" aria-label="Session steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${i === step ? "border-accent bg-accent text-white" : doneSteps.includes(s) ? "border-accent/40 bg-accent-soft text-accent-dark" : "border-line bg-card text-ink-soft"}`}
              >
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <Card>
          <H2>SRS warm-up — {warmRemaining.length} due</H2>
          <p className="mt-1 text-sm text-ink-faint">Review your due flashcards. This step is free and offline.</p>
          <div className="mt-4 space-y-3">
            {warmRemaining.length === 0 && <Empty title="Nothing due" hint="Your memory is clear for today. Move on." />}
            {warmRemaining.map((c) => (
              <WarmCard key={c._id} card={c} onDone={() => { setWarmDone((w) => ({ ...w, [c._id]: true })); }} />
            ))}
          </div>
          <Btn className="mt-4" onClick={() => { markDone("Warm-up"); go(1); }}>Continue to Input <ChevronRight size={16} /></Btn>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <H2>Input — read and listen</H2>
            <SpeakButton text={lesson.dialogue.map((d) => d.line).join(" ")} />
          </div>
          <div className="mt-4 space-y-3">
            {lesson.dialogue.map((d, i) => (
              <div key={i}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{d.speaker}</p>
                <p className="font-reading text-lg leading-relaxed">{d.line}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-reading text-lg leading-relaxed">{lesson.listeningText}</p>
          <Btn className="mt-4" onClick={() => { markDone("Input"); go(1); }}>Continue to Shadowing <ChevronRight size={16} /></Btn>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <H2>Shadowing — echo the line</H2>
          <p className="mt-1 text-sm text-ink-faint">
            Line {shadowIdx + 1} of {lesson.shadowing.length}. Listen, then record yourself copying it.
          </p>
          <div className="mt-4 rounded-xl bg-desk/60 p-4">
            <p className="font-reading text-2xl leading-relaxed">{lesson.shadowing[shadowIdx]}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SpeakButton text={lesson.shadowing[shadowIdx]} label="Play line" />
              <Recorder compact maxSeconds={30} buttonLabel="Record me" onDone={() => setShadowTakes((t) => t + 1)} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Btn variant="ghost" onClick={() => setShadowIdx((i) => Math.max(0, i - 1))} disabled={shadowIdx === 0}><ChevronLeft size={16} /> Prev</Btn>
            <span className="text-sm text-ink-faint">{shadowTakes} takes recorded</span>
            {shadowIdx < lesson.shadowing.length - 1 ? (
              <Btn variant="ghost" onClick={() => setShadowIdx((i) => i + 1)}>Next <ChevronRight size={16} /></Btn>
            ) : (
              <Btn onClick={() => { markDone("Shadowing"); go(1); }}>Continue to Drill <ChevronRight size={16} /></Btn>
            )}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <H2>Pronunciation drill — {lesson.targetSound}</H2>
          <p className="mt-1 text-sm text-ink-faint">{lesson.targetSoundNote}</p>
          <p className="mt-2 text-sm text-ink-soft">
            Record one sentence at a time. {""}
            <Badge tone="accent">Azure = real scores</Badge> <Badge>no keys = practice mode</Badge>
          </p>
          <ol className="mt-4 space-y-4">
            {lesson.drills.map((dr, i) => {
              const entry = drillScores.filter((s) => s.sentence === dr.sentence).pop();
              return (
                <li key={i} className="rounded-xl border border-line p-4">
                  <p className="font-reading text-lg">{dr.sentence}</p>
                  {dr.note && <p className="mt-1 text-sm text-ink-faint">{dr.note}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <SpeakButton text={dr.sentence} label="Listen" />
                    <Recorder compact maxSeconds={20} buttonLabel={scoring ? "Scoring…" : "Record & score"} onDone={(r) => scoreDrill(dr.sentence, r)} />
                  </div>
                  {entry && entry.mode === "azure" && entry.score && (
                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      {[["Accuracy", entry.score.accuracy], ["Fluency", entry.score.fluency], ["Complete", entry.score.completeness], ["PronScore", entry.score.pronScore]].map(([k, v]) => (
                        <div key={k as string} className="rounded-lg bg-desk/60 p-2">
                          <p className="text-lg font-semibold">{Math.round(v as number)}</p>
                          <p className="text-xs text-ink-faint">{k}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {entry && entry.mode !== "azure" && (
                    <p className="mt-2 text-sm text-warn">Practice mode — listened back, no score. Add Azure keys in Settings for real scores.</p>
                  )}
                </li>
              );
            })}
          </ol>
          <Btn className="mt-4" onClick={() => { markDone("Drill"); go(1); }} disabled={drillScores.length === 0}>
            Continue to Speaking ({drillScores.length} scored) <ChevronRight size={16} />
          </Btn>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <H2>Guided speaking</H2>
          <p className="mt-2 rounded-lg bg-desk/60 p-3 text-base">{lesson.speakingPrompt}</p>
          {!speakTake && !feedback && (
            <div className="mt-4">
              <Recorder maxSeconds={150} buttonLabel="Record your answer (up to 2:30)" onDone={(r) => setSpeakTake(r)} />
            </div>
          )}
          {speakTake && !feedback && (
            <div className="mt-4 space-y-3">
              <audio controls src={speakTake.audioUrl} className="h-10 w-full" />
              {speakTake.transcript ? (
                <p className="rounded-lg bg-desk p-3 text-sm italic">"{speakTake.transcript}"</p>
              ) : (
                <div>
                  <p className="text-sm text-ink-faint">No browser transcript — type what you said, or improve it with Whisper:</p>
                  <textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-line bg-paper p-3 text-base"
                    placeholder="Type your transcript here…"
                  />
                  <Btn variant="ghost" className="mt-2" onClick={improveTranscript} disabled={feedbackLoading}>
                    {feedbackLoading ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />} Transcribe with Whisper
                  </Btn>
                </div>
              )}
              {feedbackError && <p className="text-sm text-bad" role="alert">{feedbackError}</p>}
              <div className="flex gap-2">
                <Btn onClick={getFeedback} disabled={feedbackLoading || (!speakTake.transcript && !manualTranscript.trim())}>
                  {feedbackLoading ? <Loader2 size={16} className="animate-spin" /> : null} Get feedback (1 AI call)
                </Btn>
                <Btn variant="ghost" onClick={() => setSpeakTake(null)}>Re-record</Btn>
              </div>
            </div>
          )}
          {feedback && (
            <div className="mt-4 space-y-4">
              <p className="rounded-lg bg-accent-soft p-3 text-base"><strong>Coach:</strong> {feedback.summary}</p>
              <div>
                <p className="font-medium">Fluency</p>
                <p className="text-base text-ink-soft">{feedback.fluencyNotes}</p>
              </div>
              {feedback.errors.length > 0 && (
                <div>
                  <p className="font-medium">Fixes ({feedback.errors.length})</p>
                  <ul className="mt-2 space-y-2">
                    {feedback.errors.map((e, i) => (
                      <li key={i} className="rounded-lg border border-line p-3">
                        <p className="text-sm text-bad line-through">{e.original}</p>
                        <p className="text-base font-medium text-good">{e.correction}</p>
                        <p className="mt-1 text-sm">{e.explanationEn}</p>
                        <p className="text-sm text-ink-soft">{e.explanationUrdu}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-ink-faint">These {feedback.errors.length} errors were saved to your Mistake Journal and became flashcards.</p>
                </div>
              )}
              <div>
                <p className="font-medium">Say it better</p>
                <ul className="mt-1 list-disc pl-5 text-base text-ink-soft">
                  {feedback.betterPhrases.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <p className="text-xs text-ink-faint">Provenance: {feedback.provenance}</p>
              <Btn onClick={() => go(1)}>Continue to Writing <ChevronRight size={16} /></Btn>
            </div>
          )}
        </Card>
      )}

      {step === 5 && (
        <Card>
          <H2>Writing micro-task</H2>
          <p className="mt-2 rounded-lg bg-desk/60 p-3 text-base">{lesson.writingPrompt}</p>
          <textarea
            value={writing}
            onChange={(e) => setWriting(e.target.value)}
            rows={5}
            className="mt-4 w-full rounded-lg border border-line bg-paper p-3 text-base"
            placeholder="Write 3–5 sentences here…"
          />
          <div className="mt-2 flex gap-2">
            <Btn onClick={correctWriting} disabled={writingLoading || !writing.trim()}>
              {writingLoading && <Loader2 size={16} className="animate-spin" />} Correct it (1 AI call)
            </Btn>
            <Btn variant="ghost" onClick={() => { markDone("Writing"); go(1); }}>Skip</Btn>
          </div>
          {writingResult && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-good-soft p-3">
                <p className="font-medium text-good">Corrected version</p>
                <p className="mt-1 text-base">{writingResult.corrected}</p>
              </div>
              <ul className="space-y-2">
                {writingResult.errors.map((e, i) => (
                  <li key={i} className="rounded-lg border border-line p-3">
                    <p className="text-sm text-bad line-through">{e.original}</p>
                    <p className="text-base font-medium text-good">{e.correction}</p>
                    <p className="mt-1 text-sm">{e.explanationEn}</p>
                    <p className="text-sm text-ink-soft">{e.explanationUrdu}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {step === 6 && (
        <Card>
          <H2>Recap</H2>
          {!finished ? (
            <>
              <p className="mt-2 text-base text-ink-soft">
                {doneSteps.length} of {STEPS.length - 1} practice steps completed:
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {doneSteps.map((s) => <Badge key={s} tone="good">{s}</Badge>)}
              </ul>
              <p className="mt-3 text-sm text-ink-faint">
                Errors from speaking went to your journal as flashcards. Drill scores went to Progress.
              </p>
              <Btn className="mt-4" onClick={finish} disabled={finishing}>
                {finishing ? <Loader2 size={16} className="animate-spin" /> : null} Finish Day {day} session
              </Btn>
            </>
          ) : (
            <div>
              <p className="text-base font-medium text-good">Day {day} is logged. Well done — tomorrow builds on today.</p>
              <div className="mt-3 flex gap-2">
                <Btn onClick={() => window.location.assign("/journal")}>Open Mistake Journal</Btn>
                <Btn variant="ghost" onClick={() => window.location.assign("/")}>Dashboard</Btn>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="flex justify-between">
        <Btn variant="ghost" onClick={() => go(-1)} disabled={step === 0}><ChevronLeft size={16} /> Back</Btn>
        {step < STEPS.length - 1 && <Btn variant="ghost" onClick={() => go(1)}>Next <ChevronRight size={16} /></Btn>}
      </div>
    </div>
  );
}

function WarmCard({ card, onDone }: { card: SrsCard; onDone: () => void }) {
  const [shown, setShown] = useState(false);
  async function grade(rating: "again" | "hard" | "good" | "easy") {
    await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card._id, rating }),
    });
    onDone();
  }
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-base font-medium">{card.front}</p>
      {!shown ? (
        <Btn variant="ghost" className="mt-2" onClick={() => setShown(true)}>Show answer</Btn>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-line text-base text-ink-soft">{card.back}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => grade("again")}>Again</Btn>
            <Btn variant="ghost" onClick={() => grade("hard")}>Hard</Btn>
            <Btn variant="soft" onClick={() => grade("good")}>Good</Btn>
            <Btn variant="soft" onClick={() => grade("easy")}>Easy</Btn>
          </div>
        </>
      )}
    </div>
  );
}
