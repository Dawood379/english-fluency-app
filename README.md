# Fluency Desk — a personal 70-day English practice system

A single-user English learning app (Next.js 16 + MongoDB) that runs **entirely free** on a Gemini
free-tier API key. Built lesson-style and async-first: content is generated **once and cached**,
feedback is **batched**, and every free-tier budget is watched on the dashboard.

## Quick start

```bash
npm install
cp .env.example .env   # optional — the app runs in demo mode with no keys at all
npm run dev            # open http://localhost:3000
```

Without any keys you get: the full 70-day curriculum (days 1–7 fully written, days 8–70 with an
offline template), the daily session runner, SRS flashcards, the mistake journal, monologue tests,
progress charts and the Live practice page. Add keys to unlock the AI parts:

| Env var | Unlocks |
|---|---|
| `GEMINI_API_KEY` | One-time lesson generation (cached forever) + batched speaking/writing feedback |
| `GROQ_API_KEY` | Free Whisper transcription of recordings |
| `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` | Real pronunciation scores on drills (free F0 tier = 5 audio hrs/month) |
| `MONGODB_URI` | MongoDB persistence (otherwise a local `.data/store.json` file store is used) |
| `APP_PASSWORD` | Password gate (unset = app runs open in local demo mode) |

## How it works

- **Daily session** (`/session`): 7 steps — FSRS warm-up (local, zero API) → input → shadowing →
  pronunciation drill → guided speaking (ONE batched Gemini call) → writing → recap. Errors become
  journal entries and flashcards automatically.
- **Pronunciation is never scored by an LLM.** Scores come only from Azure Pronunciation Assessment.
  Without Azure keys, drills run in clearly-labelled practice mode.
- **Recordings are files**, served via `/api/uploads/[file]` from the local `uploads/` directory.
  Audio never enters MongoDB (free Atlas = 512MB).
- **Usage ledger** (`usageLedger` collection): every external call is counted per day/provider and
  shown on the dashboard against the planned budgets.
- Every MongoDB document carries `userId` (single seeded user `"owner"`).
- **Gemini Live** (`/live`) is a structured placeholder with a hard 8-minute timer, scenario picker
  and post-session journal form. The WebSocket wiring is a documented TODO — no effort was burned
  on a half implementation.
- **Monologue tests** (`/monologue`): the same 3 prompts at Day 1/30/60/90. Duration, WPM and pause
  counts are measured client-side; every number carries a provenance label ("measured" vs "AI-judged").
- PWA: manifest at `/manifest.webmanifest`, a minimal service worker caches lesson pages for offline
  reading, `/offline` fallback page.

## Project layout

```
src/app/(app)/        pages: dashboard, curriculum, session, flashcards, journal,
                       monologue, live, progress, settings
src/app/api/          route handlers: auth, lessons/generate, feedback/*,
                       transcribe, azure/score, cards, journal, sessions,
                       monologue, listening, upload, uploads/[file]
src/lib/              config (models, budgets), db (Mongo singleton + file fallback),
                      models, gemini (fallback chain), groq, azure, usage ledger,
                      auth, fsrs-helpers, curriculum (70 days), lessons (days 1–7
                      authored + template fallback), audio-utils
src/components/      Recorder, SessionRunner, FlashcardReview, JournalList,
                      MonologueTests, LessonView, ListeningQuiz, charts, nav, TTS
```

## Production notes

- Set `MONGODB_URI`, `APP_PASSWORD`, and at least `GEMINI_API_KEY` in production.
- The free-tier data caveat is shown in Settings: free API tiers may use your content to improve
  products — never send real client names or sensitive data; use placeholders.
- `uploads/` and `.data/` are git-ignored. Serve behind HTTPS for microphone + PWA install.
