import { ContactLinks, FaqList } from "@/components/home/FaqFinal";
import { InlineEnquiry } from "@/components/enquiry/InlineEnquiry";
import { Fact } from "@/components/ui/bits";
import { business } from "@/content/business";
import { faqs, finalCta } from "@/content/home";
import { chapterHeadingId, frameUrl, sequences } from "@/lib/day";
import { Chapter, ChapterHead } from "../Chapter";
import { HeadingFx } from "./HeadingFx";
import { Stars2D } from "./Stars2D";

const night = sequences.dunes;

/**
 * Ch09 · 21:30 · तारों के नीचे, "Starlight" (§6.10): the last dunes frame under a star field (three.js
 * on capable desktops; a slowly turning 2D canvas elsewhere). FAQ on the left, the full enquiry form
 * on the right.
 */
export function Starlight() {
  return (
    <Chapter id="starlight" className="gl-chapter ch-dark-c relative overflow-hidden" dark>
      <HeadingFx id="starlight" order={90} />
      <div className="starlight-bg" aria-hidden="true">
        <div className="gl-fallback absolute inset-0">
          <picture>
            <source media="(orientation: portrait)" srcSet={frameUrl(night, "mobile", night.count)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frameUrl(night, "desktop", night.count)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-bottom" />
          </picture>
          <Stars2D />
        </div>
        <div id="gl-starlight" className="gl-view absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(11_13_23/.35),rgb(11_13_23/.55)_45%,rgb(11_13_23/.8))]" />
      </div>

      <div className="wrap section-y relative grid gap-20 text-ivory lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <ChapterHead id="starlight" label="Questions" />
          <h2 className="t-h2 mt-8 max-w-[14ch]">Things guests often ask.</h2>
          <div className="mt-12">
            <FaqList items={faqs} dark />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id={chapterHeadingId("starlight")} className="t-h1 max-w-[12ch]" data-rise>
            {finalCta.title}
          </h2>
          <p className="measure mt-6 text-ivory/90">
            What happens next: we reply within <Fact v={business.responseTime} /> with a draft itinerary. No payment is needed to enquire.
          </p>
          <div className="mt-12 border-t border-brass/50 pt-10">
            <InlineEnquiry dark />
          </div>
          <div className="mt-12 border-t border-brass/50 pt-8">
            <p className="t-label mb-4 text-ivory/80">Or reach us directly</p>
            <ContactLinks dark />
            <p className="t-small mt-4 text-ivory/75">
              <Fact v={business.officeHours} />
            </p>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
