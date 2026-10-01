import { notFound } from "next/navigation";
import { getDay } from "@/lib/curriculum";
import { getLessonServer } from "@/lib/lesson-server";
import LessonView from "@/components/LessonView";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayStr } = await params;
  const day = Number(dayStr);
  if (!Number.isInteger(day) || day < 1 || day > 70) notFound();
  const outline = getDay(day);
  const lesson = await getLessonServer(day);
  return (
    <LessonView
      initial={lesson}
      day={day}
      outline={{ theme: outline.theme, track: outline.track, targetSound: outline.targetSound, composition: outline.composition }}
    />
  );
}
