// Fails the production build if rendered pages still contain owner placeholders (§4).
// Runs after `next build` (see package.json). Bypass with ALLOW_PLACEHOLDERS=true.
import fs from "node:fs";
import path from "node:path";

const dist = process.env.NEXT_DIST_DIR || ".next";
const root = path.join(dist, "server", "app");
const allow = process.env.ALLOW_PLACEHOLDERS === "true";

const PATTERNS = [
  { re: /\{\{[^}<]{1,80}\}\}/g, label: "{{placeholder}}" },
  { re: /Owner to supply/gi, label: "Owner to supply" },
  { re: /site-url-not-set\.invalid/g, label: "NEXT_PUBLIC_SITE_URL not set" },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|body)$/.test(e.name)) out.push(p);
  }
  return out;
}

// Frame sequences still marked "owner-to-supply" in the manifest are PLACEHOLDER frames (§8, §13)
const day = JSON.parse(fs.readFileSync("content/day.json", "utf8"));
const placeholderSeqs = Object.entries(day.frameSequences).filter(([, s]) => s.status === "owner-to-supply").map(([n]) => n);

const files = walk(root);
if (!files.length) {
  console.error(`[placeholders] No rendered pages found in ${root}. Did the build run?`);
  process.exit(1);
}

const report = [];
for (const f of files) {
  // Only the HTML before the RSC payload scripts: what a visitor actually sees.
  const html = fs.readFileSync(f, "utf8");
  const found = new Map();
  for (const { re, label } of PATTERNS) {
    for (const m of html.matchAll(re)) {
      const key = label === "{{placeholder}}" ? m[0] : label;
      found.set(key, (found.get(key) || 0) + 1);
    }
  }
  if (found.size) report.push({ page: path.relative(root, f).replace(/\\/g, "/").replace(/\.(html|body)$/, ""), found });
}

if (placeholderSeqs.length) {
  console.log(`
[placeholders] Placeholder frame sequences (content/day.json status "owner-to-supply"): ${placeholderSeqs.join(", ")}`);
  console.log("  Convert the owner's footage with scripts/video-to-frames.sh, then set status to \"ready\".");
}

if (!report.length && !placeholderSeqs.length) {
  console.log(`[placeholders] ✓ ${files.length} rendered pages, no placeholders left.`);
  process.exit(0);
}

const all = new Set(report.flatMap((r) => [...r.found.keys()]));
console.log(`\n[placeholders] ${report.length} of ${files.length} rendered pages still contain placeholders (${all.size} distinct):`);
for (const r of report) console.log(`  /${r.page === "index" ? "" : r.page}: ${[...r.found.keys()].slice(0, 6).join(", ")}${r.found.size > 6 ? `, +${r.found.size - 6} more` : ""}`);
console.log("\nSee BUSINESS_INFO_REQUIRED.md (npm run placeholders) for where each one lives.");

if (allow) {
  console.warn("\n[placeholders] ALLOW_PLACEHOLDERS=true: build allowed. Do not deploy this to production.\n");
  process.exit(0);
}
console.error("\n[placeholders] ✗ Production build blocked. Fill the placeholders, or set ALLOW_PLACEHOLDERS=true for a preview build.\n");
process.exit(1);
