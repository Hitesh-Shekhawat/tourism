import type { Metadata } from "next";
import { ExperienceShowcase } from "@/components/homepage/ExperienceShowcase";
import { FeaturedTours } from "@/components/homepage/FeaturedTours";
import { FinalCta } from "@/components/homepage/FinalCta";
import { Hero } from "@/components/homepage/Hero";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { LookingFor } from "@/components/homepage/LookingFor";
import { RoyalCities } from "@/components/homepage/RoyalCities";
import { ScrollFx } from "@/components/homepage/ScrollFx";
import { Services } from "@/components/homepage/Services";
import { TravelStories } from "@/components/homepage/TravelStories";
import { TrendingDestinations } from "@/components/homepage/TrendingDestinations";
import { FloatingYoutubePlayer } from "@/components/layout/FloatingYoutubePlayer";
import { JsonLd } from "@/components/ui/JsonLd";
import { homeDestinationsLd, pageMeta, travelAgencyLd, websiteLd } from "@/lib/seo";

const title = "Rajasthan Tour Packages | Custom Rajasthan Holidays & Tours";

export const metadata: Metadata = {
  ...pageMeta({
    title,
    description:
      "Explore Rajasthan tour packages covering Jaipur, Udaipur, Jodhpur, Jaisalmer and beyond. Discover royal forts, heritage stays, desert safaris and customised Rajasthan travel itineraries.",
    path: "/",
  }),
  title: { absolute: title },
};

/**
 * The home page (v5, premium editorial): arrive (hero) → choose a feeling (discovery) → the royal
 * cities (grid + locator map, then the interactive royal train) → curated packages → experiences →
 * why us → stories → enquire → footer. Section numbers count only what is on the page.
 */
export default function Home() {
  let k = 0;
  const n = () => String(++k).padStart(2, "0");
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <JsonLd data={websiteLd()} />
      <JsonLd data={homeDestinationsLd()} />
      <HomeMotion />
      <ScrollFx />
      <FloatingYoutubePlayer />
      <Hero />
      <LookingFor n={n()} />
      <RoyalCities n={n()} />
      <TrendingDestinations n={n()} />
      <FeaturedTours n={n()} />
      <ExperienceShowcase n={n()} />
      <Services n={n()} />
      <TravelStories n={n()} />
      <FinalCta n={n()} />
    </>
  );
}
