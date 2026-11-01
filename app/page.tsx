import type { Metadata } from "next";
import { IndiaExplorer } from "@/components/explorer/IndiaExplorer";
import { FeaturedTours } from "@/components/homepage/FeaturedTours";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Gallery } from "@/components/homepage/Gallery";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { LookingFor } from "@/components/homepage/LookingFor";
import { Packages } from "@/components/homepage/Packages";
import { TrendingPlaces } from "@/components/homepage/TrendingPlaces";
import { Services } from "@/components/homepage/Services";
import { TravellerStories } from "@/components/homepage/TravellerStories";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { pageMeta, travelAgencyLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: `Private Rajasthan Tours & Journeys · ${business.brandName}`,
    description: "Private journeys through Rajasthan's forts, lakes and desert: Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar and Bikaner, planned around your dates and pace.",
    path: "/",
  }),
  title: { absolute: `Private Rajasthan Tours & Journeys · ${business.brandName}` },
};

/**
 * The home page (v5, the atlas): trending places, "what are you looking for?", the interactive 3D atlas
 * (India → state → place → itinerary), then featured journeys, services, packages, traveller stories
 * (once real), gallery and the closing enquiry. The v4 Hero and Discover sections are kept in
 * components/homepage but no longer placed. The scroll story lives on at /story.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <HomeMotion />
      <TrendingPlaces />
      <LookingFor />
      <IndiaExplorer />
      <FeaturedTours />
      <Services />
      <Packages />
      <TravellerStories />
      <Gallery />
      <FinalCta />
    </>
  );
}
