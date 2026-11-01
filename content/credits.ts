/**
 * Image and video credits (§8.3). Every stock or Wikimedia Commons file must be listed here
 * with its licence. The /credits page renders this list.
 */
export const credits: { file: string; author: string; source: string; sourceUrl: string; licence: string; licenceUrl?: string }[] = [
  {
    file: "Nakki Lake, Mount Abu (cropped from a panorama): the Mount Abu card",
    author: "Agg.mohit (Wikivoyage shared)",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mount_Abu_Nakki_lake_panaromic.jpg",
    licence: "Public domain",
  },
  {
    file: "Painted interior, Junagarh Fort, Bikaner: the Bikaner card",
    author: "Gerd Eichmann",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bikaner-Junagarh-63-2018-gje.jpg",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
];

/** Data and generated imagery (not photographs). */
export const dataCredits: { what: string; source: string; sourceUrl: string; licence: string }[] = [
  { what: "India state boundaries (the atlas on the home page), simplified with mapshaper (scripts/build-geo.mjs)", source: "DataMeet India community, India states (Admin2)", sourceUrl: "https://github.com/datameet/maps", licence: "CC BY 4.0" },
  { what: "Relief on the atlas's state maps", source: "Stylised procedural relief following the Aravalli range (lib/geo/relief.ts), not survey elevation data", sourceUrl: "", licence: "Own work" },
  { what: "Rajasthan state boundary (maps and the 3D relief), simplified to 300 points", source: "Natural Earth, Admin 1 – States, Provinces (1:10m)", sourceUrl: "https://www.naturalearthdata.com/", licence: "Public domain" },
  { what: "Thar dunes night frame (Starlight)", source: "Procedurally rendered for this site (scripts/render-dunes.mjs); an illustration, not photography", sourceUrl: "", licence: "Own work" },
  { what: "Aravalli relief on the Golden Trail map", source: "Stylised procedural ridge (not survey elevation data)", sourceUrl: "", licence: "Own work" },
];
