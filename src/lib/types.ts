export type Track = "Client & Work" | "Daily Life" | "Job & Interview" | "Study & General";

export interface DayOutline {
  day: number;
  week: number;
  track: Track;
  theme: string;
  targetSound: string;
  targetSoundKey: string;
  scenario: string;
  vocabFocus: string[];
  composition: string[];
}

export interface DialogueLine {
  speaker: string;
  line: string;
  urdu?: string;
}

export interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

export interface LessonContent {
  day: number;
  title: string;
  source: "authored" | "generated" | "template";
  targetSound: string;
  targetSoundNote: string;
  dialogue: DialogueLine[];
  shadowing: string[];
  listeningText: string;
  listeningQuestions: { q: string; options: string[]; answer: number }[];
  drills: { sentence: string; note?: string }[];
  speakingPrompt: string;
  writingPrompt: string;
  phrases: { en: string; urdu: string }[];
  vocab: VocabItem[];
}

export type ErrorCategory =
  | "articles"
  | "word-order"
  | "prepositions"
  | "verb-forms"
  | "v-w"
  | "th"
  | "pronunciation"
  | "vocabulary"
  | "fluency"
  | "other";

export interface JournalEntry {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  day: number;
  category: ErrorCategory;
  original: string;
  correction: string;
  explanationEn: string;
  explanationUrdu: string;
  source: "speaking" | "writing" | "manual" | "drill";
  cardId?: string;
  createdAt: string;
}

export interface SrsCard {
  _id: string;
  userId: string;
  front: string;
  back: string;
  kind: "error" | "vocab" | "phrase";
  sourceId?: string;
  // FSRS state (dates stored as ISO strings)
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // 0 New, 1 Learning, 2 Review, 3 Relearning
  last_review?: string;
  createdAt: string;
}

export interface SessionRecord {
  _id: string;
  userId: string;
  date: string;
  day: number;
  stepsCompleted: string[];
  minutes: number;
  createdAt: string;
}

export interface DrillScore {
  _id: string;
  userId: string;
  date: string;
  day: number;
  targetSound: string;
  mode: "azure" | "practice";
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  pronScore?: number;
  sentences: number;
  createdAt: string;
}

export interface MonologueAttempt {
  _id: string;
  userId: string;
  date: string;
  day: number;
  promptId: number;
  milestone: string; // "Day 1 baseline" | "Day 30" | ...
  durationSec: number; // measured
  wordCount: number; // measured (from transcript)
  wpm: number; // measured (computed)
  pauseCount: number | null; // measured when Web Speech timing available
  transcript: string;
  transcriptSource: "web-speech" | "groq" | "manual" | "none";
  audioPath?: string;
  createdAt: string;
}

export interface UsageDoc {
  _id: string;
  userId: string;
  date: string;
  provider: "gemini" | "groq" | "azure";
  model: string;
  requests: number;
  errors429: number;
  audioSeconds: number;
}
