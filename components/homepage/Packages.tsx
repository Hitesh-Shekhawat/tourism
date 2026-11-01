import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { Check, Copy, SectionHead } from "@/components/ui/bits";
import { packageCategories, packagesCopy } from "@/content/homepage";
import { tours } from "@/content/tours";

const inr = new Intl.NumberFormat("en-IN");

/** Editorial rhythm: wide / narrow pairs that swap sides, the narrow card dropped a step. */
const SPAN = ["lg:col-span-7", "lg:col-span-5 lg:mt-28", "lg:col-span-5", "lg:col-span-7 lg:mt-28", "lg:col-span-6", "lg:col-span-6 lg:mt-28"];

/**
 * 05 · Packages. Data-driven: each category lists the published journeys that fit it (content/tours),
 * with duration, inclusions and a price only when the owner has set one. A category with no journey yet
 * shows an owner placeholder rather than an invented package.
 */
export function Packages() {
  return (
    <section id="packages" aria-labelledby="pkg-title" className="on-dark section-y bg-[linear-gradient(to_bottom,#5e1a1a,#3d1414)] text-ivory">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHead n="06" label={packagesCopy.label} dark />
            <h2 id="pkg-title" className="t-h1 mt-8 max-w-[13ch]" data-reveal>
              {packagesCopy.title}
            </h2>
          </div>
          <p className="measure text-ivory/85 lg:col-span-4 lg:col-start-9" data-reveal>
            {packagesCopy.note}
          </p>
        </div>

        <ul className="mt-16 grid gap-x-10 gap-y-16 lg:mt-24 lg:grid-cols-12 lg:gap-y-20">
          {packageCategories.map((c, i) => {
            const fit = tours.filter(c.fits);
            const t = fit[0];
            return (
              <li key={c.id} id={`pkg-${c.id}`} className={`home-pkg ${SPAN[i % SPAN.length]}`}>
                <article aria-labelledby={`pkg-${c.id}-t`}>
                  <div className="home-pkg-frame hover-zoom relative overflow-hidden" data-reveal-mask>
                    <div className="relative">
                      <Photo k={c.image} ratio={i % 2 ? "4:5" : "3:2"} sizes="(min-width: 1024px) 50vw, 92vw" decorative compact />
                    </div>
                  </div>
                  <p className="t-label mt-6 text-dune">{c.title}</p>
                  <p className="t-small mt-2 max-w-[44ch] text-ivory/80">{c.blurb}</p>

                  {t ? (
                    <div className="mt-6 border-t border-brass/50 pt-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h3 id={`pkg-${c.id}-t`} className="t-h3">
                          {t.title}
                        </h3>
                        <p className="numerals text-ivory/85">
                          {t.durationNights} nights · {t.durationDays} days
                        </p>
                      </div>
                      <ul className="mt-4 space-y-1.5">
                        {t.inclusions.slice(0, 3).map((inc) => (
                          <li key={inc} className="t-small flex gap-3 text-ivory/90">
                            <Check className="mt-1 text-dune" />
                            <Copy text={inc} />
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5">
                        {t.priceFromINR ? (
                          <>
                            <span className="t-small text-ivory/75">From </span>
                            <span className="numerals font-display text-[1.625rem] leading-none">₹{inr.format(t.priceFromINR)}</span>
                            <span className="t-small text-ivory/75"> {t.priceBasis ?? "pp (twin sharing)"}</span>
                          </>
                        ) : (
                          <span className="font-display text-[1.25rem]">Price on request</span>
                        )}
                      </p>
                      {t.draft && (
                        <p className="ph mt-4">
                          <span className="t-label mb-1 block">Owner to supply</span>
                          Sample journey: confirm or replace it in content/tours/{t.slug}.ts.
                        </p>
                      )}
                      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <Link href={`/journeys/${t.slug}`} scroll={false} className="btn btn-secondary">
                          View Details
                        </Link>
                        <EnquiryButton prefill={{ tour: t.title }} className="bg-ivory! text-maroon! hover:bg-sandstone!">
                          Enquire Now
                        </EnquiryButton>
                      </div>
                      {fit.length > 1 && (
                        <p className="t-small mt-4 text-ivory/75">
                          Also in this style:{" "}
                          {fit.slice(1).map((o, k) => (
                            <span key={o.slug}>
                              {k > 0 && ", "}
                              <Link href={`/journeys/${o.slug}`} scroll={false} className="underline underline-offset-2 hover:text-ivory">
                                {o.title}
                              </Link>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 border-t border-brass/50 pt-6">
                      <h3 id={`pkg-${c.id}-t`} className="t-h3">
                        {c.title}
                      </h3>
                      <p className="ph mt-4">
                        <span className="t-label mb-1 block">Owner to supply</span>
                        No {c.title.toLowerCase()} package is published yet: add one in content/tours/ (name, duration, inclusions, price if fixed).
                      </p>
                      <EnquiryButton className="mt-6 bg-ivory! text-maroon! hover:bg-sandstone!">Enquire Now</EnquiryButton>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
