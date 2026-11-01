import { notFound } from "next/navigation";
import { JourneyDetail } from "@/components/detail/JourneyDetail";
import { Sheet } from "@/components/sheet/Sheet";
import { getTour, tours } from "@/content/tours";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => tours.map((t) => ({ slug: t.slug }));

/** /journeys/[slug] opened from inside the site: a sheet over the story (§7). */
export default async function JourneySheet({ params }: Props) {
  const t = getTour((await params).slug);
  if (!t) notFound();
  return (
    <Sheet label={`${t.title} itinerary`} slug={t.slug}>
      <JourneyDetail t={t} />
    </Sheet>
  );
}
