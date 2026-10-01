"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { LessonContent } from "@/lib/types";

export default function GenerateLessonButton({ day, onGenerated }: { day: number; onGenerated: (l: LessonContent) => void }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/lessons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day }),
      });
      const data = (await res.json()) as { lesson: LessonContent; source: string; note?: string };
      if (data.lesson) {
        onGenerated(data.lesson);
        if (data.note) setNote(data.note);
        else if (data.source === "generated") setNote(`Generated with ${"model" in data && (data as { model?: string }).model ? (data as { model?: string }).model : "Gemini"} and cached — re-opening costs nothing.`);
      } else {
        setNote("Generation failed — the template below still works offline.");
      }
    } catch {
      setNote("Generation failed — the template below still works offline.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft p-4">
      <p className="text-base font-medium text-accent-dark">This day uses the offline template for now.</p>
      <p className="mt-1 text-sm text-ink-soft">
        Generate the full lesson once with Gemini — it is cached, so opening it again costs zero API calls.
      </p>
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-white hover:bg-accent-dark disabled:opacity-60"
      >
        <Sparkles size={16} aria-hidden /> {loading ? "Generating…" : "Generate full lesson"}
      </button>
      {note && <p className="mt-2 text-sm text-ink-soft">{note}</p>}
    </div>
  );
}
