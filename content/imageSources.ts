import type { StaticImageData } from "next/image";
import type { AssetKey } from "./assets";

import amerFortMorning from "../assets/Amer_Fort_at_sunrise_83c8495c.jpg";
import amerFortRamparts from "../assets/Amer_Fort_ramparts_at_dawn_2515b03f.jpg";
import artisanPrinting from "../assets/Artisan_printing_fabric_with_dye_9402da63.jpg";
import camelTrek from "../assets/Camel_trek_across_sand_dunes_74c41e37.jpg";
import carvedBalconies from "../assets/Carved_marble_balconies_overlook…_4e926709.jpg";
import chandBaori from "../assets/Chand_Baori_stepwell_stone_steps_d4494ebb.jpg";
import amerCorridor from "../assets/Corridor_inside_Amer_Fort_19c6c186.jpg";
import handBlockPrinting from "../assets/Hand_block_printing_cotton_cloth_112f3abd.jpg";
import jaipurCourtyard from "../assets/Historic_courtyard_at_Jaipur_palace_7e048123.jpg";
import pushkarLamps from "../assets/Lamps_floating_on_water_e4d1fd6a.jpg";
import tharCamp from "../assets/Lanterns_illuminate_desert_tents…_f7f7dd7d.jpg";
import jodhpurSteps from "../assets/Looking_down_stone_steps_af8f87f3.jpg";
import mehrangarh from "../assets/Mehrangarh_Fort_overlooking_Jodhpur_0922683f.jpg";
import udaipurPalaces from "../assets/Palaces_reflecting_on_Lake_Pichola_a7868802.jpg";
import peacockGate from "../assets/Peacock_gate_courtyard_at_palace_30e72e41.jpg";
import udaipurCityPalace from "../assets/Udaipur_City_Palace_overlooking_…_23c33c31.jpg";
import udaipurBoat from "../assets/Wooden_boat_gliding_on_lake_a9e14c09.jpg";
import hawaMahal from "../assets/Hawa_Mahal_facade_in_Jaipur_bcf5064a.jpg";
import picholaDawn from "../assets/Dawn_view_of_Lake_Pichola_44d2a75d.jpg";
import jaisalmerWalls from "../assets/Jaisalmer_Fort_walls_rising_ac9f32da.jpg";
import pushkarGhats from "../assets/Pushkar_Lake_temples_and_ghats_61400b8e.jpg";
import jodhpurLane from "../assets/Alleyway_in_Jodhpur_old_city_26158c32.jpg";
// Wikimedia Commons (credited in content/credits.ts)
import nakkiLake from "../assets/Nakki_Lake_Mount_Abu_commons.jpg";
import junagarhInterior from "../assets/Junagarh_Fort_painted_interior_commons.jpg";

type ImageSource = string | StaticImageData;

export const imageSources: Partial<Record<AssetKey, ImageSource>> = {
  homeHero: "/images/home-hero-jal-mahal-aerial.jpg",
  homeFinal: mehrangarh,
  introArch: amerCorridor,
  introDetail: handBlockPrinting,
  idxJaipur: "/images/dest-index-jaipur-hawa-mahal-facade.jpg",
  idxUdaipur: udaipurCityPalace,
  idxJaisalmer: "/images/dest-index-jaisalmer-fort-walls.jpg",
  idxJodhpur: "/images/dest-index-jodhpur-blue-lane.jpg",
  idxPushkar: "/images/dest-index-pushkar-ghats.jpg",
  trailJaipur: peacockGate,
  trailAmber: amerFortRamparts,
  trailUdaipur: udaipurPalaces,
  trailJodhpur: mehrangarh,
  trailJaisalmer: camelTrek,
  expPichola: udaipurBoat,
  expThar: tharCamp,
  expBagru: artisanPrinting,
  expBlueCity: jodhpurSteps,
  expAarti: pushkarLamps,
  expStepwell: chandBaori,
  tourGoldenTrail: "/images/dest-index-jaisalmer-fort-walls.jpg",
  tourGoldenTrailG1: amerCorridor,
  tourGoldenTrailG2: jaipurCourtyard,
  tourLakesForts: carvedBalconies,
  tourLakesFortsG1: artisanPrinting,
  tourLakesFortsG2: jaipurCourtyard,
  tourDesert: camelTrek,
  tourDesertG1: "/images/dest-index-jaisalmer-fort-walls.jpg",
  tourDesertG2: tharCamp,
  destJaipur: amerFortRamparts,
  destUdaipur: udaipurPalaces,
  destJaisalmer: camelTrek,
  destJodhpur: mehrangarh,
  destPushkar: pushkarLamps,
  pkgWeekend: amerFortMorning,
  pkgFamily: jaipurCourtyard,
  pkgCouple: udaipurPalaces,
  pkgHeritage: amerCorridor,
  pkgDesert: tharCamp,
  galFortGate: peacockGate,
  galPalace: jaipurCourtyard,
  galCamp: tharCamp,
  galCamel: camelTrek,
  placeJaipur: hawaMahal,
  placeUdaipur: picholaDawn,
  placeJaisalmer: jaisalmerWalls,
  placeJodhpur: jodhpurLane,
  placePushkar: pushkarGhats,
  placeMountAbu: nakkiLake,
  placeBikaner: junagarhInterior,
  itinJaipurHero: amerFortMorning,
  itinUdaipurHero: udaipurPalaces,
};

export const imagePositions: Partial<Record<AssetKey, string>> = {
  expAarti: "38% center",
  trailJaisalmer: "76% center",
  tourDesert: "62% center",
  placeMountAbu: "25% 20%",
};
