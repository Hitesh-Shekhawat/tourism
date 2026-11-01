import type { Metadata } from "next";
import { Discover } from "@/components/homepage/Discover";
import { FeaturedTours } from "@/components/homepage/FeaturedTours";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Gallery } from "@/components/homepage/Gallery";
import { Hero } from "@/components/homepage/Hero";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { Packages } from "@/components/homepage/Packages";
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
 * The home page (v4): hero + quick enquiry, featured journeys (horizontal on desktop), destinations and
 * experiences, services, packages, traveller stories (once real), gallery and the closing enquiry.
 * The original scroll story lives on at /story. All text is server-rendered; motion is progressive.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <HomeMotion />
      <Hero />
      <FeaturedTours />
      <Discover />
      <Services />
      <Packages />
      <TravellerStories />
      <Gallery />
      <FinalCta />
    </>
  );
}
