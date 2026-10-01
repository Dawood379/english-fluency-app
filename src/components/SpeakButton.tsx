"use client";

import { useState } from "react";
import { Volume2, Square } from "lucide-react";

/** Reads text aloud using the browser's free built-in TTS. */
export default function SpeakButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const toggle = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-accent hover:text-accent-dark"
    >
      {speaking ? <Square size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
      {speaking ? "Stop" : label}
    </button>
  );
}
