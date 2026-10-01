import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, authEnabled, checkPassword, makeSessionToken } from "@/lib/auth";

const Body = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  if (!authEnabled()) {
    return NextResponse.json({ ok: true, demo: true });
  }
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success || !checkPassword(body.data.password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
  return res;
}
