"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SrsCard } from "@/lib/types";
import { Card, H2, Badge, Btn, Empty } from "@/components/ui";

const KINDS: Record<string, string> = { error: "Mistake", vocab: "Vocabulary", phrase: "Phrase" };

export default function FlashcardReview({ initialCards }: { initialCards: SrsCard[] }) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const current = cards[index];
  const dueFirst = useMemo(() => {
    const now = Date.now();
    return [...cards].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  }, [cards]);

  if (cards.length === 0) {
    return (
      <Card>
        <H2>Flashcards</H2>
        <Empty title="No cards yet" hint="Mistakes from speaking feedback become flashcards automatically. You can also add vocabulary below." />
        <AddCardForm onAdded={(c) => setCards((cs) => [...cs, c])} />
      </Card>
    );
  }

  const done = index >= dueFirst.length;
  const card = dueFirst[index];

  async function grade(rating: "again" | "hard" | "good" | "easy") {
    setBusy(true);
    const res = await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card._id, rating }),
    });
    const data = (await res.json()) as { nextDue?: string };
    setBusy(false);
    setStats((s) => ({ ...s, [rating]: s[rating] + 1 }));
    setCards((cs) => cs.map((c) => (c._id === card._id && data.nextDue ? { ...c, due: data.nextDue } : c)));
    setShown(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <H2>Flashcards</H2>
          <Badge tone="accent">{dueFirst.length - Math.min(index, dueFirst.length)} remaining</Badge>
        </div>
        {done ? (
          <div className="mt-4">
            <Empty title="Deck cleared for today" hint={`Again ${stats.again} · Hard ${stats.hard} · Good ${stats.good} · Easy ${stats.easy}. Come back tomorrow — spaced repetition does the rest.`} />
          </div>
        ) : (
          card && (
            <div className="mt-4">
              <Badge>{KINDS[card.kind] ?? card.kind}</Badge>
              <p className="mt-3 font-reading text-2xl leading-relaxed">{card.front}</p>
              {!shown ? (
                <Btn variant="ghost" className="mt-4" onClick={() => setShown(true)}>Show answer</Btn>
              ) : (
                <>
                  <p className="mt-4 whitespace-pre-line rounded-lg bg-desk/60 p-4 text-base">{card.back}</p>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <Btn variant="danger" onClick={() => grade("again")} disabled={busy}>Again</Btn>
                    <Btn variant="ghost" onClick={() => grade("hard")} disabled={busy}>Hard</Btn>
                    <Btn variant="soft" onClick={() => grade("good")} disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />} Good</Btn>
                    <Btn variant="soft" onClick={() => grade("easy")} disabled={busy}>Easy</Btn>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </Card>
      <AddCardForm onAdded={(c) => setCards((cs) => [...cs, c])} />
    </div>
  );
}

function AddCardForm({ onAdded }: { onAdded: (c: SrsCard) => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setBusy(true);
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front: front.trim(), back: back.trim(), kind: "vocab" }),
    });
    const data = (await res.json()) as { card: SrsCard };
    setBusy(false);
    if (data.card) {
      onAdded(data.card);
      setFront("");
      setBack("");
    }
  }

  return (
    <Card>
      <H2>Add a vocabulary card</H2>
      <form onSubmit={add} className="mt-3 space-y-2">
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Word or phrase"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base"
        />
        <input
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Meaning + example sentence"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base"
        />
        <Btn type="submit" disabled={busy || !front.trim() || !back.trim()}>Add card</Btn>
      </form>
    </Card>
  );
}
