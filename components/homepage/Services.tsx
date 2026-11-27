import type { ReactNode } from "react";
import { Photo } from "@/components/ui/Photo";
import { ArchOutline, Peacock } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { business } from "@/content/business";
import { trust, type TrustCard } from "@/content/homepage";
import { canShow, showPlaceholders } from "@/lib/content-flags";

const demoPartners = [
  { name: "Amber Stays", monogram: "A" },
  { name: "Mewar House", monogram: "M" },
  { name: "Thar Compass", monogram: "T" },
  { name: "Pink City Trails", monogram: "P" },
  { name: "Lake & Loom", monogram: "L" },
  { name: "Fortside Journeys", monogram: "F" },
  { name: "Desert Bloom", monogram: "D" },
];

/** Demo partner marks: invented names, so development only. Replace with confirmed partners to publish. */
function PartnerLogos() {
  if (!showPlaceholders) return null;
  const marks = (copy: boolean) => (
    <ul className="partner-marquee__group" aria-hidden={copy || undefined}>
      {demoPartners.map((partner) => (
        <li key={partner.name} className="partner-logo">
          <span className="partner-logo__mark" aria-hidden="true">{partner.monogram}</span>
          <span className="partner-logo__name">{partner.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="partner-strip" aria-label="Illustrative partner logo examples">
      <div className="wrap">
        <p className="t-label partner-strip__eyebrow">Our partners</p>
        <p className="partner-strip__note">Demo marks only (development builds). Replace with confirmed partners before publishing.</p>
      </div>
      <div className="partner-marquee" aria-label="Illustrative demo partner names">
        <div className="partner-marquee__track">
          {marks(false)}
          {marks(true)}
        </div>
      </div>
    </div>
  );
}

const ICONS: Record<TrustCard["icon"], ReactNode> = {
  compass: (
    <>
      <circle cx="16" cy="16" r="13" />
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3" />
      <path d="M20.5 11.5l-2.8 6.2-6.2 2.8 2.8-6.2z" />
    </>
  ),
  route: (
    <>
      <circle cx="7" cy="24" r="3" />
      <circle cx="25" cy="8" r="3" />
      <path d="M9.5 22.5C14 19 10 14 15 12s6 0 8-2" strokeDasharray="2 2.5" />
    </>
  ),
  hands: (
    <>
      <path d="M3 17l6-6 5 2 4-3 5 2 6 5" />
      <path d="M9 11l7 8c1 1 2.5 1 3.2 0 .7-1 .2-2-.4-2.6M14 21c1 1 2.4 1 3 .2M11.5 22.5c.8.8 2 .8 2.6.2" />
      <path d="M3 17l5 5M29 17l-5 5" />
    </>
  ),
  chat: (
    <>
      <path d="M5 7h22v14H14l-6 5v-5H5z" />
      <path d="M10 12h12M10 16h8" />
    </>
  ),
};

/**
 * 06 · Why travel with us. Only claims the site itself supports are published; a card whose claim
 * needs a business fact is shown (labelled) in development and left out of production until the owner
 * confirms it in content/homepage.ts → trust. Registered approvals appear only if real ones exist.
 */
export function Services({ n }: { n: string }) {
  const cards = trust.cards.filter((c) => canShow(c.ready));
  return (
    <section id="why-us" aria-labelledby="trust-title" className="sec trust-v5 relative isolate bg-ivory">
      <div className="wrap trust-layout">
        <div className="trust-visual" data-fx="rise">
          <div className="trust-arch">
            <div className="trust-arch-photo">
              <Photo k="galFortGate" fill sizes="(min-width: 1024px) 34vw, 90vw" />
            </div>
            <ArchOutline className="trust-arch-outline text-sand" />
          </div>
          <Peacock className="trust-peacock text-sand" />
        </div>

        <div className="trust-content">
          <SectionHeading n={n} label={trust.label} id="trust-title" title={trust.title} titleClass="max-w-[15ch]" className="trust-heading" />
          <p className="measure mt-6 text-ink-muted" data-reveal>
            {trust.note}
          </p>
          <ul className="trust-grid">
            {cards.map((c, i) => (
              <li key={c.id} className={`trust-card ${c.ready ? "" : "is-unconfirmed"}`} data-fx="card">
                <svg className="trust-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[c.icon]}
                </svg>
                <h3 className="trust-title">{c.title}</h3>
                <p className="trust-text">{c.text}</p>
                {!c.ready && <p className="trust-need">Owner to confirm (hidden in production): {c.need}</p>}
              </li>
            ))}
          </ul>
          {business.approvals.length > 0 && (
            <p className="t-small mt-8 text-ink-muted">
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
      <PartnerLogos />
    </section>
  );
}
