import mongoose, { Schema, type Model } from "mongoose";

/**
 * Mongoose models, guarded against Next.js hot-reload model overwrite.
 * Schemas are intentionally permissive (strict: false) — shapes are
 * enforced by the TypeScript types + zod at the API boundary.
 *
 * NOTE: keep this helper NON-generic. Calling `mongoose.model<T>()` with an
 * unresolved type parameter makes the TypeScript checker explode (multi-GB
 * inference loop) on mongoose 9 types. The data layer casts results to its
 * own types, so Model<any> is all we need here.
 */
function model(name: string): Model<any> {
  const existing = mongoose.models[name] as Model<any> | undefined;
  if (existing) return existing;
  const schema = new Schema(
    {
      _id: { type: String, required: true },
      userId: { type: String, required: true, index: true },
    },
    { strict: false, versionKey: false }
  );
  return mongoose.model(name, schema) as unknown as Model<any>;
}

export const Users = () => model("User");
export const Sessions = () => model("Session");
export const Journal = () => model("JournalEntry");
export const Cards = () => model("SrsCard");
export const ReviewLogs = () => model("ReviewLog");
export const Monologues = () => model("MonologueAttempt");
export const DrillScores = () => model("DrillScore");
export const ContentCache = () => model("ContentCache");
export const UsageLedger = () => model("UsageLedger");
export const ListeningChecks = () => model("ListeningCheck");
