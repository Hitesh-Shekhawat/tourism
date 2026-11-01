// Writes ASSET_BRIEF.md (every image and video asset, plus the shot list) from content/assets.ts,
// content/imageSources.ts, the frame sequences in content/day.json and the video slots in
// content/homepage.ts.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const assetModule = { exports: {} };
const assetSource = fs.readFileSync("content/assets.ts", "utf8");
const assetJavaScript = ts.transpile(assetSource, { module: ts.ModuleKind.CommonJS });
new Function("exports", assetJavaScript)(assetModule.exports);
const { assets } = assetModule.exports;
const day = JSON.parse(fs.readFileSync("content/day.json", "utf8"));
const homepage = fs.readFileSync("content/homepage.ts", "utf8");
const imageSourcesText = fs.readFileSync("content/imageSources.ts", "utf8");
const rows = Object.entries(assets);
const sourceMap = imageSourcesText.match(/export const imageSources:[\s\S]*?= \{([\s\S]*?)\n\};/);
if (!sourceMap) throw new Error("Could not read the image source map in content/imageSources.ts");
const sourceByKey = new Map([...sourceMap[1].matchAll(/^\s{2}(\w+):\s*([^,\n]+),?$/gm)].map(([, key, value]) => [key, value.trim()]));
const importedFiles = new Map([...imageSourcesText.matchAll(/^import (\w+) from "\.\.\/assets\/([^"]+)";$/gm)].map(([, name, file]) => [name, `assets/${file}`]));
const sourceFor = (key, a) => {
  const mapped = sourceByKey.get(key);
  if (!mapped) return a.src ?? "—";
  if (mapped.startsWith('"')) return mapped.slice(1, -1);
  return importedFiles.get(mapped) ?? mapped;
};
const isSupplied = (key, a) => sourceByKey.has(key) || Boolean(a.src);
const supplied = rows.filter(([key, a]) => isSupplied(key, a)).length;
const bySection = new Map();
for (const [key, a] of rows) {
  if (!bySection.has(a.section)) bySection.set(a.section, []);
  bySection.get(a.section).push([key, a]);
}

/* ── Where each asset key is used: scan the code for the quoted key ─────────────────────────────── */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}
const sources = ["app", "components", "content"].flatMap((d) => walk(d)).filter((f) => f !== "content/assets.ts");
const texts = sources.map((f) => [f, fs.readFileSync(f, "utf8")]);
/** Human labels for the files that render assets. */
const PLACE = [
  [/^components\/homepage\/Hero/, "Home · hero"],
  [/^components\/homepage\/Services/, "Home · why travel with us"],
  [/^components\/homepage\/FinalCta/, "Home · closing band"],
  [/^components\/homepage\//, "Home"],
  [/^components\/story\/chapters\/Intro/, "Story · Intro"],
  [/^components\/story\//, "Story"],
  [/^components\/detail\/DestinationDetail/, "Destination pages"],
  [/^components\/detail\/JourneyDetail/, "Journey pages"],
  [/^components\/tours\//, "Journeys list"],
  [/^app\/destinations\/page/, "Destinations list"],
  [/^app\/experiences\/page/, "Experiences list"],
  [/^app\/experiences\/\[slug\]/, "Experience pages"],
  [/^app\/our-story/, "Our Story"],
  [/^app\/not-found/, "404 page"],
];
const label = (f) => PLACE.find(([r]) => r.test(f))?.[1] ?? f;

/**
 * Where photos held in content files render (content file → field → components that read it). Checked
 * against the components; update it when a component starts or stops rendering one of these fields.
 */
const VIA = {
  "destinations.indexImage": ["Home · destination tiles", "Story · Hours", "Destination pages"],
  "destinations.heroImage": ["Destination pages (hero)", "Destinations list"],
  "experiences.image": ["Home · experiences list", "Story · Ganjifa", "Experiences list", "Experience pages (hero)"],
  "tours.heroImage": ["Home · featured journeys", "Story · tickets", "Journey pages (hero)", "Journey rows (journeys list, destination, experience and related-journey lists)"],
  "tours.gallery": ["Journey pages (gallery)"],
  "home.image": ["Story · Golden Trail"],
  "homepage.image": ["Home · packages"],
  "homepage.items": ["Home · gallery"],
};
// The home page's lead destination uses the first destination's hero; its tiles skip that destination
const destSrc = fs.readFileSync("content/destinations.ts", "utf8");
const firstDestinationHero = destSrc.match(/heroImage:\s*"(\w+)"/)?.[1];
const firstDestinationIndex = destSrc.match(/indexImage:\s*"(\w+)"/)?.[1];

/** Where a key is rendered: named directly in a component, or held in a content field (see VIA). */
const usedIn = (key) => {
  const quoted = new RegExp(`["'\`]${key}["'\`]`);
  const places = new Set();
  for (const [f, t] of texts) {
    if (!quoted.test(t)) continue;
    if (!f.startsWith("content/")) {
      places.add(label(f));
      continue;
    }
    const field = t.split("\n").find((l) => quoted.test(l))?.match(new RegExp(`(\\w+):\\s*\\[?[^:]*["'\`]${key}["'\`]`))?.[1];
    const mod = f.replace(/^content\//, "").replace(/\.ts$/, "").replace(/^tours\/.*/, "tours");
    for (const p of VIA[`${mod}.${field}`] ?? [`${f} → ${field} (add to VIA in scripts/asset-brief.mjs)`]) places.add(p);
  }
  if (key === firstDestinationHero) places.add("Home · lead destination");
  if (key === firstDestinationIndex) places.delete("Home · destination tiles");
  return [...places].join(", ") || "not referenced";
};

/* ── Video slots ────────────────────────────────────────────────────────────────────────────────── */
const heroVideoSet = !/heroVideo:[^=]+=\s*\{\s*\}/.test(homepage);
const storiesEmpty = /travellerStories: TravellerStory\[\] = \[\]/.test(homepage);
const seqs = Object.entries(day.frameSequences);
const videos = [
  ...seqs.map(([name, q]) => ({
    name: name === "hero-aerial" ? "Hero drone clip → `hero-aerial` frame sequence" : `\`${name}\` frame sequence`,
    where: name === "hero-aerial" ? "Story · opening (through the jharokha)" : "Story · Into the Thar, and the Starlight background",
    format: `${q.count} WebP frames; desktop ${q.desktop.w}×${q.desktop.h}, mobile ${q.mobile.w}×${q.mobile.h}`,
    status: q.status === "ready" ? (/procedural/i.test(q.credit) ? "✓ ready (generated)" : "✓ ready") : "**needed**, blocks launch",
    brief: name === "hero-aerial" ? "VIDEO_BRIEF.md" : q.credit,
  })),
  {
    name: "Home hero loop (`heroVideo`)",
    where: "Home · hero background",
    format: "10–20 s loop, H.264 MP4 ≤ 6 MB (+ optional WebM); portrait 720p MP4 ≤ 2.5 MB for phones",
    status: heroVideoSet ? "✓ supplied" : "optional: the `homeHero` photo shows until supplied",
    brief: "Same subject as `homeHero` (Lake Pichola at dawn); that photo is its poster",
  },
  {
    name: "Guest video stories (`travellerStories`)",
    where: "Home · Traveller stories",
    format: "MP4 (H.264), portrait 9:16 or landscape 16:9, ≤ 60 s; a poster photo registered in `content/assets.ts`",
    status: storiesEmpty ? "optional: section hidden until real stories exist" : "✓ supplied",
    brief: "Real guests only, with written permission for name, face and words",
  },
];

/* ── Assets made in code (no action needed) ─────────────────────────────────────────────────────── */
const generated = [
  ["Social share images (Open Graph)", "`app/opengraph-image.tsx`, `app/journeys/[slug]/opengraph-image.tsx`, `app/destinations/[slug]/opengraph-image.tsx`", "Rendered at build from text; no photo needed"],
  ["Favicon", "`app/icon.svg`", "The jharokha arch mark"],
  ["Jharokha arch masks", "`public/svg/jharokha-arch-4x5.svg`, `public/svg/jharokha-arch-portrait.svg`", "`npm run arch:svg`"],
  ["Dunes day cycle (150 frames × 2 sizes)", "`public/frames/dunes/`", "`npm run frames:dunes` (procedural, not photography)"],
  ["Story 3D scenes (stone, paper map, sand, stars)", "`components/story/gl/`", "Procedural textures in code; one real image: the last dunes frame"],
  ["Logo", "`components/layout/Wordmark.tsx`", "Typographic wordmark + arch until the owner supplies a logo"],
];

const frameSection = () => {
  let out = "";
  for (const [name, q] of seqs) {
    const status = q.status === "ready" ? "✓ ready" : "**owner to supply** (placeholder frames are in place; the production build fails until they are replaced)";
    out += `### \`${name}\` · ${status}\n\n`;
    out += `- **Frames:** ${q.count} × ${q.ext}; desktop ${q.desktop.w}×${q.desktop.h} in \`public${q.desktop.dir}/\`, mobile ${q.mobile.w}×${q.mobile.h} in \`public${q.mobile.dir}/\`\n`;
    out += `- **Source:** ${q.credit}\n`;
    if (q.hours) out += `- **Hours:** ${q.hours}\n`;
    if (q.brief) out += `- **Brief:** ${q.brief}\n`;
    out += "\n";
  }
  return out;
};

const needVideo = videos.filter((v) => v.status.includes("needed")).length;
let md = `# Asset brief: every image and video

Generated by \`npm run assets:brief\` from \`content/assets.ts\`, \`content/imageSources.ts\`, \`content/day.json\` and \`content/homepage.ts\`. Don't edit by hand: change those files and re-run.

## At a glance

| | Total | Supplied | Still needed |
|---|---|---|---|
| Photos (\`content/assets.ts\`) | ${rows.length} | ${supplied} | ${rows.length - supplied} |
| Video (footage and frame sequences) | ${videos.length} | ${videos.filter((v) => v.status.startsWith("✓")).length} | ${needVideo} required, ${videos.filter((v) => v.status.startsWith("optional")).length} optional |
| Made in code (no action) | ${generated.length} | ${generated.length} | 0 |

Until a photo is supplied, the site shows a dune-coloured placeholder at the exact ratio with the filename and brief, so the layout is already final. The production build fails while any placeholder or placeholder footage remains.

## How to supply a photo

1. Export with **one consistent warm grade** across every photo (the same grade \`scripts/video-to-frames.sh\` applies to footage): slight warmth, lifted blacks, no heavy saturation. Apply it during export, never with CSS filters.
2. Keep the original in \`assets/\` and add a static import plus a key mapping in \`content/imageSources.ts\`; this lets \`next/image\` optimize the local file without copying it. For files already in \`public/images/\`, keep the public URL and actual dimensions in \`content/assets.ts\`.
3. Use a source that matches the actual subject and composition. Update the asset's alt text in \`content/assets.ts\` when its registered brief differs.
4. Stock only after a human picks it. **No identifiable people** presented as guests. Commons/CC files need attribution in \`content/credits.ts\` (shown on /credits). Self-host everything.
5. Never present stock as the company's own trips, guests or hotels.

## How to supply video

- **Hero drone clip:** follow VIDEO_BRIEF.md, then \`scripts/video-to-frames.sh <clip> hero-aerial 150\` and set its status to \`"ready"\` in \`content/day.json\`.
- **Home hero loop:** put the files in \`public/video/\` and set \`heroVideo\` in \`content/homepage.ts\`, e.g. \`{ src: "/video/home-hero.mp4", srcWebm: "/video/home-hero.webm", srcMobile: "/video/home-hero-portrait.mp4" }\`. It never loads under reduced motion or Save-Data, and is muted, looped and paused off screen.
- **Guest stories:** files in \`public/video/stories/\`, a poster photo added to \`content/assets.ts\`, then an entry in \`travellerStories\` in \`content/homepage.ts\`.

---

## All video assets

| Asset | Used on | Format | Status | Brief / source |
|---|---|---|---|---|
${videos.map((v) => `| ${v.name} | ${v.where} | ${v.format} | ${v.status} | ${v.brief} |`).join("\n")}

## All image assets

${rows.length} photo slots. The detailed brief for each (subject, light, mood, alt text) follows in the shot list below.

| # | Key | Filename | Ratio · min size | Used on | Rendered source | Status |
|---|---|---|---|---|---|---|
${rows.map(([key, a], i) => `| ${i + 1} | \`${key}\` | \`${a.file}\` | ${a.ratio} · ${a.minRes} | ${usedIn(key)} | ${sourceFor(key, a)} | ${isSupplied(key, a) ? "✓ supplied" : "needed"} |`).join("\n")}

### Made in code (no action needed)

| Asset | Where | How |
|---|---|---|
${generated.map((g) => `| ${g.join(" | ")} |`).join("\n")}

---

## Shot list: frame sequences (scroll-scrubbed)

${frameSection()}`;

for (const [section, list] of bySection) {
  md += `## ${section}\n\n| Filename | Ratio · min size | Subject | Time of day | Mood | Alt text | Status |\n|---|---|---|---|---|---|---|\n`;
  for (const [key, a] of list) md += `| \`${a.file}\` | ${a.ratio} · ${a.minRes} | ${a.subject} | ${a.time} | ${a.mood} | ${a.alt} | ${isSupplied(key, a) ? "✓ supplied" : "needed"} |\n`;
  md += "\n";
}

md += `## Rules

- **Story photos (/story) must match their chapter's hour** (the section names give it): the story is one day, 05:30 to 21:30, and a midday photo in a dusk chapter breaks the idea. Home photos follow the light named in each brief.
- Prefer a distinct photo for each section; reuse only where the same place or experience is the best semantic fit.
- Orientation follows the ratio: 4:5 portrait, 3:2 landscape, 21:9 cinematic, 16:9 wide.
- Arch-masked images (intro, sundial cards, trail cards, destination pages) lose their top corners, and Ganjifa photos are cropped to a circle: keep the subject centred.
- Home hero and closing band carry text over a dark shade: keep the bottom-left (hero) and the top third (closing) calm.
`;

fs.writeFileSync("ASSET_BRIEF.md", md);
const unused = rows.filter(([k]) => usedIn(k) === "not referenced").map(([k]) => k);
console.log(`ASSET_BRIEF.md: ${rows.length} photos (${supplied} supplied) across ${bySection.size} sections, ${videos.length} video assets, ${generated.length} made in code.${unused.length ? ` Not referenced anywhere: ${unused.join(", ")}` : ""}`);
