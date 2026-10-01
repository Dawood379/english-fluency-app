import Link from "next/link";
import { CURRICULUM } from "@/lib/curriculum";
import { isLessonCached } from "@/lib/lesson-server";
import { Card, H2, Badge, Meta } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const cachedFlags = await Promise.all(CURRICULUM.map((d) => isLessonCached(d.day)));
  const authored = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">70-day curriculum</h1>
        <p className="mt-1 text-base text-ink-soft">
          Days 1–7 are fully written. Days 8–70 generate once with Gemini and are then cached forever.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CURRICULUM.map((d, i) => (
          <Link key={d.day} href={`/curriculum/${d.day}`} className="block">
            <Card className="h-full transition-colors hover:border-accent">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-accent-dark">Day {d.day}</span>
                {authored.includes(d.day) || cachedFlags[i] ? (
                  <Badge tone="good">Ready</Badge>
                ) : (
                  <Badge>Template</Badge>
                )}
              </div>
              <p className="mt-2 text-base font-medium leading-snug">{d.theme.split(" — ")[0]}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="accent">{d.track}</Badge>
                <Badge>{d.targetSound}</Badge>
              </div>
              <Meta>{d.scenario}</Meta>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
