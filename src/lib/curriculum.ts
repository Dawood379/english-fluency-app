import type { DayOutline, Track } from "./types";

/**
 * The 70-day curriculum outline. Days 1–7 have fully authored lessons in
 * lessons.ts. Days 8–70 carry this structured outline; their full lesson is
 * generated once by Gemini on demand and cached (see /api/lessons/generate),
 * with a template fallback when no key is configured.
 */

export const TARGET_SOUNDS: { key: string; label: string; note: string }[] = [
  { key: "v-w", label: "/v/ vs /w/", note: "Urdu speakers often merge these. /v/ = top teeth touch lower lip with voice; /w/ = round lips, no teeth." },
  { key: "th", label: "th — /θ/ and /ð/", note: "Tongue tip between the teeth. /θ/ (think) has no voice; /ð/ (this) vibrates." },
  { key: "zh", label: "/ʒ/ — measure, usually, decision", note: "A soft 'zh' sound like the middle of 'vision'. Urdu has no direct equivalent — it is NOT a hard 'j'." },
  { key: "stress", label: "Word stress", note: "One syllable in each word is louder and longer: de-VEL-op-er, not DE-ve-LOP-er." },
  { key: "schwa", label: "Schwa /ə/ — the weak vowel", note: "Unstressed syllables shrink to a tiny 'uh' sound: 'about' = uh-BOUT, 'teacher' = TEE-chuh." },
  { key: "rhythm", label: "Sentence rhythm & linking", note: "English stresses content words and squashes the rest. Words link together: 'turn_it_off' sounds like one word." },
];

const TRACK_ROTATION: Track[] = [
  "Client & Work",
  "Daily Life",
  "Job & Interview",
  "Study & General",
  "Client & Work",
  "Daily Life",
  "Study & General",
];

const STANDARD_COMPOSITION = [
  "SRS warm-up — due flashcards (5 min)",
  "Input — dialogue + listening text (10 min)",
  "Shadowing — line-by-line echo (8 min)",
  "Pronunciation drill — today's target sound (7 min)",
  "Guided speaking — record 1–2 minutes (10 min)",
  "Writing micro-task — 3–5 sentences (5 min)",
  "Recap — journal + new SRS cards (3 min)",
];

const REVIEW_COMPOSITION = [
  "SRS warm-up — due flashcards (8 min)",
  "Input — re-read this week's hardest dialogue (8 min)",
  "Shadowing — your weakest lines again (8 min)",
  "Pronunciation drill — this week's two target sounds (8 min)",
  "Monologue practice — record a test-prompt answer (10 min)",
  "Writing micro-task — weekly summary paragraph (6 min)",
  "Recap — weekly journal review (4 min)",
];

// [theme, scenario, vocab] per day, grouped by week (7 days each).
const WEEKS: { focus: string; days: [string, string, string[]][] }[] = [
  {
    focus: "Foundations — introducing yourself and your day",
    days: [
      ["Meet a new client", "A first video call: introduce yourself, your skills and your experience.", ["project", "experience", "deliver", "website", "client"]],
      ["My daily routine", "Describe your morning-to-night routine to a friend.", ["wake up", "usually", "commute", "prayer", "midnight"]],
      ["Talk about your skills", "Answer 'What are your strengths?' in a job interview.", ["strength", "reliable", "deadline", "improve", "weakness"]],
      ["Asking good questions", "Ask a teacher questions about a lesson you did not understand.", ["explain", "example", "repeat", "meaning", "confused"]],
      ["The discovery call", "Ask a client about their business before quoting a price.", ["budget", "goal", "audience", "feature", "timeline"]],
      ["Shopping and prices", "Buy vegetables at the market and bargain politely.", ["expensive", "discount", "quality", "weigh", "total"]],
      ["Week 1 review", "Record a 1-minute self-introduction using everything from this week.", ["confident", "practice", "progress", "review", "goal"]],
    ],
  },
  {
    focus: "Your work — projects, tools and progress",
    days: [
      ["Describe your current project", "Explain what you are building to a non-technical client.", ["feature", "database", "design", "launch", "version"]],
      ["A day at the office", "Describe your workplace and your team to a new colleague.", ["meeting", "colleague", "office", "remote", "schedule"]],
      ["Why should we hire you?", "Connect your skills to the company's needs in an interview.", ["hire", "team", "value", "result", "growth"]],
      ["Explain a technical idea simply", "Teach a beginner what an API is, in simple English.", ["simple", "example", "imagine", "connect", "data"]],
      ["Give a progress update", "Tell a client what is done, what is next, and what is blocked.", ["progress", "blocked", "almost", "remaining", "update"]],
      ["At the bank", "Open an account and ask about fees and mobile banking.", ["account", "balance", "transfer", "fee", "branch"]],
      ["Week 2 review", "Explain your project start-to-finish in 90 seconds.", ["explain", "summary", "fluent", "clear", "practice"]],
    ],
  },
  {
    focus: "Past events — telling stories about what happened",
    days: [
      ["A difficult project from the past", "Tell a client about a hard project and how you solved it.", ["challenge", "solved", "learned", "mistake", "finally"]],
      ["A memorable trip", "Tell a friend about a trip you took last year.", ["journey", "weather", "visited", "delicious", "returned"]],
      ["Tell me about a time when…", "Answer a behavioural interview question with a real story.", ["situation", "action", "result", "teamwork", "pressure"]],
      ["News and past events", "Retell a news story you read this morning.", ["according to", "announced", "happened", "caused", "reacted"]],
      ["When something went wrong", "Explain a production bug to a client: what happened and the fix.", ["broke", "noticed", "fixed", "apologise", "prevent"]],
      ["A family celebration", "Describe a wedding or Eid celebration to a foreign friend.", ["celebration", "guests", "traditional", "prepared", "enjoyed"]],
      ["Week 3 review", "Tell a 2-minute story about your biggest work lesson.", ["story", "beginning", "suddenly", "lesson", "remember"]],
    ],
  },
  {
    focus: "Opinions — agreeing, disagreeing and small talk",
    days: [
      ["Agreeing with a client's idea", "Support a client's suggestion and add one improvement.", ["agree", "exactly", "advantage", "suggest", "benefit"]],
      ["Disagreeing politely", "Push back on a client request without sounding rude.", ["however", "concern", "alternative", "risk", "respectfully"]],
      ["Interview small talk", "Handle the first two minutes of an interview warmly.", ["traffic", "journey", "excited", "opportunity", "pleasure"]],
      ["Discuss an article", "Share your opinion about an article on technology.", ["article", "opinion", "evidence", "trend", "future"]],
      ["Meetings: sharing opinions", "Give your view in a team meeting and invite others' views.", ["opinion", "suggest", "prefer", "thoughts", "consider"]],
      ["Making friends: hobbies", "Talk about cricket, films and food with a new friend.", ["hobby", "favourite", "weekend", "support", "watch"]],
      ["Week 4 review", "Debate both sides: is remote work better than office work?", ["advantage", "disadvantage", "balance", "argue", "conclude"]],
    ],
  },
  {
    focus: "Problems — delays, bugs and difficult moments",
    days: [
      ["The project is delayed", "Tell a client about a delay early, with a new plan.", ["delay", "reason", "revised", "apologise", "commit"]],
      ["Asking for help", "Ask a senior developer for help without feeling small.", ["stuck", "advice", "approach", "tried", "guidance"]],
      ["A conflict with a coworker", "Describe how you handled a disagreement at work.", ["conflict", "discussed", "compromise", "respect", "resolved"]],
      ["Understanding lectures", "Listen to a talk and note the main points and details.", ["main point", "detail", "note", "conclude", "summary"]],
      ["An unhappy client", "Calm an angry client whose website went down.", ["understand", "frustration", "urgent", "restore", "compensation"]],
      ["At the doctor", "Describe symptoms and understand instructions.", ["symptom", "fever", "prescription", "rest", "recover"]],
      ["Week 5 review", "Explain a problem, its cause and your solution in 2 minutes.", ["problem", "cause", "solution", "prevent", "confident"]],
    ],
  },
  {
    focus: "Job hunting — CV, interviews and offers",
    days: [
      ["Walk me through your CV", "Explain your work history as one clear story.", ["career", "role", "achievement", "promoted", "responsibility"]],
      ["Salary expectations", "State your salary range calmly and with reasons.", ["expectation", "range", "market", "benefits", "negotiable"]],
      ["Questions to ask them", "Ask smart questions at the end of an interview.", ["culture", "growth", "expectations", "team", "process"]],
      ["Write a formal email", "Write a job application email with the right tone.", ["apply", "position", "attached", "consider", "grateful"]],
      ["Remote standup meeting", "Give a 60-second standup: yesterday, today, blockers.", ["yesterday", "today", "blocker", "review", "deploy"]],
      ["Renting a flat", "Ask a landlord about rent, bills and rules.", ["rent", "deposit", "bills", "furnished", "contract"]],
      ["Week 6 review", "Record a full mock-interview answer set (3 questions).", ["prepare", "answer", "example", "confident", "improve"]],
    ],
  },
  {
    focus: "Money — pricing, negotiation and freelancing",
    days: [
      ["Quote a price", "Present your price for a website project and justify it.", ["quote", "includes", "revision", "deposit", "milestone"]],
      ["Negotiate without losing", "Respond when a client asks for a big discount.", ["discount", "scope", "value", "flexible", "agreement"]],
      ["Discussing salary in detail", "Talk about raises, bonuses and probation.", ["raise", "performance", "bonus", "probation", "review"]],
      ["Explain your rates to a class", "Teach other freelancers how to price their work.", ["charge", "hourly", "value", "market", "beginner"]],
      ["Scope creep", "Tell a client a new request is outside the agreed scope.", ["scope", "agreed", "additional", "estimate", "separate"]],
      ["Borrowing and lending", "Ask a friend to return money you lent, politely.", ["borrow", "return", "urgent", "promise", "embarrassed"]],
      ["Week 7 review", "Run a full price negotiation role-play from memory.", ["negotiate", "offer", "counter", "settle", "deal"]],
    ],
  },
  {
    focus: "Out in the world — travel, health and services",
    days: [
      ["Explaining revisions to a client", "Walk a client through design changes on a call.", ["revision", "feedback", "adjust", "version", "approve"]],
      ["Travel plans", "Book a hotel room and ask about check-in and breakfast.", ["booking", "check-in", "luggage", "reservation", "view"]],
      ["A job reference call", "Describe a former colleague's strengths on a reference call.", ["recommend", "strength", "reliable", "worked", "trust"]],
      ["At the university office", "Ask about admission requirements and deadlines.", ["requirement", "deadline", "document", "submit", "eligible"]],
      ["Client onboarding call", "Collect everything you need before starting a project.", ["access", "content", "brand", "kickoff", "contact"]],
      ["Emergencies", "Explain an emergency and ask for help clearly.", ["emergency", "accident", "urgent", "location", "ambulance"]],
      ["Week 8 review", "Describe your city to a foreign visitor in 2 minutes.", ["famous", "crowded", "history", "recommend", "visit"]],
    ],
  },
  {
    focus: "Explaining and presenting — teach what you know",
    days: [
      ["Present a design", "Present homepage design options and recommend one.", ["option", "recommend", "audience", "convert", "layout"]],
      ["Give a tutorial", "Teach a junior how to deploy a website step by step.", ["step", "first", "then", "finally", "check"]],
      ["Interview: explain a gap", "Explain a gap in your CV honestly and briefly.", ["gap", "during", "learned", "freelance", "ready"]],
      ["Summarise a podcast", "Listen to a talk and summarise it in five sentences.", ["speaker", "argue", "example", "conclude", "agree"]],
      ["Train the client", "Teach a client to update their own website content.", ["dashboard", "edit", "publish", "image", "careful"]],
      ["Directions and transport", "Give directions and explain bus/train options.", ["straight", "turn", "corner", "platform", "ticket"]],
      ["Week 9 review", "Teach a 2-minute mini-lesson on any topic you know well.", ["introduce", "explain", "example", "practice", "question"]],
    ],
  },
  {
    focus: "Fluency sprints — review, stretch and final tests",
    days: [
      ["The hard client call, replayed", "Redo your toughest scenario: delay + discount + scope creep together.", ["handle", "calm", "solution", "professional", "trust"]],
      ["Two-minute talk: my city", "Speak for two full minutes without stopping.", ["describe", "history", "people", "famous", "change"]],
      ["Final mock interview", "Answer five interview questions in a row.", ["strength", "weakness", "achievement", "failure", "future"]],
      ["Final listening challenge", "Listen to natural-speed speech and summarise it.", ["natural", "fast", "catch", "main idea", "detail"]],
      ["Tell your 70-day story", "Describe your English journey: Day 1 vs today.", ["journey", "struggled", "improved", "habit", "proud"]],
      ["Teach a beginner", "Teach an absolute beginner ten useful sentences.", ["beginner", "useful", "daily", "repeat", "simple"]],
      ["Day 70 — final test & celebration", "Record the final monologue battery and compare with Day 1.", ["compare", "progress", "achieve", "continue", "goal"]],
    ],
  },
];

export const CURRICULUM: DayOutline[] = WEEKS.flatMap((week, wi) =>
  week.days.map(([theme, scenario, vocabFocus], di) => {
    const day = wi * 7 + di + 1;
    const sound = TARGET_SOUNDS[(day - 1) % TARGET_SOUNDS.length];
    const isReviewDay = di === 6;
    return {
      day,
      week: wi + 1,
      track: TRACK_ROTATION[di],
      theme: `${theme} — ${week.focus.split(" — ")[0]}`,
      targetSound: sound.label,
      targetSoundKey: sound.key,
      scenario,
      vocabFocus,
      composition: isReviewDay ? REVIEW_COMPOSITION : STANDARD_COMPOSITION,
    } satisfies DayOutline;
  })
);

export function getDay(day: number): DayOutline {
  return CURRICULUM[Math.min(Math.max(day, 1), 70) - 1];
}

export function targetSoundNote(key: string): string {
  return TARGET_SOUNDS.find((s) => s.key === key)?.note ?? "";
}
