import { dbFind } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { isDue } from "@/lib/fsrs-helpers";
import type { SrsCard } from "@/lib/types";
import FlashcardReview from "@/components/FlashcardReview";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const cards = await dbFind<SrsCard>("cards", { userId: USER_ID });
  const due = cards.filter((c) => isDue(c));
  const rest = cards.filter((c) => !isDue(c));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Flashcards</h1>
        <p className="mt-1 text-base text-ink-soft">
          Spaced repetition (FSRS) — cards from your mistakes appear exactly when you are about to forget them.
        </p>
      </div>
      <FlashcardReview initialCards={[...due, ...rest]} />
    </div>
  );
}
