import { ogCard, ogSize } from "@/components/page/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Rajasthan, Slowly: private journeys across Rajasthan";

export default function Image() {
  return ogCard({ kicker: "Private journeys across Rajasthan", title: "Rajasthan, Slowly.", line: "Forts, lakes and desert, planned around you." });
}
