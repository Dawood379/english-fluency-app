"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

/** Listening self-check: answer the lesson's questions, see the score,
 *  and record it to the progress page. */
export default function ListeningQuiz({
  day,
  questions,
}: {
  day: number;
  questions: { q: string; options: string[]; answer: number }[];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const answeredAll = Object.keys(answers).length === questions.length;

  async function save() {
    const res = await fetch("/api/listening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, correct, total: questions.length }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div>
      <p className="text-base font-medium">Listening check — answer from memory</p>
      <ol className="mt-3 space-y-4">
        {questions.map((q, qi) => (
          <li key={qi} className="rounded-lg border border-line p-3">
            <p className="text-base font-medium">{qi + 1}. {q.q}</p>
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi;
                const right = submitted && oi === q.answer;
                const wrong = submitted && picked && oi !== q.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-base ${
                      right ? "border-good bg-good-soft" : wrong ? "border-bad bg-bad-soft" : picked ? "border-accent bg-accent-soft" : "border-line"
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span> {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {!submitted ? (
        <button
          type="button"
          disabled={!answeredAll}
          onClick={() => setSubmitted(true)}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-white hover:bg-accent-dark disabled:opacity-50"
        >
          Check answers
        </button>
      ) : (
        <div className="mt-4 rounded-xl border border-line bg-desk/60 p-4">
          <p className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 size={18} className="text-accent" aria-hidden />
            Score: {correct} / {questions.length}
          </p>
          {!saved ? (
            <button
              type="button"
              onClick={save}
              className="mt-2 inline-flex min-h-[44px] items-center rounded-lg border border-line bg-card px-4 py-2 text-base font-medium hover:border-accent"
            >
              Save to progress
            </button>
          ) : (
            <p className="mt-2 text-sm text-good">Saved — see it on the Progress page.</p>
          )}
        </div>
      )}
    </div>
  );
}
