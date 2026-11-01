"use client";

import { chapterDomId, type ChapterId } from "@/lib/day";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading } from "@/lib/story/fx";

/** For quiet chapters: SplitText line rise + SOFT settle on every [data-rise] heading in the chapter. */
export function HeadingFx({ id, order }: { id: ChapterId; order: number }) {
  useChapterMotion(`${id}:headings`, order, (m) => {
    document.querySelectorAll<HTMLElement>(`#${chapterDomId(id)} [data-rise]`).forEach((el) => riseHeading(m, el));
  });
  return null;
}
