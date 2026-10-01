import mongoose from "mongoose";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Data layer with two backends behind one tiny API:
 *
 *  - MongoDB (when MONGODB_URI is set): cached singleton connection on
 *    globalThis (required for Next.js dev hot reload), models from models.ts.
 *  - File fallback (no MONGODB_URI): a JSON document store in
 *    `.data/store.json` so the whole app runs in demo mode with zero setup.
 *    NOTE: the file store keeps everything in one JSON file — perfect for a
 *    single-user local demo, not for production concurrency.
 *
 * Every document carries `userId`. Audio never enters this layer — only
 * text, scores and FSRS state.
 */

export type CollName =
  | "users"
  | "sessions"
  | "journal"
  | "cards"
  | "reviewLogs"
  | "monologues"
  | "drillScores"
  | "contentCache"
  | "usageLedger"
  | "listeningChecks";

const MONGO_MODELS: Record<CollName, string> = {
  users: "User",
  sessions: "Session",
  journal: "JournalEntry",
  cards: "SrsCard",
  reviewLogs: "ReviewLog",
  monologues: "MonologueAttempt",
  drillScores: "DrillScore",
  contentCache: "ContentCache",
  usageLedger: "UsageLedger",
  listeningChecks: "ListeningCheck",
};

export const usingMongo = Boolean(process.env.MONGODB_URI);

// ---------- Mongo connection (cached on globalThis) ----------
type GlobalWithMongo = typeof globalThis & {
  __mongoConn?: typeof mongoose;
  __mongoPromise?: Promise<typeof mongoose>;
};
const g = globalThis as GlobalWithMongo;

async function connectMongo() {
  if (g.__mongoConn) return g.__mongoConn;
  if (!g.__mongoPromise) {
    g.__mongoPromise = mongoose.connect(process.env.MONGODB_URI as string, {
      bufferCommands: false,
    });
  }
  g.__mongoConn = await g.__mongoPromise;
  return g.__mongoConn;
}

async function mongoModel(coll: CollName) {
  await connectMongo();
  const { Users, Sessions, Journal, Cards, ReviewLogs, Monologues, DrillScores, ContentCache, UsageLedger, ListeningChecks } =
    await import("./models");
  const map = {
    User: Users(), Session: Sessions(), JournalEntry: Journal(), SrsCard: Cards(),
    ReviewLog: ReviewLogs(), MonologueAttempt: Monologues(), DrillScore: DrillScores(),
    ContentCache: ContentCache(), UsageLedger: UsageLedger(), ListeningCheck: ListeningChecks(),
  } as unknown as Record<string, mongoose.Model<any>>;
  return map[MONGO_MODELS[coll]];
}

// ---------- File store ----------
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
type StoreShape = Record<CollName, Record<string, unknown>[]>;
let fileCache: StoreShape | null = null;

function emptyStore(): StoreShape {
  return {
    users: [], sessions: [], journal: [], cards: [], reviewLogs: [],
    monologues: [], drillScores: [], contentCache: [], usageLedger: [], listeningChecks: [],
  };
}

let loadPromise: Promise<StoreShape> | null = null;

async function loadFileStore(): Promise<StoreShape> {
  if (fileCache) return fileCache;
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const raw = await fs.readFile(DATA_FILE, "utf8");
        fileCache = { ...emptyStore(), ...(JSON.parse(raw) as StoreShape) };
      } catch {
        fileCache = emptyStore();
      }
      return fileCache;
    })();
  }
  return loadPromise;
}

/**
 * Persists are serialized through a promise chain and each write uses a
 * unique tmp file. Without this, parallel page renders (dashboard fires
 * several data calls at once) race on the same .tmp path and the second
 * rename fails with ENOENT.
 */
let persistChain: Promise<void> = Promise.resolve();
let persistCounter = 0;

async function persistFileStore() {
  if (!fileCache) return;
  const snapshot = JSON.stringify(fileCache, null, 1);
  persistChain = persistChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.${++persistCounter}.tmp`;
    await fs.writeFile(tmp, snapshot);
    await fs.rename(tmp, DATA_FILE);
  });
  await persistChain;
}

// ---------- Unified API ----------
export function newId(): string {
  return crypto.randomUUID();
}

function matches(doc: Record<string, unknown>, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([k, v]) => doc[k] === v);
}

export async function dbInsert<T extends object>(coll: CollName, doc: T): Promise<T> {
  if (usingMongo) {
    const M = await mongoModel(coll);
    await M.create(doc as never);
    return doc;
  }
  const store = await loadFileStore();
  store[coll].push(doc as Record<string, unknown>);
  await persistFileStore();
  return doc;
}

export async function dbFind<T = Record<string, unknown>>(
  coll: CollName,
  filter: Record<string, unknown> = {}
): Promise<T[]> {
  if (usingMongo) {
    const M = await mongoModel(coll);
    const rows = await M.find(filter as never).lean();
    return rows as unknown as T[];
  }
  const store = await loadFileStore();
  return store[coll].filter((d) => matches(d, filter)) as T[];
}

export async function dbFindOne<T = Record<string, unknown>>(
  coll: CollName,
  filter: Record<string, unknown>
): Promise<T | null> {
  const rows = await dbFind<T>(coll, filter);
  return rows[0] ?? null;
}

export async function dbUpdate(
  coll: CollName,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  if (usingMongo) {
    const M = await mongoModel(coll);
    await M.updateOne({ _id: id } as never, { $set: patch } as never);
    return;
  }
  const store = await loadFileStore();
  const doc = store[coll].find((d) => d._id === id);
  if (doc) Object.assign(doc, patch);
  await persistFileStore();
}

export async function dbDelete(coll: CollName, id: string): Promise<void> {
  if (usingMongo) {
    const M = await mongoModel(coll);
    await M.deleteOne({ _id: id } as never);
    return;
  }
  const store = await loadFileStore();
  store[coll] = store[coll].filter((d) => d._id !== id);
  await persistFileStore();
}

/** Ensure the single seeded owner user exists; returns the user doc. */
const ensureInFlight = new Map<string, Promise<Record<string, unknown>>>();

export async function ensureUser(userId: string) {
  const pending = ensureInFlight.get(userId);
  if (pending) return pending;
  const job = (async () => {
    const existing = await dbFindOne<Record<string, unknown>>("users", { _id: userId });
    if (existing) return existing;
    const start = new Date().toISOString().slice(0, 10);
    const user = {
      _id: userId,
      userId,
      name: "Owner",
      programStart: start, // Day 1 of the 70-day program
      createdAt: new Date().toISOString(),
    };
    try {
      await dbInsert("users", user);
    } catch {
      // Lost a cross-process race on the unique _id — the winner's doc wins.
      const winner = await dbFindOne<Record<string, unknown>>("users", { _id: userId });
      if (winner) return winner;
      throw new Error("ensureUser failed");
    }
    return user;
  })();
  ensureInFlight.set(userId, job);
  try {
    return await job;
  } finally {
    ensureInFlight.delete(userId);
  }
}
