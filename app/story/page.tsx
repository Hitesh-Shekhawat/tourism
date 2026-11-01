import type { Metadata } from "next";
import { StoryEngine } from "@/components/story/StoryEngine";
import { Ganjifa } from "@/components/story/chapters/Ganjifa";
import { Hours } from "@/components/story/chapters/Hours";
import { Intro } from "@/components/story/chapters/Intro";
import { Plan } from "@/components/story/chapters/Plan";
import { Starlight } from "@/components/story/chapters/Starlight";
import { Stories } from "@/components/story/chapters/Stories";
import { Thar } from "@/components/story/chapters/Thar";
import { Threshold } from "@/components/story/chapters/Threshold";
import { Tickets } from "@/components/story/chapters/Tickets";
import { Trail } from "@/components/story/chapters/Trail";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { faqs } from "@/content/home";
import { faqLd, pageMeta, travelAgencyLd } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: `One Day in Rajasthan · ${business.brandName}`,
    description: "One day in Rajasthan, from first light over Jaipur to starlight in the Thar: private, unhurried journeys planned around you by people who know the state.",
    path: "/story",
  }),
  title: { absolute: `One Day in Rajasthan · ${business.brandName}` },
};

/**
 * "One Day in Rajasthan" (§2): one continuous scroll story, 05:30 to 21:30 (the home page until v4; now /story).
 * Every chapter's text is server-rendered HTML; canvases and 3D views are decorative.
 */
export default function Story() {
  return (
    <StoryEngine>
      <JsonLd data={travelAgencyLd()} />
      <JsonLd data={faqLd(faqs)} />
      <Threshold />
      <Intro />
      <Hours />
      <Trail />
      <Thar />
      <Ganjifa />
      <Tickets />
      <Plan />
      <Stories />
      <Starlight />
    </StoryEngine>
  );
}
