import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatArticleDate } from "@/components/home/JournalTeaser";
import { PageHead } from "@/components/page/PageParts";
import { JsonLd } from "@/components/ui/JsonLd";
import { getArticle, journal } from "@/content/journal";
import { abs, breadcrumbLd, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => journal.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  return a ? pageMeta({ title: a.title, description: a.excerpt, path: `/journal/${a.slug}` }) : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.date, author: { "@type": "Person", name: a.author }, mainEntityOfPage: abs(`/journal/${a.slug}`) }} />
      <JsonLd data={breadcrumbLd([{ name: "Journal", path: "/journal" }, { name: a.title, path: `/journal/${a.slug}` }])} />
      <PageHead title={a.title} label={formatArticleDate(a.date)} crumbs={[{ name: "Journal", href: "/journal" }, { name: a.title }]}>
        <p className="t-small mt-6 text-ink-muted">By {a.author}</p>
      </PageHead>
      <article className="grain section-y pt-16!">
        <div className="wrap">
          <div className="mx-auto max-w-[62ch] space-y-6 text-[1.125rem]">
            {a.body.map((p, i) =>
              p.startsWith("## ") ? (
                <h2 key={i} className="t-h2 pt-6">
                  {p.slice(3)}
                </h2>
              ) : (
                <p key={i} className={i === 0 ? "dropcap" : ""}>
                  {p}
                </p>
              ),
            )}
          </div>
        </div>
      </article>
    </>
  );
}
