import { dbFindOne } from "./db";
import { USER_ID } from "./config";
import { AUTHORED_LESSONS, templateLesson } from "./lessons";
import type { LessonContent } from "./types";

/** Server-side lesson loader: authored → cached (generated once) → template. */
export async function getLessonServer(day: number): Promise<LessonContent> {
  if (AUTHORED_LESSONS[day]) return AUTHORED_LESSONS[day];
  const cached = await dbFindOne<{ content: LessonContent }>("contentCache", {
    _id: `lesson:v1:day${day}`,
    userId: USER_ID,
  });
  if (cached?.content) return { ...cached.content, source: "generated" as const };
  return templateLesson(day);
}

export async function isLessonCached(day: number): Promise<boolean> {
  const cached = await dbFindOne("contentCache", { _id: `lesson:v1:day${day}`, userId: USER_ID });
  return Boolean(cached);
}
