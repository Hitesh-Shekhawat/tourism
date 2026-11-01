import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationDetail } from "@/components/detail/DestinationDetail";
import { destinations, getDestination } from "@/content/destinations";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => destinations.map((d) => ({ slug: d.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = getDestination((await params).slug);
  if (!d) return {};
  return pageMeta({ ...d.seo, path: `/destinations/${d.slug}`});
}

export default async function Page({ params }: Props) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  return <DestinationDetail d={d} />;
}
