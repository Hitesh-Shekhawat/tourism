// Contrast test for every palette stop in content/day.json (§12): body text (ink), secondary text (muted)
// and accent text/UI (numerals, links, focus rings) on --paper must reach 4.5:1. Also reports the worst
// moment of each chapter-to-chapter blend (informational: those last a fraction of a viewport).
// Run: npm run check:contrast   (also runs before every build)
import fs from "node:fs";
import { contrast, hexToOklch, hexToRgb, mixLch, oklchToRgb } from "../lib/story/color.ts";

const day = JSON.parse(fs.readFileSync(new URL("../content/day.json", import.meta.url), "utf8"));
const MIN = 4.5;
let failed = 0;

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad("palette", 10)}${pad("paper", 10)}${pad("ink", 8)}${pad("muted", 8)}${pad("accent", 8)}ivory-on-terracotta`);
for (const [name, p] of Object.entries(day.palettes)) {
  const paper = hexToRgb(p.paper);
  const r = ["ink", "muted", "accent"].map((k) => contrast(hexToRgb(p[k]), paper));
  const bad = r.some((v) => v < MIN);
  if (bad) failed++;
  const btn = contrast(hexToRgb("#f7f1e6"), hexToRgb("#a14d2a"));
  console.log(`${pad(name, 10)}${pad(p.paper, 10)}${r.map((v) => pad(v.toFixed(2), 8)).join("")}${btn.toFixed(2)}${bad ? "   ✗ below 4.5" : ""}`);
}

// Blend check, mirroring lib/story/palette.ts blend(): worst ink/paper contrast while scrolling between chapters
const order = [];
for (const c of day.chapters) {
  order.push(c.palette);
  for (const s of c.stops ?? []) order.push(s.palette);
}
const seq = order.filter((p, i) => p !== order[i - 1]);
console.log("\nBlends (worst moment, informational):");
for (let i = 0; i < seq.length - 1; i++) {
  const a = day.palettes[seq[i]];
  const b = day.palettes[seq[i + 1]];
  const darkA = hexToOklch(a.ink)[0] > hexToOklch(a.paper)[0];
  const darkB = hexToOklch(b.ink)[0] > hexToOklch(b.paper)[0];
  const flip = darkA !== darkB;
  let worst = 99;
  let at = 0;
  for (let t = 0; t <= 1.0001; t += 0.01) {
    const tp = flip ? Math.min(1, Math.max(0, (t - 0.5) * 3 + 0.5)) : t;
    const paper = oklchToRgb(mixLch(hexToOklch(a.paper), hexToOklch(b.paper), tp));
    const ink = flip ? hexToRgb((tp < 0.5 ? a : b).ink) : oklchToRgb(mixLch(hexToOklch(a.ink), hexToOklch(b.ink), t));
    const c = contrast(ink, paper);
    if (c < worst) (worst = c), (at = t);
  }
  console.log(`  ${pad(seq[i] + " → " + seq[i + 1], 22)} ${worst.toFixed(2)} at t=${at.toFixed(2)}${flip ? " (polarity flip)" : ""}`);
}

if (failed) {
  console.error(`\n✗ ${failed} palette(s) fail ${MIN}:1. Adjust content/day.json.`);
  process.exit(1);
}
console.log(`\n✓ All ${Object.keys(day.palettes).length} palettes pass ${MIN}:1 for ink, muted and accent on paper.`);
