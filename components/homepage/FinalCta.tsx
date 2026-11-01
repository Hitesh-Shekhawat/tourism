import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { InlineEnquiry } from "@/components/enquiry/InlineEnquiry";
import { ContactLinks } from "@/components/home/FaqFinal";
import { Photo } from "@/components/ui/Photo";
import { Arrow, SectionHead } from "@/components/ui/bits";
import { closing, sectionNo } from "@/content/homepage";
import { whatsappHref } from "@/lib/contact";

/**
 * 08 · Closing call to action. A full-bleed dusk photograph with slow parallax under a maroon-ink
 * shade; the headline, both CTAs and the direct contact links on the left, the full two-step enquiry
 * form (code loads as it nears the viewport) on the right.
 */
export function FinalCta() {
  return (
    <section id="enquire" aria-labelledby="final-title" className="on-dark relative isolate overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0" data-parallax="6">
          <Photo k="homeFinal" fill sizes="100vw" decorative />
        </div>
        <div className="home-final-shade absolute inset-0" />
      </div>

      <div className="wrap grid gap-14 py-[var(--section-y)] lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <SectionHead n={sectionNo.closing} label="Begin" dark />
          <h2 id="final-title" className="t-display mt-8 max-w-[11ch]" data-reveal>
            {closing.title}
          </h2>
          <p className="measure mt-8 text-[1.125rem] text-ivory/90" data-reveal>
            {closing.text}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <EnquiryButton className="bg-ivory! text-maroon! hover:bg-sandstone!">Plan Your Trip</EnquiryButton>
            <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
              Talk to Our Travel Expert <Arrow />
            </a>
          </div>
          <div className="mt-12 border-t border-brass/50 pt-8">
            <ContactLinks dark />
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="border border-brass/50 bg-ink/55 p-6 backdrop-blur-[3px] sm:p-9">
            <p className="t-label mb-6 text-ivory/80">Tell us about your trip</p>
            <InlineEnquiry dark />
          </div>
        </div>
      </div>
    </section>
  );
}
