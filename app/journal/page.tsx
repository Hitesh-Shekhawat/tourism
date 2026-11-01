import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { formatArticleDate } from "@/components/home/JournalTeaser";
import { PageHead } from "@/components/page/PageParts";
import { journal } from "@/content/journal";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Journal",
  description: "Notes from the road: seasons, places and practical advice for travelling in Rajasthan.",
  path: "/journal",
});

export default function JournalPage() {
  // Optional section (§5.I): 404 until the first article exists.
  if (!journal.length) notFound();
  const list = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHead title="Notes from the road." label="Journal" crumbs={[{ name: "Journal" }]} />
      <section className="grain section-y pt-16!">
        <ul className="wrap grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <li key={a.slug} className="border-t border-brass/50 pt-6">
              <p className="t-label text-ink-muted">{formatArticleDate(a.date)}</p>
              <h2 className="t-h3 mt-3">
                <Link href={`/journal/${a.slug}`} className="link">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-3 text-ink-muted">{a.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
