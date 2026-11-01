/**
 * Image and video credits (§8.3). Every stock or Wikimedia Commons file must be listed here
 * with its licence. The /credits page renders this list.
 */
export const credits: { file: string; author: string; source: string; sourceUrl: string; licence: string; licenceUrl?: string }[] = [];

/** Data and generated imagery (not photographs). */
export const dataCredits: { what: string; source: string; sourceUrl: string; licence: string }[] = [
  { what: "Rajasthan state boundary (maps and the 3D relief), simplified to 300 points", source: "Natural Earth, Admin 1 – States, Provinces (1:10m)", sourceUrl: "https://www.naturalearthdata.com/", licence: "Public domain" },
  { what: "Thar dunes night frame (Starlight)", source: "Procedurally rendered for this site (scripts/render-dunes.mjs); an illustration, not photography", sourceUrl: "", licence: "Own work" },
  { what: "Aravalli relief on the Golden Trail map", source: "Stylised procedural ridge (not survey elevation data)", sourceUrl: "", licence: "Own work" },
];
