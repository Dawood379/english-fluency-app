"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { JournalEntry, ErrorCategory } from "@/lib/types";
import { Card, H2, Badge, Btn, Empty } from "@/components/ui";

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  articles: "Articles (a/the)",
  "word-order": "Word order",
  prepositions: "Prepositions",
  "verb-forms": "Verb forms",
  "v-w": "/v/ vs /w/",
  th: "th sounds",
  pronunciation: "Pronunciation",
  vocabulary: "Vocabulary",
  fluency: "Fluency",
  other: "Other",
};

export default function JournalList({ initial }: { initial: JournalEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [showForm, setShowForm] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch("/api/journal", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEntries((es) => es.filter((e) => e._id !== id));
  }

  const recurring = entries.reduce<Record<string, JournalEntry[]>>((acc, e) => {
    const key = `${e.category}|${e.correction.slice(0, 40)}`;
    acc[key] = [...(acc[key] ?? []), e];
    return acc;
  }, {});
  const recurringKeys = Object.keys(recurring).filter((k) => recurring[k].length >= 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mistake Journal</h1>
          <p className="mt-1 text-base text-ink-soft">Every error is a lesson you will never pay for twice.</p>
        </div>
        <Btn onClick={() => setShowForm((s) => !s)}><Plus size={16} /> Add manually</Btn>
      </div>

      {recurringKeys.length > 0 && (
        <Card>
          <H2>Recurring errors — drill these first</H2>
          <ul className="mt-3 space-y-2">
            {recurringKeys.map((k) => {
              const e = recurring[k][0];
              return (
                <li key={k} className="rounded-lg border border-warn/30 bg-warn-soft p-3">
                  <p className="text-sm font-semibold text-warn">{CATEGORY_LABELS[e.category]} × {recurring[k].length}</p>
                  <p className="mt-1 text-base"><span className="text-bad line-through">{e.original}</span> → <span className="font-medium text-good">{e.correction}</span></p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {showForm && <JournalForm onAdded={(e) => { setEntries((es) => [e, ...es]); setShowForm(false); }} />}

      {entries.length === 0 && <Empty title="No mistakes logged yet" hint="Run a guided speaking session — the coach's corrections land here automatically." />}

      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e._id}>
            <Card>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="accent">{CATEGORY_LABELS[e.category]}</Badge>
                  <Badge>{e.source}</Badge>
                  <Badge>Day {e.day}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => remove(e._id)}
                  aria-label="Delete entry"
                  className="rounded-lg p-2 text-ink-faint hover:text-bad"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <p className="mt-2 text-base"><span className="text-bad line-through">{e.original}</span></p>
              <p className="text-base font-medium text-good">{e.correction}</p>
              <p className="mt-2 text-sm">{e.explanationEn}</p>
              {e.explanationUrdu && <p className="text-sm text-ink-soft">{e.explanationUrdu}</p>}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JournalForm({ onAdded }: { onAdded: (e: JournalEntry) => void }) {
  const [category, setCategory] = useState<ErrorCategory>("articles");
  const [original, setOriginal] = useState("");
  const [correction, setCorrection] = useState("");
  const [explanationEn, setExplanationEn] = useState("");
  const [explanationUrdu, setExplanationUrdu] = useState("");
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, original, correction, explanationEn, explanationUrdu, day, source: "manual" }),
    });
    const data = (await res.json()) as { entry?: JournalEntry };
    setBusy(false);
    if (data.entry) onAdded(data.entry);
  }

  const input = "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base";
  return (
    <Card>
      <H2>Log a mistake</H2>
      <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block text-sm font-medium">Category
          <select value={category} onChange={(e) => setCategory(e.target.value as ErrorCategory)} className={`${input} mt-1`}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Day
          <input type="number" min={1} max={70} value={day} onChange={(e) => setDay(Number(e.target.value))} className={`${input} mt-1`} />
        </label>
        <input value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="What you said (wrong)" className={input} required />
        <input value={correction} onChange={(e) => setCorrection(e.target.value)} placeholder="Correct version" className={input} required />
        <input value={explanationEn} onChange={(e) => setExplanationEn(e.target.value)} placeholder="Why — in English" className={`${input} sm:col-span-2`} required />
        <input value={explanationUrdu} onChange={(e) => setExplanationUrdu(e.target.value)} placeholder="Kyun — Roman Urdu mein" className={`${input} sm:col-span-2`} />
        <div className="sm:col-span-2"><Btn type="submit" disabled={busy}>Save to journal</Btn></div>
      </form>
    </Card>
  );
}
