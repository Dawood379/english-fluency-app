/**
 * Single-user password gate. If APP_PASSWORD is not set, the app runs in
 * open local demo mode. When set, login issues an HMAC-signed cookie.
 * Signing uses Web Crypto so the same code works in proxy (edge) and in
 * route handlers (node).
 */

export const AUTH_COOKIE = "efa_session";
const MESSAGE = "fluency-desk-v1";

async function hmacHex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function authEnabled(): boolean {
  return Boolean(process.env.APP_PASSWORD);
}

export async function makeSessionToken(): Promise<string> {
  const pw = process.env.APP_PASSWORD as string;
  const issued = Date.now().toString();
  const sig = await hmacHex(pw, `${MESSAGE}:${issued}`);
  return `${issued}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!authEnabled()) return true;
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  // 30-day sessions
  if (Date.now() - Number(issued) > 30 * 24 * 3600 * 1000) return false;
  const expected = await hmacHex(process.env.APP_PASSWORD as string, `${MESSAGE}:${issued}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(candidate: string): boolean {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return false;
  if (candidate.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i++) diff |= candidate.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}
