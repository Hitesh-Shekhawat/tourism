import { Link } from "next-view-transitions";
import { SectionHead } from "@/components/ui/bits";
import { journal } from "@/content/journal";

const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Optional (§5.I): renders nothing until the owner publishes an article. */
export function JournalTeaser() {
  const latest = [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  if (!latest.length) return null;
  return (
    <section aria-labelledby="journal-title" className="grain section-y">
      <div className="wrap">
        <div className="flex items-end justify-between gap-8">
          <div>
            <SectionHead n="—" label="Journal" />
            <h2 id="journal-title" className="t-h2 mt-8">
              Notes from the road.
            </h2>
          </div>
          <Link href="/journal" className="link py-2 font-semibold">
            All articles
          </Link>
        </div>
        <ul className="mt-14 grid gap-10 md:grid-cols-3">
          {latest.map((a) => (
            <li key={a.slug} className="border-t border-brass/50 pt-6">
              <p className="t-label text-ink-muted">{fmt(a.date)}</p>
              <h3 className="t-h3 mt-3">
                <Link href={`/journal/${a.slug}`} className="link">
                  {a.title}
                </Link>
              </h3>
              <p className="t-small mt-3 text-ink-muted">{a.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { fmt as formatArticleDate };
