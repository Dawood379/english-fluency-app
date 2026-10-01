"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, RotateCcw } from "lucide-react";

export interface RecordingResult {
  blob: Blob;
  durationSec: number;
  transcript: string;
  transcriptSource: "web-speech" | "none";
  pauseCount: number | null;
  audioUrl: string;
}

const MIME_FALLBACK = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

/* Minimal Web Speech API typings (not in the TS DOM lib). */
interface SRAlternative { transcript: string }
interface SRResultItem { [index: number]: SRAlternative }
interface SREvent { results: { length: number; [index: number]: SRResultItem } }
interface SRLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SREvent) => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_FALLBACK.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

/**
 * Universal recorder: records via MediaRecorder, optionally runs the free
 * browser Web Speech API for a live transcript, and counts pauses from the
 * mic's energy level (a pause = silence longer than 0.7s). Everything is
 * client-side — zero API cost.
 */
export default function Recorder({
  maxSeconds = 120,
  onDone,
  buttonLabel = "Record",
  compact = false,
}: {
  maxSeconds?: number;
  onDone: (r: RecordingResult) => void;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<"idle" | "recording" | "review">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recCtlRef = useRef<SRLike | null>(null);
  const startedAt = useRef(0);
  const energyRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; raf: number; silentSince: number | null; pauses: number } | null>(null);
  const finalTextRef = useRef("");
  const mimeRef = useRef(pickMime());

  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    try { recRef.current?.state !== "inactive" && recRef.current?.stop(); } catch { /* noop */ }
    try { (recCtlRef.current as { abort?: () => void } | null)?.abort?.(); } catch { /* noop */ }
    const e = energyRef.current;
    if (e) {
      cancelAnimationFrame(e.raf);
      e.ctx.close().catch(() => {});
      energyRef.current = null;
    }
  }

  async function startEnergyTracking(stream: MediaStream) {
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      const state2 = { ctx, analyser, raf: 0 as number, silentSince: null as number | null, pauses: 0 };
      const SILENCE_DB = -45;
      const tick = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const db = 10 * Math.log10(sum / data.length + 1e-12);
        const t = performance.now();
        if (db < SILENCE_DB) {
          if (state2.silentSince === null) state2.silentSince = t;
          else if (t - state2.silentSince > 700) {
            state2.pauses += 1;
            state2.silentSince = t; // count each ~0.7s chunk as one pause
          }
        } else {
          state2.silentSince = null;
        }
        state2.raf = requestAnimationFrame(tick);
      };
      tick();
      energyRef.current = state2;
    } catch { /* energy tracking optional */ }
  }

  async function start() {
    setError(null);
    finalTextRef.current = "";
    setLiveText("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = mimeRef.current;
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        finish();
      };
      recRef.current = rec;
      startedAt.current = Date.now();
      rec.start(200);
      startEnergyTracking(stream);

      // Free transcript via Web Speech API (Chrome). Optional — never required.
      const SR = (window as unknown as { SpeechRecognition?: new () => SRLike; webkitSpeechRecognition?: new () => SRLike }).SpeechRecognition
        ?? (window as unknown as { webkitSpeechRecognition?: new () => SRLike }).webkitSpeechRecognition;
      if (SR) {
        const ctl = new SR();
        ctl.lang = "en-US";
        ctl.continuous = true;
        ctl.interimResults = true;
        ctl.onresult = (ev: SREvent) => {
          let txt = "";
          for (let i = 0; i < ev.results.length; i++) txt += ev.results[i][0].transcript + " ";
          finalTextRef.current = txt.trim();
          setLiveText(txt.trim());
        };
        ctl.onerror = () => { /* ignore, transcript optional */ };
        try { ctl.start(); } catch { /* noop */ }
        recCtlRef.current = ctl;
      }
      setState("recording");
      setElapsed(0);
    } catch {
      setError("Microphone access was denied. Please allow the microphone and try again.");
    }
  }

  function finish() {
    const blob = new Blob(chunksRef.current, { type: mimeRef.current || "audio/webm" });
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const pauses = energyRef.current?.pauses ?? null;
    const text = finalTextRef.current;
    try { (recCtlRef.current as { stop?: () => void } | null)?.stop?.(); } catch { /* noop */ }
    const e = energyRef.current;
    if (e) {
      cancelAnimationFrame(e.raf);
      e.ctx.close().catch(() => {});
      energyRef.current = null;
    }
    const r: RecordingResult = {
      blob,
      durationSec,
      transcript: text,
      transcriptSource: text ? "web-speech" : "none",
      pauseCount: durationSec >= 8 ? pauses : null, // pauses only meaningful on longer recordings
      audioUrl: URL.createObjectURL(blob),
    };
    setResult(r);
    setState("review");
  }

  function stop() {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
  }

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(s);
      if (s >= maxSeconds) stop();
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function upload(): Promise<string | null> {
    if (!result) return null;
    const fd = new FormData();
    fd.append("file", result.blob, "recording.webm");
    fd.append("durationSec", String(result.durationSec));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = (await res.json()) as { path?: string };
    return data.path ?? null;
  }

  const submit = () => {
    if (result) onDone(result);
  };

  if (state === "idle") {
    return (
      <div>
        <button
          type="button"
          onClick={start}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-white hover:bg-accent-dark ${compact ? "px-3 py-2 text-sm" : ""}`}
        >
          <Mic size={17} aria-hidden /> {buttonLabel}
        </button>
        {error && <p className="mt-2 text-sm text-bad">{error}</p>}
      </div>
    );
  }

  if (state === "recording") {
    const mm = Math.floor(elapsed / 60);
    const ss = String(elapsed % 60).padStart(2, "0");
    return (
      <div className="rounded-xl border border-bad/30 bg-bad-soft p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-semibold text-bad">
            <span className="h-3 w-3 animate-pulse rounded-full bg-bad" aria-hidden />
            Recording… {mm}:{ss} / {Math.floor(maxSeconds / 60)}:{String(maxSeconds % 60).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={stop}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-bad px-4 py-2 text-base font-medium text-white"
          >
            <Square size={15} aria-hidden /> Stop
          </button>
        </div>
        {liveText && <p className="mt-3 rounded-lg bg-card p-3 text-sm italic text-ink-soft">{liveText}</p>}
        {!("SpeechRecognition" in window || "webkitSpeechRecognition" in window) && (
          <p className="mt-2 text-xs text-ink-faint">Live transcript unavailable in this browser — your recording still works.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <audio controls src={result?.audioUrl} className="h-10 max-w-full" aria-label="Your recording" />
        <span className="text-sm text-ink-faint">{result?.durationSec}s</span>
        {result?.pauseCount !== null && result?.pauseCount !== undefined && (
          <span className="text-sm text-ink-faint">{result.pauseCount} pauses</span>
        )}
      </div>
      {result?.transcript ? (
        <p className="mt-3 rounded-lg bg-desk p-3 text-sm italic text-ink-soft">"{result.transcript}"</p>
      ) : (
        <p className="mt-3 text-sm text-ink-faint">No transcript captured — you can still continue.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-base font-medium text-white hover:bg-accent-dark"
        >
          <Play size={16} aria-hidden /> Use this take
        </button>
        <button
          type="button"
          onClick={() => { setResult(null); setState("idle"); }}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-base font-medium text-ink-soft hover:border-accent"
        >
          <RotateCcw size={16} aria-hidden /> Re-record
        </button>
      </div>
    </div>
  );
}

// Re-exported for callers that need server-side persistence of a take.
export async function persistRecording(blob: Blob, durationSec: number): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", blob, "recording.webm");
  fd.append("durationSec", String(durationSec));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = (await res.json()) as { path?: string };
  return data.path ?? null;
}
