// Builds the explorer's map data from DataMeet's state boundaries (CC BY 4.0, see content/credits.ts).
//
//   1. Download States/Admin2.{shp,dbf,shx,prj} from https://github.com/datameet/maps into a folder
//   2. node scripts/build-geo.mjs <folder>/Admin2.shp
//
// Writes public/geo/india-states.json (every state, light: the India view) and
// public/geo/states/<id>.json (one state, detailed: loaded only when that state is opened).
// Needs mapshaper (fetched through npx). Feature properties: { id, name }.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/build-geo.mjs <path to Admin2.shp>");
  process.exit(1);
}
const out = path.join("public", "geo");
const statesDir = path.join(out, "states");
fs.rmSync(statesDir, { recursive: true, force: true });
fs.mkdirSync(statesDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "geo-"));

const ms = (args) => execFileSync("npx", ["-y", "mapshaper@0.6", ...args], { stdio: "inherit", shell: process.platform === "win32" });
const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
const tidy = (fc) => ({
  type: "FeatureCollection",
  features: fc.features.filter((f) => f.geometry).map((f) => ({ type: "Feature", properties: { id: slug(f.properties.ST_NM), name: f.properties.ST_NM.replace(/&/g, "and") }, geometry: f.geometry })),
});

// India view: about 1.2% of the vertices, shapes kept, specks of islands dropped
const india = path.join(tmp, "india.json");
ms([src, "-simplify", "1.2%", "weighted", "keep-shapes", "-filter-islands", "min-area=10km2", "-o", india, "format=geojson", "precision=0.001"]);
fs.writeFileSync(path.join(out, "india-states.json"), JSON.stringify(tidy(JSON.parse(fs.readFileSync(india, "utf8")))));

// State views: about 10% of the vertices, one file per state
const all = path.join(tmp, "states.json");
ms([src, "-simplify", "10%", "weighted", "keep-shapes", "-filter-islands", "min-area=4km2", "-o", all, "format=geojson", "precision=0.0005"]);
for (const f of tidy(JSON.parse(fs.readFileSync(all, "utf8"))).features) {
  fs.writeFileSync(path.join(statesDir, `${f.properties.id}.json`), JSON.stringify({ type: "FeatureCollection", features: [f] }));
}
fs.rmSync(tmp, { recursive: true, force: true });

const kb = (p) => `${(fs.statSync(p).size / 1024).toFixed(0)} KB`;
for (const f of fs.readdirSync(statesDir)) console.log(`[geo] states/${f}: ${kb(path.join(statesDir, f))}`);
console.log(`[geo] india-states.json: ${kb(path.join(out, "india-states.json"))}`);
