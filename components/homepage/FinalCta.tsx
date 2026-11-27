import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { InlineEnquiry } from "@/components/enquiry/InlineEnquiry";
import { ContactLinks } from "@/components/home/FaqFinal";
import { WhatsAppIcon } from "@/components/layout/icons";
import { Photo } from "@/components/ui/Photo";
import { Creeper, Rosette } from "@/components/ui/Ornaments";
import { SectionHead } from "@/components/ui/bits";
import { closingV5 } from "@/content/homepage";
import { hasWhatsApp, whatsappHref } from "@/lib/contact";

/**
 * 08 · Final enquiry CTA. Mehrangarh at dusk under a deep-green shade (ivory copy ≥ 4.5:1), a jaali
 * veil and fresco borders. "Plan Your Rajasthan Trip" opens the existing enquiry drawer; the inline
 * form beside it is the same form, posting to the same /api/enquiry. WhatsApp shows only when the
 * business number is configured.
 */
export function FinalCta({ n }: { n: string }) {
  return (
    <section id="enquire" aria-labelledby="final-title" className="final-v5 on-dark relative isolate overflow-hidden bg-forest text-ivory">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0" data-parallax="6">
          <Photo k="homeFinal" fill sizes="100vw" decorative />
        </div>
        <div className="final-shade absolute inset-0 z-10" />
        <div className="final-jaali absolute inset-0 z-10" />
      </div>

      <div className="wrap sec relative z-10 grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6" data-reveal>
          <SectionHead n={n} label={closingV5.eyebrow} dark />
          <Rosette className="mt-10 size-16 text-sand" />
          <h2 id="final-title" className="final-title mt-6">
            <span className="mask-line" data-reveal-mask>
              <span>{closingV5.title}</span>
            </span>
          </h2>
          <Creeper className="mt-6 h-6 w-64 text-sand/70" width={320} />
          <p className="measure mt-6 text-[1.0625rem] text-ivory/90">{closingV5.text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <EnquiryButton>{closingV5.cta}</EnquiryButton>
            {hasWhatsApp() && (
              <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
                <WhatsAppIcon /> WhatsApp enquiry
              </a>
            )}
          </div>
          <div className="mt-12 border-t border-[var(--line-dark)] pt-8">
            <ContactLinks dark />
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="final-form">
            <p className="t-label mb-6 text-sand">Tell us about your trip</p>
            <InlineEnquiry dark />
          </div>
        </div>
      </div>
    </section>
  );
}
