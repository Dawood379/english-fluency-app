import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from "ts-fsrs";
import type { SrsCard } from "./types";

const f = fsrs(generatorParameters({ enable_fuzz: true }));

/** FSRS parameters live entirely locally — reviews cost zero API calls. */

export function emptyFsrsState(now = new Date()) {
  const c = createEmptyCard(now);
  return serialize(c);
}

function serialize(c: Card) {
  return {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    state: Number(c.state),
    last_review: c.last_review ? c.last_review.toISOString() : undefined,
  };
}

function deserialize(card: SrsCard): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? new Date(card.last_review) : undefined,
    learning_steps: 0,
  } as Card;
}

export function reviewCard(card: SrsCard, rating: Rating, now = new Date()) {
  const result = f.next(deserialize(card), now, rating as Grade);
  return { patch: serialize(result.card), log: result.log };
}

export function isDue(card: SrsCard, now = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

/** "Mature" = in Review state with stability ≥ 21 days (FSRS convention). */
export function isMature(card: SrsCard): boolean {
  return card.state === 2 && card.stability >= 21;
}

export { Rating };
