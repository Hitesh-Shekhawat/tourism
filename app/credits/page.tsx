import type { Metadata } from "next";
import { PageHead } from "@/components/page/PageParts";
import { credits, dataCredits } from "@/content/credits";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Photo credits",
  description: "Credits and licences for photographs and video used on this site.",
  path: "/credits",
});

export default function CreditsPage() {
  return (
    <>
      <PageHead title="Photo credits" crumbs={[{ name: "Photo credits" }]} />
      <section className="grain section-y pt-16!">
        <div className="wrap max-w-[900px]">
          {credits.length ? (
            <ul className="border-t border-brass/50">
              {credits.map((c) => (
                <li key={c.file} className="grid gap-1 border-b border-brass/50 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                  <span>
                    <span className="font-mono text-sm">{c.file}</span>
                    <span className="block text-ink-muted">
                      {c.author},{" "}
                      <a className="prose-link" href={c.sourceUrl} target="_blank" rel="noopener">
                        {c.source}
                      </a>
                    </span>
                  </span>
                  <span className="t-small text-ink-muted">
                    {c.licenceUrl ? (
                      <a className="prose-link" href={c.licenceUrl} target="_blank" rel="noopener">
                        {c.licence}
                      </a>
                    ) : (
                      c.licence
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="measure text-ink-muted">All photographs on this site are our own unless credited here. No third-party images are in use yet.</p>
          )}
          <h2 className="t-h3 mt-16">Maps and generated imagery</h2>
          <ul className="mt-6 border-t border-brass/50">
            {dataCredits.map((c) => (
              <li key={c.what} className="grid gap-1 border-b border-brass/50 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                <span>
                  {c.what}
                  <span className="block text-ink-muted">{c.sourceUrl ? <a className="prose-link" href={c.sourceUrl} target="_blank" rel="noopener">{c.source}</a> : c.source}</span>
                </span>
                <span className="t-small text-ink-muted">{c.licence}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
