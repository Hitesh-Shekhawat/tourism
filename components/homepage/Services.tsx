import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalTrack } from "@/components/ui/HorizontalTrack";
import { Photo } from "@/components/ui/Photo";
import { business } from "@/content/business";
import { facilitiesIntro, services } from "@/content/homepage";

const demoPartners = [
  { name: "Amber Stays", monogram: "A" },
  { name: "Mewar House", monogram: "M" },
  { name: "Thar Compass", monogram: "T" },
  { name: "Pink City Trails", monogram: "P" },
  { name: "Lake & Loom", monogram: "L" },
  { name: "Fortside Journeys", monogram: "F" },
  { name: "Desert Bloom", monogram: "D" },
];

function PartnerLogos() {
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
        <p className="partner-strip__note">Demo marks only — replace with confirmed partners before publishing.</p>
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

/**
 * Tour facilities. Scroll-driven horizontal cards on motion-enabled screens, with native scroll-snap otherwise.
 */
export function Services({ n }: { n: string }) {
  return (
    <section id="facilities" aria-labelledby="facilities-title" className="sec facilities-section relative isolate">
      <HorizontalTrack
        className="facilities-track"
        label="Tour facilities"
        head={
          <SectionHeading
            n={n}
            label={facilitiesIntro.label}
            title={facilitiesIntro.title}
            id="facilities-title"
            note={facilitiesIntro.note}
          />
        }
      >
        {services.map((s, i) => (
          <li key={s.id} className="facility-card">
            <details className="facility-card__details">
              <summary className="facility-card__summary">
                <span className="facility-card__photo">
                  <Photo k={s.image} fill sizes="(min-width: 1024px) 26vw, 82vw" compact />
                  <span className="facility-card__category">
                    <span>Tour facility</span>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </span>
                </span>
                <span className="facility-card__title-row">
                  <span className="t-h3">{s.title}</span>
                  <svg className="facility-card__control" viewBox="0 0 24 24" aria-hidden="true">
                    <path className="facility-card__plus" d="M12 5v14M5 12h14" />
                    <path className="facility-card__arrow" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </summary>
              <p className="facility-card__copy t-small text-ink-muted">{s.text}</p>
            </details>
          </li>
        ))}
        {business.approvals.length > 0 && (
          <li className="facility-card facility-card--approval">
            <p className="t-small text-ink-muted">
              Registered with{" "}
              {business.approvals.map((a, i) => (
                <span key={a.number}>
                  {i > 0 && ", "}
                  {a.name} ({a.number})
                </span>
              ))}
              .
            </p>
          </li>
        )}
      </HorizontalTrack>
      <PartnerLogos />
    </section>
  );
}
