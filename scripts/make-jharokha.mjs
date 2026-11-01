// Writes the jharokha arch as SVG clip paths (§2): public/svg/jharokha-arch-portrait.svg and
// jharokha-arch-4x5.svg, each with <clipPath id="jharokha" clipPathUnits="objectBoundingBox">.
// The geometry is lib/arch.ts (also used by the CSS clip and the three.js wall), so the three always match.
//
//   node scripts/make-jharokha.mjs [--lobes=4] [--spring=0.34]
// --lobes / --spring regenerate lib/arch-variant.json for another lobe count or crown height (not used by the site).
import fs from "node:fs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const SPRING = Number(args.spring ?? 0.34);
const LOBES = Number(args.lobes ?? 4);
const BULGE = 0.09;
const f = (n) => +n.toFixed(4);

// Same construction as lib/arch.ts: straight jambs, a soft pointed crown split into cusped lobes.
const crown = (t) => {
  const p0 = [0, SPRING], c = [0, SPRING * 0.22], p1 = [0.5, 0], u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};
function lobes(mirror) {
  const pts = Array.from({ length: LOBES + 1 }, (_, i) => crown(i / LOBES));
  if (mirror) pts.reverse();
  const m = (p) => (mirror ? [1 - p[0], p[1]] : p);
  let d = "";
  for (let i = 0; i < LOBES; i++) {
    const a = m(pts[i]), b = m(pts[i + 1]);
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let nx = b[1] - a[1], ny = -(b[0] - a[0]);
    if (nx * (0.5 - mx) + ny * (0.6 - my) > 0) (nx = -nx), (ny = -ny);
    d += ` Q${f(mx + nx * BULGE)} ${f(my + ny * BULGE)} ${f(b[0])} ${f(b[1])}`;
  }
  return d;
}
const d = `M0 1 L0 ${SPRING}${lobes(false)}${lobes(true)} L1 1 Z`;

const file = (w, h, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <!-- Jharokha arch (${label}). Use as clip-path: url(#jharokha) on any box; the path is in objectBoundingBox units. -->
  <defs>
    <clipPath id="jharokha" clipPathUnits="objectBoundingBox">
      <path d="${d}"/>
    </clipPath>
  </defs>
  <path d="${d}" transform="scale(${w} ${h})" fill="#EDE2CF" stroke="#B08D57" stroke-width="${(1 / Math.max(w, h)).toFixed(4)}"/>
</svg>
`;

fs.mkdirSync("public/svg", { recursive: true });
if (args.lobes || args.spring) {
  fs.writeFileSync("lib/arch-variant.json", JSON.stringify({ spring: SPRING, lobes: LOBES, d }, null, 2));
  console.log("wrote lib/arch-variant.json");
} else {
  fs.writeFileSync("public/svg/jharokha-arch-portrait.svg", file(600, 1000, "portrait 3:5"));
  fs.writeFileSync("public/svg/jharokha-arch-4x5.svg", file(800, 1000, "4:5"));
  console.log("wrote public/svg/jharokha-arch-portrait.svg, public/svg/jharokha-arch-4x5.svg");
}
