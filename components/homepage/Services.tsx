import { Photo } from "@/components/ui/Photo";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHead } from "@/components/ui/bits";
import { business } from "@/content/business";
import { services, whyUs, type ServiceIcon } from "@/content/homepage";
import { canShow } from "@/lib/content-flags";

/** One icon set, drawn for the site: 24×24, thin stroke only, round joins. */
const PATHS: Record<ServiceIcon, string> = {
  plan: "M4 20c3-6 6-2 9-7s4-6 7-8M4 20h3M17 5h3v3M9 9.5a1.5 1.5 0 1 0 0-.01",
  hotel: "M4 21V10.5C4 6.4 7.6 4 12 2.6c4.4 1.4 8 3.8 8 7.9V21M8 21v-6.5c0-1.6 1.8-2.8 4-3.6 2.2.8 4 2 4 3.6V21M2 21h20",
  car: "M3 16v-3.5L5.5 8h13L21 12.5V16M3 16h18M6.5 16v2M17.5 16v2M6 12.5h12",
  plane: "M2 13l8-1 5-8h2l-2 8 5-.5 2-2.5h1.5l-1 4 1 4H22l-2-2.5-5-.5 2 8h-2l-5-8-8-1z",
  guide: "M12 3a2.5 2.5 0 1 0 0 .01M8 21l1.5-9h5L16 21M9.5 12l-3 3M14.5 12l4-6",
  dune: "M2 18c4-5 7-6 10-3 2.5-3.5 6-4 10-1M2 21h20M17 4a2 2 0 1 0 0 .01",
  group: "M8 8a2.5 2.5 0 1 0 0-.01M16 8a2.5 2.5 0 1 0 0-.01M3 20c.5-4 2.5-6 5-6s4.5 2 5 6M11 20c.5-4 2.5-6 5-6s4.5 2 5 6",
  phone: "M6 3h4l1.5 5-2.5 1.5a11 11 0 0 0 5.5 5.5L16 12.5l5 1.5v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z",
  route: "M5 19a2 2 0 1 0 0-.01M19 7a2 2 0 1 0 0-.01M5 17c0-5 4-5 7-6s5-1.5 6-3M3 4h5M3 7h3",
  lamp: "M12 3c1.5 2 2.5 3.4 2.5 5a2.5 2.5 0 0 1-5 0c0-1.6 1-3 2.5-5zM6 14h12l-2 4H8zM10 18v3h4v-3M4 21h16",
};

function Icon({ name }: { name: ServiceIcon }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-terracotta">
      <path d={PATHS[name]} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 08 · Why travel with us (trust). Editorial two columns: a sticky heading and photograph beside up to
 * six points. Only claims the business has confirmed (`offered: true`) render in production; unconfirmed
 * ones are labelled in development. No rankings, no "best", no unsourced numbers.
 */
export function Services({ n }: { n: string }) {
  const list = services.filter((s) => s.offered !== false && canShow(s.offered === true)).slice(0, 6);
  if (!list.length) return null;
  return (
    <section id="why-us" aria-labelledby="why-title" className="sec bg-ivory">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <SectionHead n={n} label={whyUs.label} />
            <h2 id="why-title" className="t-h1 mt-5 max-w-[14ch]">
              <span className="mask-line" data-reveal-mask>
                <span>{whyUs.title}</span>
              </span>
            </h2>
            <p className="measure mt-6 text-ink-muted" data-reveal>
              {whyUs.note}
            </p>
            <div className="relative mt-10 hidden lg:block" data-reveal-mask>
              <div className="relative aspect-[4/5] max-h-[52vh] overflow-hidden">
                <Photo k="introArch" fill sizes="34vw" decorative />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 lg:pl-10">
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {list.map((s, i) => (
              <li key={s.id} className="border-t border-[var(--line-light)] pt-7 pb-12" data-reveal style={{ ["--d" as string]: `${(i % 2) * 60}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <Icon name={s.icon} />
                  <span className="serif-italic numerals text-[1.125rem] text-brass-text" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 t-h3">{s.title}</h3>
                <p className="t-small mt-3 max-w-[38ch] text-ink-muted">{s.text}</p>
                {s.offered === null && <Placeholder what="the business's confirmation that this is true (content/homepage.ts → services → offered)" className="mt-4" />}
              </li>
            ))}
          </ol>
          {business.approvals.length > 0 && (
            <p className="t-small mt-4 border-t border-[var(--line-light)] pt-6 text-ink-muted">
              Registered with{" "}
              {business.approvals.map((a, i) => (
                <span key={a.number}>
                  {i > 0 && ", "}
                  {a.name} ({a.number})
                </span>
              ))}
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
