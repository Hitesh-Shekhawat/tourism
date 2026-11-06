import type { AssetKey } from "./assets";

/**
 * The state page (/explore/[state]): the places worth seeing in and around each city on the atlas,
 * keyed by place id (content/explorer.ts). Each sight has a photo slot; slots without a supplied photo
 * show the usual placeholder in development and are left out of production (see lib/content-flags.ts),
 * so add the photo in content/imageSources.ts and the sight appears.
 */
export type Sight = {
  name: string;
  /** Short kind + date / distance line, e.g. "Fort-palace · 1592". */
  kind: string;
  text: string;
  image: AssetKey;
};

export const sights: Record<string, Sight[]> = {
  jaipur: [
    { name: "Amer Fort", kind: "Fort-palace · from 1592", text: "Raja Man Singh's ridge-top palace above Maota Lake: mirrored halls, painted gates and long rampart views.", image: "itinJaipurHero" },
    { name: "Hawa Mahal", kind: "Palace of Winds · 1799", text: "A honeycomb of latticed windows, built so the women of the court could watch the street unseen.", image: "idxJaipur" },
    { name: "City Palace", kind: "Royal residence · 1727", text: "Courtyards, armouries and the four painted seasonal gates of Pritam Niwas Chowk.", image: "trailJaipur" },
    { name: "Jal Mahal", kind: "Water palace · 18th century", text: "A sandstone palace that seems to float on Man Sagar Lake; best from the shore near sunset.", image: "sightJalMahal" },
    { name: "Jantar Mantar", kind: "Observatory · 1734", text: "Sawai Jai Singh II's giant stone instruments, among them the world's largest stone sundial.", image: "sightJantarMantar" },
    { name: "Nahargarh Fort", kind: "Ridge fort · 1734", text: "On the Aravalli edge above the old city: the view of Jaipur lighting up at dusk.", image: "sightNahargarh" },
    { name: "Chand Baori, Abhaneri", kind: "Stepwell · 9th century · 95 km", text: "Thousands of narrow steps falling in a perfect geometry to the water, an easy detour on the Agra road.", image: "expStepwell" },
    { name: "Bagru", kind: "Craft village · 30 km", text: "Printers' families pressing carved wooden blocks onto cotton with natural dyes.", image: "expBagru" },
  ],
  udaipur: [
    { name: "City Palace", kind: "Palace complex · from 1559", text: "Four centuries of Mewar palaces strung along Pichola's eastern shore.", image: "idxUdaipur" },
    { name: "Lake Pichola", kind: "Lake · 14th century", text: "The heart of the city, and at its best from a boat at first light.", image: "expPichola" },
    { name: "Lake Palace", kind: "Island palace · 1740s", text: "Jag Niwas, the white summer palace that fills its whole island.", image: "sightLakePalace" },
    { name: "Jag Mandir", kind: "Island palace · 17th century", text: "Pavilions and stone elephants on the lake's southern island; lovely at sunset.", image: "sightJagMandir" },
    { name: "Bagore ki Haveli", kind: "Haveli museum · 18th century", text: "A minister's mansion on Gangaur Ghat, with folk dance in its courtyard each evening.", image: "sightBagore" },
    { name: "Saheliyon ki Bari", kind: "Garden · 18th century", text: "Fountains, lotus pools and marble elephants in the Garden of the Maidens.", image: "sightSaheliyon" },
    { name: "Sajjangarh", kind: "Monsoon Palace · 1884", text: "A hilltop palace west of the city, built to watch the monsoon clouds roll in.", image: "sightSajjangarh" },
  ],
  jaisalmer: [
    { name: "Jaisalmer Fort", kind: "Sonar Qila · 1156", text: "A living fort of golden sandstone: homes, lanes and Jain temples still inside its walls.", image: "placeJaisalmer" },
    { name: "Patwon ki Haveli", kind: "Merchant havelis · from 1805", text: "Five houses of carved stone balconies, as fine as lace, built by a family of traders.", image: "sightPatwon" },
    { name: "Gadisar Lake", kind: "Reservoir · 14th century", text: "Ghats, shrines and a carved gateway around the town's old water supply.", image: "sightGadisar" },
    { name: "Sam Sand Dunes", kind: "The Thar · 40 km west", text: "Rolling dunes at the edge of the desert, by camel as the sun goes down.", image: "galCamel" },
    { name: "Desert camp", kind: "A night in the Thar", text: "Lantern-lit tents, folk music and a sky with almost no light in it.", image: "galCamp" },
    { name: "Kuldhara", kind: "Abandoned village · 18 km", text: "Roofless stone houses left empty, the story goes, in a single night.", image: "sightKuldhara" },
    { name: "Bada Bagh", kind: "Royal cenotaphs", text: "Rows of carved chhatris on a low rise, glowing at sunset.", image: "sightBadaBagh" },
  ],
  jodhpur: [
    { name: "Mehrangarh Fort", kind: "Fort · 1459", text: "One of India's largest forts, rising sheer from its rock above the city.", image: "trailJodhpur" },
    { name: "The Blue City", kind: "Old city · Brahmpuri", text: "Indigo-washed houses climbing toward the fort walls; walk it in the morning.", image: "idxJodhpur" },
    { name: "Jaswant Thada", kind: "Marble cenotaph · 1899", text: "A white marble memorial thin enough to glow in the sun, beside a quiet lake.", image: "sightJaswantThada" },
    { name: "Umaid Bhawan Palace", kind: "Art deco palace · 1943", text: "Part royal home, part hotel, part museum, on Chittar Hill.", image: "sightUmaidBhawan" },
    { name: "Clock Tower & Sardar Market", kind: "Bazaar · early 1900s", text: "Spices, textiles and silver in the old market around the Ghanta Ghar.", image: "sightClockTower" },
    { name: "Mandore", kind: "Gardens & cenotaphs · 9 km", text: "The old Marwar capital, with temple-like memorials to its rulers.", image: "sightMandore" },
  ],
  pushkar: [
    { name: "Pushkar Lake", kind: "Sacred lake · 52 ghats", text: "White temples and ghats stepping down into one of Hinduism's holiest lakes.", image: "placePushkar" },
    { name: "Evening aarti", kind: "On the ghats · at dusk", text: "Bells, chants and lamps set out on the water as the light goes.", image: "expAarti" },
    { name: "Brahma Temple", kind: "Temple · 14th century", text: "One of the very few temples in India dedicated to Brahma.", image: "sightBrahmaTemple" },
    { name: "Savitri Temple", kind: "Hilltop temple", text: "A climb or a ropeway to the top, for sunrise over the town and the desert.", image: "sightSavitri" },
    { name: "Pushkar Fair", kind: "Kartik fair · Oct–Nov", text: "Camel traders, pilgrims and music fill the dunes for a week each autumn.", image: "sightPushkarFair" },
  ],
  "mount-abu": [
    { name: "Nakki Lake", kind: "Hill lake", text: "A lake among the Aravalli hills, for boating and slow walks in cool air.", image: "placeMountAbu" },
    { name: "Dilwara Temples", kind: "Jain temples · 11th–13th c.", text: "White marble carved so finely the ceilings look like lace.", image: "sightDilwara" },
    { name: "Guru Shikhar", kind: "Peak · 1,722 m", text: "The highest point of the Aravallis, with a small temple at the summit.", image: "sightGuruShikhar" },
    { name: "Sunset Point", kind: "Viewpoint", text: "Where the hills fall away to the plains, busiest and loveliest at dusk.", image: "sightSunsetPoint" },
    { name: "Achalgarh", kind: "Fort & Shiva temple", text: "A ruined hill fort above the Achaleshwar Mahadev temple.", image: "sightAchalgarh" },
  ],
  bikaner: [
    { name: "Junagarh Fort", kind: "Fort · 1589–1594", text: "Built on the plain, not a hill, with some of Rajasthan's finest painted rooms.", image: "placeBikaner" },
    { name: "Karni Mata Temple", kind: "Temple · Deshnoke, 30 km", text: "Silver doors and the thousands of sacred rats that live in the temple.", image: "sightKarniMata" },
    { name: "Rampuria Havelis", kind: "Merchant havelis", text: "Red sandstone mansions carved by the city's trading families.", image: "sightRampuria" },
    { name: "Lalgarh Palace", kind: "Palace · 1902–1926", text: "Red sandstone, lattice screens and a museum of the royal family.", image: "sightLalgarh" },
    { name: "Camel research farm", kind: "Breeding centre · 8 km", text: "The national camel centre: calves, a museum and camel-milk ice cream.", image: "sightCamelFarm" },
  ],
};

export const sightsFor = (placeId: string) => sights[placeId] ?? [];
