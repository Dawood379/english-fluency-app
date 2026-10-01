"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { LessonContent } from "@/lib/types";
import { Card, H2, Badge } from "@/components/ui";
import SpeakButton from "@/components/SpeakButton";
import GenerateLessonButton from "@/components/GenerateLessonButton";
import ListeningQuiz from "@/components/ListeningQuiz";

/** Renders a full lesson: input (dialogue/listening), shadowing, drills. */

export default function LessonView({ initial, outline, day }: {
  initial: LessonContent;
  outline: { theme: string; track: string; targetSound: string; composition: string[] };
  day: number;
}) {
  const [lesson, setLesson] = useState(initial);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Day {day}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="accent">{outline.track}</Badge>
          <Badge>{lesson.targetSound}</Badge>
          <Badge tone={lesson.source === "authored" ? "good" : lesson.source === "generated" ? "accent" : "warn"}>
            {lesson.source === "authored" ? "Full lesson" : lesson.source === "generated" ? "Generated & cached" : "Offline template"}
          </Badge>
        </div>
      </div>

      {lesson.source === "template" && (
        <GenerateLessonButton day={day} onGenerated={(l) => setLesson(l)} />
      )}

      <Card>
        <H2>Today's session plan</H2>
        <ol className="mt-3 space-y-2">
          {outline.composition.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                aria-pressed={!!checked[i]}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${checked[i] ? "border-accent bg-accent text-white" : "border-ink-faint"}`}
                aria-label={`Mark "${s}" as done`}
              >
                {checked[i] && <Check size={14} aria-hidden />}
              </button>
              <span className={`text-base ${checked[i] ? "text-ink-faint line-through" : ""}`}>{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <H2>Dialogue — read and listen</H2>
          <SpeakButton text={lesson.dialogue.map((d) => d.line).join(" ")} />
        </div>
        <div className="mt-4 space-y-3">
          {lesson.dialogue.map((d, i) => (
            <div key={i} className="rounded-lg bg-desk/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{d.speaker}</p>
              <p className="mt-1 font-reading text-lg leading-relaxed">{d.line}</p>
              {d.urdu && <p className="mt-1 text-sm text-ink-soft">{d.urdu}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <H2>Shadowing lines</H2>
          <SpeakButton text={lesson.shadowing.join(" ")} label="Listen to all" />
        </div>
        <p className="mt-1 text-sm text-ink-faint">
          Play, pause, and echo each line like an echo — copy the rhythm, not just the words.
        </p>
        <ol className="mt-3 space-y-2">
          {lesson.shadowing.map((line, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
              <span className="font-reading text-lg">{line}</span>
              <SpeakButton text={line} label="Play" />
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <H2>Listening text</H2>
          <SpeakButton text={lesson.listeningText} label="Listen" />
        </div>
        <p className="mt-3 font-reading text-lg leading-relaxed">{lesson.listeningText}</p>
        <div className="mt-4 border-t border-line pt-4">
          <ListeningQuiz day={day} questions={lesson.listeningQuestions} />
        </div>
      </Card>

      <Card>
        <H2>Pronunciation drill — {lesson.targetSound}</H2>
        <p className="mt-1 text-sm text-ink-faint">{lesson.targetSoundNote}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Run these in the <Link href="/session" className="font-medium text-accent-dark hover:underline">daily session</Link>,
          where your takes are scored (Azure) or kept in practice mode.
        </p>
        <ol className="mt-3 space-y-2">
          {lesson.drills.map((dr, i) => (
            <li key={i} className="rounded-lg border border-line px-3 py-2.5">
              <p className="font-reading text-lg">{dr.sentence}</p>
              {dr.note && <p className="mt-1 text-sm text-ink-faint">{dr.note}</p>}
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <H2>Speaking prompt</H2>
          <p className="mt-2 text-base">{lesson.speakingPrompt}</p>
          <Link href="/session" className="mt-3 inline-block text-sm font-medium text-accent-dark hover:underline">Record it in today's session →</Link>
        </Card>
        <Card>
          <H2>Writing prompt</H2>
          <p className="mt-2 text-base">{lesson.writingPrompt}</p>
          <Link href="/session" className="mt-3 inline-block text-sm font-medium text-accent-dark hover:underline">Write it in today's session →</Link>
        </Card>
      </div>

      <Card>
        <H2>Phrase bank</H2>
        <ul className="mt-3 space-y-2.5">
          {lesson.phrases.map((p, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-desk/60 p-3">
              <div>
                <p className="font-reading text-lg">{p.en}</p>
                <p className="text-sm text-ink-soft">{p.urdu}</p>
              </div>
              <SpeakButton text={p.en} label="Play" />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <H2>Vocabulary</H2>
        <dl className="mt-3 space-y-3">
          {lesson.vocab.map((v, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <dt className="text-base font-semibold">{v.word}</dt>
              <dd className="text-sm text-ink-soft">{v.meaning}</dd>
              {v.example !== "—" && <dd className="mt-1 text-sm italic text-ink-faint">"{v.example}"</dd>}
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
