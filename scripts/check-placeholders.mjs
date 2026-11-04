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

// Hard failures (enhancement brief §9): template debt and broken output. Never bypassable, because these
// are bugs rather than missing owner content. Only the visible HTML is checked (scripts are stripped).
const HARD = [
  { re: /\bTODO\b/g, label: "TODO" },
  { re: /\blorem\b/gi, label: "lorem" },
  { re: /Placeholder:/g, label: "Placeholder: (dev-only stand-in leaked)" },
  { re: /\bexample\.com\b/gi, label: "example.com" },
  { re: /\bhref=""/g, label: 'empty href=""' },
];
// ({{ and }} are reported by the owner-placeholder pass below, which ALLOW_PLACEHOLDERS can bypass for previews.)
const exists = (url) => {
  const clean = decodeURIComponent(url.split("?")[0]);
  if (clean.startsWith("/_next/static/")) return fs.existsSync(path.join(dist, "static", clean.slice("/_next/static/".length)));
  if (clean.startsWith("/")) return fs.existsSync(path.join("public", clean));
  return true; // absolute URLs are not checked here
};
const hard = [];
for (const f of files) {
  const visible = fs.readFileSync(f, "utf8").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const page = path.relative(root, f).replace(/\\/g, "/").replace(/\.(html|body)$/, "");
  const problems = new Set();
  for (const { re, label } of HARD) {
    re.lastIndex = 0; // global regexes keep their position between .test() calls
    if (re.test(visible)) problems.add(label);
  }
  // broken images: <img src>, srcset entries and next/image ?url= sources must exist in the build
  for (const m of visible.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const srcs = [...tag.matchAll(/\b(?:src|srcset)="([^"]+)"/gi)].flatMap((s) => s[1].split(",").map((x) => x.trim().split(/\s+/)[0]));
    for (const s of srcs) {
      const u = s.replace(/&amp;/g, "&");
      const target = u.startsWith("/_next/image") ? new URLSearchParams(u.split("?")[1]).get("url") : u;
      if (target && !target.startsWith("data:") && !exists(target)) problems.add(`broken image ${target}`);
    }
  }
  if (problems.size) hard.push({ page, problems });
}
if (hard.length) {
  console.error(`\n[placeholders] ✗ ${hard.length} page(s) contain template debt or broken output:`);
  for (const h of hard) console.error(`  /${h.page === "index" ? "" : h.page}: ${[...h.problems].slice(0, 6).join(", ")}`);
  console.error("\nThese are bugs, not owner content: ALLOW_PLACEHOLDERS does not bypass them.\n");
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
