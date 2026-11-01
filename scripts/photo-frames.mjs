// Builds a frame sequence from one still photo in assets/: a slow, level push-in (Ken Burns), so the
// scroll scrub reads as a camera move until real footage replaces it.
//
//   node scripts/photo-frames.mjs hero-aerial assets/Amer_Fort_at_sunrise_83c8495c.jpg
//   node scripts/photo-frames.mjs thar assets/Camel_trek_across_sand_dunes_74c41e37.jpg --zoom=1.2,1.5 --focus=0.6,0.42 --rise=0 --dusk=0.35
//
// Options: --zoom=start,end   crop zoom over the sequence (1 = the whole photo)
//          --focus=x,y        crop centre as a fraction of the photo (mobile uses x for its narrow crop too)
//          --rise=n           how far the centre drifts up over the sequence (fraction of the photo height)
//          --dusk=t           from t (0–1) on, grade the frames towards blue-hour night
//
// Writes public/frames/<name>/{desktop,mobile}/0001.webp … in the sizes from content/day.json.
// Then bump the sequence's "rev" there: frames are cached for a week under the same file names.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , name, src, ...flags] = process.argv;
if (!name || !src) {
  console.error("usage: node scripts/photo-frames.mjs <sequence> <photo> [--zoom=a,b] [--focus=x,y] [--rise=n] [--dusk=t]");
  process.exit(1);
}
const opt = Object.fromEntries(flags.map((f) => f.replace(/^--/, "").split("=")));
const [zoomFrom, zoomTo] = (opt.zoom ?? "1,1.35").split(",").map(Number);
const [fx, fy] = (opt.focus ?? "0.5,0.52").split(",").map(Number);
const rise = Number(opt.rise ?? 0.06);
const dusk = opt.dusk === undefined ? null : Number(opt.dusk);

const day = JSON.parse(fs.readFileSync(new URL("../content/day.json", import.meta.url), "utf8"));
const seq = day.frameSequences[name];
if (!seq) throw new Error(`No sequence "${name}" in content/day.json`);

const input = fs.readFileSync(src);
const { width: SW, height: SH } = await sharp(input).metadata();

for (const size of ["desktop", "mobile"]) {
  const { dir, w: W, h: H } = seq[size];
  const out = path.join("public", dir);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  // the largest crop of the target ratio that fits the photo
  const r = W / H;
  const baseW = Math.min(SW, SH * r);
  const baseH = baseW / r;
  for (let i = 1; i <= seq.count; i++) {
    const t = (i - 1) / (seq.count - 1);
    const e = t * t * (3 - 2 * t) * 0.4 + t * 0.6; // gentle ease, mostly linear for an even scrub
    const z = zoomFrom + (zoomTo - zoomFrom) * e;
    const cw = baseW / z;
    const ch = baseH / z;
    const cx = SW * fx;
    const cy = SH * (fy - rise * e);
    const left = Math.round(Math.max(0, Math.min(SW - cw, cx - cw / 2)));
    const top = Math.round(Math.max(0, Math.min(SH - ch, cy - ch / 2)));
    let img = sharp(input)
      .extract({ left, top, width: Math.round(cw), height: Math.round(ch) })
      .resize(W, H, { kernel: "lanczos3" });
    if (dusk !== null && t > dusk) {
      // golden hour → blue hour: darken and cool with a multiplied night blue
      const k = Math.min(1, (t - dusk) / (1 - dusk));
      const a = k * k * (3 - 2 * k) * 0.72;
      img = sharp(await img.toBuffer()).composite([{ input: { create: { width: W, height: H, channels: 4, background: { r: 38, g: 48, b: 92, alpha: a } } }, blend: "multiply" }]);
    }
    await img.webp({ quality: 62, effort: 5 }).toFile(path.join(out, `${String(i).padStart(seq.pad, "0")}.${seq.ext}`));
  }
  console.log(`[photo-frames] ${name}/${size}: ${seq.count} frames at ${W}×${H}`);
}
