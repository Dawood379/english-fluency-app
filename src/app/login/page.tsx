"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/");
    else setError("Wrong password. Try again.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Fluency Desk</h1>
        <p className="mt-1 text-sm text-ink-faint">Your personal 70-day English practice system.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-soft">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base"
              placeholder="Enter your password"
            />
          </label>
          {error && <p className="text-sm text-bad" role="alert">{error}</p>}
          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-white hover:bg-accent-dark"
          >
            Unlock
          </button>
        </form>
      </Card>
    </div>
  );
}
