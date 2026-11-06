import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { InlineEnquiry } from "@/components/enquiry/InlineEnquiry";
import { ContactLinks } from "@/components/home/FaqFinal";
import { WhatsAppIcon } from "@/components/layout/icons";
import { Photo } from "@/components/ui/Photo";
import { SectionHead } from "@/components/ui/bits";
import { closing } from "@/content/homepage";
import { hasWhatsApp, whatsappHref } from "@/lib/contact";

/**
 * 09 · Conversion CTA (enquire). A Rajasthan photograph with gentle parallax (≤ 6%) under a maroon-ink
 * shade that keeps ivory copy above 4.5:1. "Plan Your Trip" opens the existing enquiry drawer; the
 * WhatsApp enquiry (pre-filled message) appears only when the business number is configured. The
 * existing inline enquiry form sits beside it, unchanged.
 */
export function FinalCta({ n }: { n: string }) {
  return (
    <section id="enquire" aria-labelledby="final-title" className="on-dark relative isolate overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0" data-parallax="6">
          <Photo k="homeFinal" fill sizes="100vw" decorative />
        </div>
        <div className="home-final-shade absolute inset-0" />
      </div>

      <div className="wrap sec grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <SectionHead n={n} label="Begin" dark />
          <h2 id="final-title" className="t-h1 mt-5 max-w-[14ch]">
            <span className="mask-line" data-reveal-mask>
              <span>{closing.title}</span>
            </span>
          </h2>
          <p className="measure mt-6 text-ivory/90" data-reveal>
            {closing.text}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <EnquiryButton>Plan Your Trip</EnquiryButton>
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
          <div className="border border-[var(--line-dark)] bg-ink/75 p-5 shadow-[var(--shadow-lift)] backdrop-blur-md xs:p-6 sm:p-9">
            <p className="t-label mb-6 text-ivory/80">Tell us about your trip</p>
            <InlineEnquiry dark />
          </div>
        </div>
      </div>
    </section>
  );
}
