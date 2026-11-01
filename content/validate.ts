import { z } from "zod";
import day from "./day.json";
import { destinations } from "./destinations";
import { experiences } from "./experiences";
import { tours } from "./tours";

/**
 * Zod schemas for the content (§8). Runs on the server only (root layout), so a typo in
 * content/day.json or a tour file fails the build with a readable message instead of shipping.
 */
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const time = z.string().regex(/^\d{2}:\d{2}$/);
const palette = z.object({ paper: hex, ink: hex, muted: hex, accent: hex, sky: hex });
const size = z.object({ dir: z.string().startsWith("/"), w: z.number().int().positive(), h: z.number().int().positive() });

const Day = z
  .object({
    day: z.object({ start: time, end: time }),
    chapters: z
      .array(
        z.object({
          id: z.enum(["threshold", "intro", "hours", "trail", "thar", "ganjifa", "journeys", "plan", "stories", "starlight"]),
          n: z.string(),
          time,
          place: z.string().min(1),
          placeDeva: z.string().min(1),
          title: z.string().min(1),
          palette: z.string(),
          pin: z.number().positive().optional(),
          stops: z.array(z.object({ id: z.string(), time, palette: z.string() })).optional(),
          frames: z.object({ sequence: z.string(), from: z.number().int(), to: z.number().int(), introFrom: z.number().int(), introSeconds: z.number().positive() }).optional(),
          panels: z.array(z.object({ id: z.string(), from: z.number().min(0).max(1), to: z.number().min(0).max(1) })).optional(),
        }),
      )
      .length(10),
    palettes: z.record(z.string(), palette),
    frameSequences: z.record(
      z.string(),
      z.object({
        status: z.enum(["ready", "owner-to-supply"]),
        count: z.number().int().positive(),
        ext: z.string(),
        pad: z.number().int().positive(),
        fit: z.enum(["cover", "contain"]),
        poster: z.number().int().positive(),
        desktop: size,
        mobile: size,
        credit: z.string(),
        brief: z.string().optional(),
        hours: z.string().optional(),
      }),
    ),
  })
  .superRefine((d, ctx) => {
    for (const c of d.chapters) {
      for (const p of [c.palette, ...(c.stops ?? []).map((s) => s.palette)]) if (!(p in d.palettes)) ctx.addIssue({ code: "custom", message: `chapter ${c.id}: unknown palette "${p}"` });
      if (c.frames && !(c.frames.sequence in d.frameSequences)) ctx.addIssue({ code: "custom", message: `chapter ${c.id}: unknown sequence "${c.frames.sequence}"` });
    }
  });

const Seo = z.object({ title: z.string().min(1).max(70), description: z.string().min(1).max(170) });

const Tour = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  durationNights: z.number().int().nonnegative(),
  durationDays: z.number().int().positive(),
  route: z.array(z.string()).min(1),
  bestSeason: z.string(),
  idealFor: z.array(z.string()),
  heroImage: z.string(),
  gallery: z.array(z.string()),
  itinerary: z.array(z.object({ day: z.number().int().positive(), title: z.string(), description: z.string(), overnight: z.string().optional() })).min(1),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  hotelCategory: z.string().optional(),
  priceFromINR: z.number().positive().optional(),
  priceBasis: z.string().optional(),
  featured: z.boolean(),
  draft: z.boolean(),
  seo: Seo,
});

const Destination = z.object({ slug: z.string(), name: z.string(), devanagari: z.string(), descriptor: z.string(), coords: z.tuple([z.number(), z.number()]), seo: Seo });
const Experience = z.object({ slug: z.string(), title: z.string(), summary: z.string(), image: z.string(), seo: Seo });

let done = false;
export function validateContent() {
  if (done) return;
  done = true;
  const problems: string[] = [];
  const check = (label: string, schema: z.ZodType, value: unknown) => {
    const r = schema.safeParse(value);
    if (!r.success) problems.push(...r.error.issues.map((i) => `${label}${i.path.length ? "." + i.path.join(".") : ""}: ${i.message}`));
  };
  check("content/day.json", Day, day);
  tours.forEach((t) => check(`content/tours/${t.slug}`, Tour, t));
  destinations.forEach((d) => check(`destinations/${d.slug}`, Destination, d));
  experiences.forEach((e) => check(`experiences/${e.slug}`, Experience, e));
  if (problems.length) throw new Error(`Content validation failed:\n  ${problems.join("\n  ")}`);
}
