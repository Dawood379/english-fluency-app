import Nav from "@/components/Nav";
import { usingMongo, ensureUser } from "@/lib/db";
import { USER_ID } from "@/lib/config";
import { dayNumber } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = (await ensureUser(USER_ID)) as { programStart: string };
  const day = dayNumber(String(user.programStart ?? new Date().toISOString().slice(0, 10)));
  return (
    <div>
      <Nav />
      <div className="border-b border-line bg-desk/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
          <span className="font-semibold text-accent-dark">Day {day} of 70</span>
          <span className="text-ink-faint">
            {usingMongo ? "MongoDB connected" : "Demo data mode (file store) — set MONGODB_URI for MongoDB"}
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}
