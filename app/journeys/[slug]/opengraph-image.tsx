import { ogCard, ogSize } from "@/components/page/og";
import { getTour, tours } from "@/content/tours";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Journey overview";
export const generateStaticParams = () => tours.map((t) => ({ slug: t.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTour((await params).slug)!;
  return ogCard({ kicker: `${t.durationNights} nights · ${t.durationDays} days`, title: t.title, line: t.route.join(" — ") });
}
