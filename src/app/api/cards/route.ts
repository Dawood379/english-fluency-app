import { NextResponse } from "next/server";
import { z } from "zod";
import { dbInsert, dbFindOne, dbUpdate, newId } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { reviewCard, emptyFsrsState, Rating } from "@/lib/fsrs-helpers";
import type { SrsCard } from "@/lib/types";

const CreateBody = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(1000),
  kind: z.enum(["error", "vocab", "phrase"]).default("vocab"),
});

export async function POST(req: Request) {
  const body = CreateBody.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid card." }, { status: 400 });
  const card: SrsCard = {
    _id: newId(),
    userId: USER_ID,
    front: body.data.front,
    back: body.data.back,
    kind: body.data.kind,
    ...emptyFsrsState(),
    createdAt: new Date().toISOString(),
  };
  await dbInsert("cards", card);
  return NextResponse.json({ card });
}

const ReviewBody = z.object({
  cardId: z.string().min(1),
  rating: z.enum(["again", "hard", "good", "easy"]),
});

const RATING_MAP = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

export async function PATCH(req: Request) {
  const body = ReviewBody.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  const card = await dbFindOne<SrsCard>("cards", { _id: body.data.cardId, userId: USER_ID });
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
  const { patch, log } = reviewCard(card, RATING_MAP[body.data.rating]);
  await dbUpdate("cards", card._id, patch);
  await dbInsert("reviewLogs", {
    _id: newId(),
    userId: USER_ID,
    cardId: card._id,
    rating: body.data.rating,
    log,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ nextDue: patch.due });
}
