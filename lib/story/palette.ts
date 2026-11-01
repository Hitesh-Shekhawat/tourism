import { palettes, type Palette, type PaletteKey } from "@/lib/day";
import { contrast, hexToOklch, hexToRgb, mixLch, oklchToRgb, rgbToHex, type Lch } from "./color";

/** The time-of-day layer (§3.1): CSS custom properties on <html>, interpolated in OKLCH. */
const KEYS = ["paper", "ink", "muted", "accent", "sky"] as const;
type Key = (typeof KEYS)[number];

const lch = Object.fromEntries(Object.entries(palettes).map(([k, p]) => [k, Object.fromEntries(KEYS.map((c) => [c, hexToOklch(p[c])]))])) as Record<PaletteKey, Record<Key, Lch>>;
/** Light ink on dark paper */
const dark = (k: PaletteKey) => hexToOklch(palettes[k].ink)[0] > hexToOklch(palettes[k].paper)[0];

export type Keyframe = { pos: number; palette: PaletteKey };

/** Blend two palettes. When polarity flips (dusk), paper crosses mid-grey fast and ink switches sides at the midpoint. */
export function blend(a: PaletteKey, b: PaletteKey, t: number): Palette {
  if (a === b || t <= 0) return palettes[a];
  if (t >= 1) return palettes[b];
  const flip = dark(a) !== dark(b);
  const tp = flip ? Math.min(1, Math.max(0, (t - 0.5) * 3 + 0.5)) : t;
  const out = {} as Palette;
  for (const c of KEYS) {
    if (flip && c !== "paper" && c !== "sky") out[c] = palettes[tp < 0.5 ? a : b][c];
    else out[c] = rgbToHex(oklchToRgb(mixLch(lch[a][c], lch[b][c], c === "paper" ? tp : t)));
  }
  return out;
}

export function paletteAt(frames: Keyframe[], y: number, instant = false): Palette {
  if (!frames.length) return palettes.morning;
  if (y <= frames[0].pos) return palettes[frames[0].palette];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (y < b.pos) {
      const t = (y - a.pos) / Math.max(1, b.pos - a.pos);
      return instant ? palettes[t < 0.5 ? a.palette : b.palette] : blend(a.palette, b.palette, t);
    }
  }
  return palettes[frames[frames.length - 1].palette];
}

let last = "";
export function applyPalette(p: Palette) {
  const key = `${p.paper}${p.ink}${p.muted}${p.accent}${p.sky}`;
  if (key === last) return;
  last = key;
  const s = document.documentElement.style;
  s.setProperty("--paper", p.paper);
  s.setProperty("--ink", p.ink);
  s.setProperty("--muted", p.muted);
  s.setProperty("--accent", p.accent);
  s.setProperty("--sky", p.sky);
  s.setProperty("--scheme", hexToOklch(p.paper)[0] < 0.5 ? "dark" : "light");
}

export function resetPalette() {
  last = "";
  const s = document.documentElement.style;
  for (const k of ["--paper", "--ink", "--muted", "--accent", "--sky", "--scheme"]) s.removeProperty(k);
}

/** Used by scripts/check-contrast.mjs and the dev overlay. */
export function paletteContrast(p: Palette) {
  const paper = hexToRgb(p.paper);
  return { ink: contrast(hexToRgb(p.ink), paper), muted: contrast(hexToRgb(p.muted), paper), accent: contrast(hexToRgb(p.accent), paper) };
}
