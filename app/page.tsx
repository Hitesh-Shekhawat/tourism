import type { Metadata } from "next";
import { FeaturedTours, visibleJourneys } from "@/components/homepage/FeaturedTours";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { FloatingYoutubePlayer } from "@/components/layout/FloatingYoutubePlayer";
import { LookingFor } from "@/components/homepage/LookingFor";
import { Memories } from "@/components/homepage/Memories";
import { Services } from "@/components/homepage/Services";
import { TravellerStories } from "@/components/homepage/TravellerStories";
import { TrendingDestinations } from "@/components/homepage/TrendingDestinations";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { hasStories, memories } from "@/content/homepage";
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
 * explore (by experience) → plan (facilities) → feel (memories) → choose (journeys) → trust (stories)
 * → enquire (CTA) → footer. Sections without real content are not rendered in production, and
 * the catalogue numbers count only the sections that are on the page.
 */
export default function Home() {
  const on = {
    memories: memories.some((m) => canShow(m.ready)),
    journeys: visibleJourneys().length > 0,
    stories: hasStories || showPlaceholders,
  };
  let k = 0;
  const n = () => String(++k).padStart(2, "0");
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <HomeMotion />
      <FloatingYoutubePlayer />
      <Hero />
      <TrendingDestinations n={n()} />
      <LookingFor n={n()} />
      <Services n={n()} />
      {on.memories && <Memories n={n()} />}
      {on.journeys && <FeaturedTours n={n()} />}
      {on.stories && <TravellerStories n={n()} />}
      <FinalCta n={n()} />
    </>
  );
}
