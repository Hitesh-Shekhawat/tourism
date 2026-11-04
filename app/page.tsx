import type { Metadata } from "next";
import { IndiaExplorer } from "@/components/explorer/IndiaExplorer";
import { FeaturedTours, visibleJourneys } from "@/components/homepage/FeaturedTours";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { LookingFor } from "@/components/homepage/LookingFor";
import { Memories } from "@/components/homepage/Memories";
import { Services } from "@/components/homepage/Services";
import { TravellerStories } from "@/components/homepage/TravellerStories";
import { TrendingDestinations } from "@/components/homepage/TrendingDestinations";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { hasStories, memories, services } from "@/content/homepage";
import { canShow, showPlaceholders } from "@/lib/content-flags";
import { pageMeta, travelAgencyLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: `Private Rajasthan Tours & Journeys · ${business.brandName}`,
    description: "Private journeys through Rajasthan's forts, lakes and desert: Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar and Mount Abu, planned around your dates and pace.",
    path: "/",
  }),
  title: { absolute: `Private Rajasthan Tours & Journeys · ${business.brandName}` },
};

/**
 * The home page, read as one story (enhancement brief §3): arrive (hero) → discover (trending) →
 * explore (by experience) → interact (atlas) → feel (memories) → choose (journeys) → trust (stories,
 * why us) → enquire (CTA) → footer. Sections without real content are not rendered in production, and
 * the catalogue numbers count only the sections that are on the page.
 */
export default function Home() {
  const on = {
    memories: memories.some((m) => canShow(m.ready)),
    journeys: visibleJourneys().length > 0,
    stories: hasStories || showPlaceholders,
    why: services.some((s) => s.offered !== false && canShow(s.offered === true)),
  };
  let k = 0;
  const n = () => String(++k).padStart(2, "0");
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <HomeMotion />
      <Hero />
      <TrendingDestinations n={n()} />
      <LookingFor n={n()} />
      <IndiaExplorer n={n()} />
      {on.memories && <Memories n={n()} />}
      {on.journeys && <FeaturedTours n={n()} />}
      {on.stories && <TravellerStories n={n()} />}
      {on.why && <Services n={n()} />}
      <FinalCta n={n()} />
    </>
  );
}
