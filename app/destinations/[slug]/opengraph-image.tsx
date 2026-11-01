import { ogCard, ogSize } from "@/components/page/og";
import { destinations, getDestination } from "@/content/destinations";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Destination overview";
export const generateStaticParams = () => destinations.map((d) => ({ slug: d.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDestination((await params).slug)!;
  return ogCard({ kicker: "Rajasthan", title: d.name, line: d.descriptor });
}
