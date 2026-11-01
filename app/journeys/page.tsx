import type { Metadata } from "next";
import { JourneysIndex } from "@/components/detail/JourneysIndex";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Private journeys through Rajasthan",
  description: "Private Rajasthan itineraries from six days to two weeks: Jaipur, Udaipur, Jodhpur, Jaisalmer and the Thar. Filter by length, region and style.",
  path: "/journeys",
});

export default function JourneysPage() {
  return <JourneysIndex />;
}
