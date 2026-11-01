import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { PlanTripBar } from "@/components/home/PlanTripBar";
import { Arrow } from "@/components/ui/bits";
import { hero } from "@/content/home";
import { archPath } from "@/lib/arch";
import { chapterHeadingId } from "@/lib/day";
import { Chapter } from "../Chapter";
import { ThresholdVisual } from "./ThresholdVisual";

/**
 * Ch00 · 05:30 · जयपुर, "Through the jharokha" (§6.1). The copy is server-rendered and is the
 * LCP element; the canvas, the 3D scene and the preloader are decorative and never cover it.
 */
export function Threshold() {
  return (
    <>
      <Chapter id="threshold" pinned className="gl-chapter ch-dark-a" dark>
        <div className="th-stage">
          <ThresholdVisual />
          <div id="gl-threshold" className="gl-view absolute inset-0" aria-hidden="true" />

          {/* Preloader: html.preload is set pre-paint on the first visit of a session only */}
          <div className="preloader" aria-hidden="true">
            <svg viewBox="0 0 1 1" preserveAspectRatio="none">
              <path d={archPath} pathLength={1} fill="none" stroke="var(--color-brass)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="th-shade" aria-hidden="true" />
          <div className="wrap th-copy text-ivory">
            <p className="t-label text-ivory/90">{hero.label}</p>
            <h1 id={chapterHeadingId("threshold")} className="hero-title t-display mt-5 max-w-[12ch]">
              {hero.headline.map((line, i) => (
                <span key={line} className="rise-line" style={{ ["--i" as string]: i }}>
                  <span>{line}</span>
                </span>
              ))}
            </h1>
            <p className="measure mt-6 max-w-[44ch] text-[1.125rem] text-ivory/90">{hero.support}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <EnquiryButton>Plan My Trip</EnquiryButton>
              <a href={`#${chapterHeadingId("intro")}`} className="link inline-flex items-center gap-2 py-2 font-semibold">
                Begin the day <Arrow className="rotate-90" />
              </a>
            </div>
          </div>
        </div>
      </Chapter>
      <PlanTripBar />
    </>
  );
}
