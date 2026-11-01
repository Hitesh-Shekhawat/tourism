import raw from "@/content/day.json";

/** Typed access to content/day.json, the scroll spine (§2). Validated at build time by content/validate.ts. */
export type PaletteKey = keyof typeof raw.palettes;
export type Palette = { paper: string; ink: string; muted: string; accent: string; sky: string };

export type Chapter = {
  id: ChapterId;
  n: string;
  time: string;
  place: string;
  placeDeva: string;
  title: string;
  palette: PaletteKey;
  /** Desktop pin length in viewport heights */
  pin?: number;
  stops?: { id: string; time: string; palette: PaletteKey }[];
  frames?: { sequence: SequenceName; from: number; to: number; introFrom: number; introSeconds: number };
  panels?: { id: string; from: number; to: number }[];
};

export type ChapterId = "threshold" | "intro" | "hours" | "trail" | "thar" | "ganjifa" | "journeys" | "plan" | "stories" | "starlight";

export type SequenceSize = { dir: string; w: number; h: number };
export type Sequence = {
  status: "ready" | "owner-to-supply";
  count: number;
  ext: string;
  pad: number;
  fit: "cover" | "contain";
  poster: number;
  desktop: SequenceSize;
  mobile: SequenceSize;
  credit: string;
  brief?: string;
  /** Bump when the frames are regenerated: frames are cached for a week, so the URL must change. */
  rev?: number;
};
export type SequenceName = keyof typeof raw.frameSequences;

export const chapters = raw.chapters as Chapter[];
export const palettes = raw.palettes as Record<PaletteKey, Palette>;
export const sequences = raw.frameSequences as Record<SequenceName, Sequence>;

export const chapter = (id: ChapterId) => chapters.find((c) => c.id === id)!;
export const chapterIndex = (id: ChapterId) => chapters.findIndex((c) => c.id === id);

/** Frame i (1-based) of a sequence at a size. */
export const frameUrl = (s: Sequence, size: "desktop" | "mobile", i: number) => `${s[size].dir}/${String(i).padStart(s.pad, "0")}.${s.ext}${s.rev ? `?v=${s.rev}` : ""}`;

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fmtMinutes = (min: number) => {
  const m = Math.round(min);
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** DOM ids */
export const chapterDomId = (id: ChapterId) => `ch-${id}`;
export const chapterHeadingId = (id: ChapterId) => `ch-${id}-title`;
