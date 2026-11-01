import { notFound } from "next/navigation";
import { DestinationDetail } from "@/components/detail/DestinationDetail";
import { Sheet } from "@/components/sheet/Sheet";
import { destinations, getDestination } from "@/content/destinations";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => destinations.map((d) => ({ slug: d.slug }));

/** /destinations/[slug] opened from inside the site: a sheet over the story (§7). */
export default async function DestinationSheet({ params }: Props) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  return (
    <Sheet label={d.name} slug={d.slug}>
      <DestinationDetail d={d} />
    </Sheet>
  );
}
