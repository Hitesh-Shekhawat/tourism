// Labelled stand-in frames for a sequence the owner has not supplied yet (§5), so the layout and the
// scroll timing are final before the footage exists. Every frame says PLACEHOLDER, and the production
// build fails while the manifest still marks the sequence `status: "owner-to-supply"`.
//
//   node scripts/placeholder-frames.mjs hero-aerial 150 "Drone push over Jaipur at first light"
//
// Writes public/frames/<name>/{desktop,mobile}/0001.webp … in the sizes from content/day.json.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , name, countArg, ...briefWords] = process.argv;
if (!name) {
  console.error('usage: node scripts/placeholder-frames.mjs <sequence> [count] "<brief>"');
  process.exit(1);
}
const day = JSON.parse(fs.readFileSync(new URL("../content/day.json", import.meta.url), "utf8"));
const seq = day.frameSequences[name];
if (!seq) throw new Error(`No sequence "${name}" in content/day.json`);
const count = Number(countArg || seq.count);
const brief = briefWords.join(" ") || seq.brief || "";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(text, max) {
  const out = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    if ((line + " " + w).trim().length > max) out.push(line.trim()), (line = w);
    else line += " " + w;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}

function svg(W, H, i) {
  const t = (i - 1) / Math.max(1, count - 1);
  const portrait = H > W;
  // A slow "push": the horizon and a far ridge drift and grow, so scrubbing is visibly continuous
  const horizon = H * (0.62 - 0.08 * t);
  const scale = 1 + 0.35 * t;
  const sunY = horizon - H * (0.05 + 0.18 * t);
  const fs1 = portrait ? 44 : 56;
  const lines = wrap(brief, portrait ? 38 : 70).slice(0, 6);
  const ridge = Array.from({ length: 13 }, (_, k) => {
    const x = W / 2 + (k / 12 - 0.5) * W * 1.3 * scale;
    const y = horizon - (Math.sin(k * 1.7) * 0.5 + 0.6) * H * 0.06 * scale;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3950"/><stop offset=".55" stop-color="#c98d6a"/><stop offset="1" stop-color="#e9c9a2"/></linearGradient>
    <pattern id="hatch" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="none"/><line x1="0" y1="0" x2="0" y2="22" stroke="#1e1a16" stroke-opacity=".05" stroke-width="2"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * 0.3}" cy="${sunY}" r="${(portrait ? 36 : 44) * scale}" fill="#f7e2b8" fill-opacity=".9"/>
  <polygon points="0,${H} ${ridge} ${W},${H}" fill="#8f6a52"/>
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="#b08d6e" fill-opacity=".55"/>
  <rect width="${W}" height="${H}" fill="url(#hatch)"/>
  <g font-family="Consolas, Menlo, monospace" fill="#1e1a16">
    <rect x="${W * 0.06 - 18}" y="${H * 0.1 - fs1 - 10}" width="${portrait ? W * 0.88 : W * 0.6}" height="${fs1 * 2.2 + lines.length * 30 + 60}" fill="#f7f1e6" fill-opacity=".86" rx="2"/>
    <text x="${W * 0.06}" y="${H * 0.1}" font-size="${fs1}" font-weight="700" letter-spacing="2">PLACEHOLDER</text>
    <text x="${W * 0.06}" y="${H * 0.1 + fs1 * 0.9}" font-size="${fs1 * 0.42}">Owner to supply · ${esc(name)} · frame ${String(i).padStart(4, "0")} / ${count}</text>
    ${lines.map((l, k) => `<text x="${W * 0.06}" y="${H * 0.1 + fs1 * 1.7 + k * 30}" font-size="21" fill-opacity=".85">${esc(l)}</text>`).join("\n    ")}
  </g>
  <rect x="${W * 0.06}" y="${H - 40}" width="${(W * 0.88 * t).toFixed(1)}" height="6" fill="#5e1a1a"/>
</svg>`;
}

const t0 = Date.now();
for (const size of ["desktop", "mobile"]) {
  const { dir, w, h } = seq[size];
  const out = path.join("public", dir);
  fs.mkdirSync(out, { recursive: true });
  for (let i = 1; i <= count; i++) {
    const file = path.join(out, `${String(i).padStart(seq.pad, "0")}.${seq.ext}`);
    await sharp(Buffer.from(svg(w, h, i))).webp({ quality: 60, effort: 4 }).toFile(file);
  }
  const bytes = fs.readdirSync(out).reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0);
  console.log(`${size}: ${count} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB → ${out}`);
}
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s. Manifest status stays "owner-to-supply" until real frames replace these.`);
