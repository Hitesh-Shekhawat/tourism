import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItineraryPage } from "@/components/itinerary/ItineraryPage";
import { getItinerary, itineraries } from "@/content/itineraries";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
// Only cities with a written itinerary get this page; the rest 404 rather than show an empty plan
export const dynamicParams = false;
export const generateStaticParams = () => itineraries.map((i) => ({ slug: i.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const it = getItinerary((await params).slug);
  if (!it) return {};
  return pageMeta({ ...it.seo, path: `/destinations/${it.slug}/itinerary` });
}

export default async function Page({ params }: Props) {
  const it = getItinerary((await params).slug);
  if (!it) notFound();
  return <ItineraryPage it={it} />;
}
