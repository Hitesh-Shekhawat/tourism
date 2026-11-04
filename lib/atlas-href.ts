import type { Interest } from "@/content/explorer";

/** The shareable URL of an atlas view on the home page (also what an atlas link does without script). */
export const atlasHref = (state: string | null, place?: string, interest?: Interest | null) => {
  const q = new URLSearchParams();
  if (state) q.set("state", state);
  if (state && place) q.set("place", place);
  if (interest) q.set("interest", interest);
  const s = q.toString();
  return `/${s ? `?${s}` : ""}#explore`;
};
