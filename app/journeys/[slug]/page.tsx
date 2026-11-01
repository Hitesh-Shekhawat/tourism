import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JourneyDetail } from "@/components/detail/JourneyDetail";
import { getTour, tours } from "@/content/tours";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => tours.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTour((await params).slug);
  if (!t) return {};
  return pageMeta({ ...t.seo, path: `/journeys/${t.slug}`});
}

export default async function Page({ params }: Props) {
  const t = getTour((await params).slug);
  if (!t) notFound();
  return <JourneyDetail t={t} />;
}
