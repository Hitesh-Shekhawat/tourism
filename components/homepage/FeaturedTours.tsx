"use client";

import { Link } from "next-view-transitions";
import { useRef } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { Arrow, SectionHead } from "@/components/ui/bits";
import { featured } from "@/content/homepage";
import { tours } from "@/content/tours";
import { MQ, useSectionMotion } from "./HomeMotion";

const inr = new Intl.NumberFormat("en-IN");

/**
 * 02 · Featured journeys. Desktop (≥1024px, full motion): the section pins and vertical scroll moves the
 * cards sideways; each photo settles from a slight zoom with a little parallax, its text rises in, and the
 * card nearest the centre is emphasised. Below 1024px: a native swipe carousel with snap points, no pin.
 */
export function FeaturedTours() {
  const root = useRef<HTMLElement>(null);

  useSectionMotion(root, ({ gsap, ScrollTrigger }, el) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.wide, () => {
      const pin = el.querySelector<HTMLElement>(".home-tours-pin")!;
      const track = el.querySelector<HTMLElement>(".home-tours-track")!;
      const bar = el.querySelector<HTMLElement>(".home-tours-bar > span");
      const cards = gsap.utils.toArray<HTMLElement>(".home-tour-card", el);
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      el.classList.add("is-scrubbing");

      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => bar && gsap.set(bar, { scaleX: s.progress }),
        },
      });

      cards.forEach((card) => {
        const img = card.querySelector(".home-tour-img");
        const lines = card.querySelectorAll("[data-line]");
        gsap.fromTo(img, { scale: 1.16, xPercent: -4 }, { scale: 1, xPercent: 4, ease: "none", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } });
        gsap.from(lines, { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 78%", toggleActions: "play none none reverse" } });
        ScrollTrigger.create({ trigger: card, containerAnimation: slide, start: "left 58%", end: "right 42%", toggleClass: { targets: card, className: "is-active" } });
      });

      return () => {
        el.classList.remove("is-scrubbing");
        cards.forEach((c) => c.classList.remove("is-active"));
      };
    });
    return () => mm.revert();
  });

  return (
    <section ref={root} id="journeys" aria-labelledby="ft-title" className="home-tours bg-ivory">
      <div className="home-tours-pin">
        <div className="home-tours-track">
          <div className="home-tours-intro">
            <SectionHead n="04" label={featured.label} />
            <h2 id="ft-title" className="t-h1 mt-8 max-w-[11ch]" data-reveal>
              {featured.title}
            </h2>
            <p className="measure mt-6 text-ink-muted" data-reveal>
              {featured.note}
            </p>
            <Link href="/journeys" scroll={false} className="link mt-8 inline-flex items-center gap-2 py-2 font-semibold">
              View all journeys <Arrow />
            </Link>
          </div>

          <ul className="home-tours-cards" aria-label="Featured journeys">
            {tours.map((t) => (
              <li key={t.slug} className="home-tour-card">
                <Link href={`/journeys/${t.slug}`} scroll={false} className="group block">
                  <div className="home-tour-frame relative overflow-hidden bg-dune">
                    <div className="home-tour-img absolute -inset-[6%]">
                      <Photo k={t.heroImage} fill sizes="(min-width: 1024px) 50vw, 86vw" decorative compact />
                    </div>
                  </div>
                  <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-[1fr_auto]">
                    <p data-line className="t-label text-ink-muted sm:col-span-2">
                      {t.route.join(" · ")}
                    </p>
                    <h3 data-line className="t-h2 max-w-[14ch]">
                      {t.title}
                    </h3>
                    <p data-line className="numerals self-end text-ink-muted sm:text-right">
                      {t.durationNights} nights · {t.durationDays} days
                      <br />
                      <span className="font-display text-[1.375rem] text-ink">{t.priceFromINR ? `From ₹${inr.format(t.priceFromINR)}` : "Price on request"}</span>
                    </p>
                    <p data-line className="measure t-small text-ink-muted sm:col-span-2">
                      {t.summary}
                    </p>
                    <span data-line className="inline-flex items-center gap-2 font-semibold text-accent sm:col-span-2">
                      Explore tour <Arrow />
                    </span>
                  </div>
                </Link>
                {t.draft && (
                  <p className="ph mt-4">
                    <span className="t-label mb-1 block">Owner to supply</span>
                    Sample journey: confirm or replace it in content/tours/{t.slug}.ts.
                  </p>
                )}
              </li>
            ))}
            <li className="home-tours-end">
              <p className="t-label text-ink-muted">Not quite it?</p>
              <p className="mt-4 font-display text-[2rem] leading-tight">We&rsquo;ll build a journey around your dates and pace.</p>
              <EnquiryButton className="mt-8">Plan Your Trip</EnquiryButton>
            </li>
          </ul>
        </div>
        <div className="home-tours-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
