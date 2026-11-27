"use client";

import { useEffect } from "react";
import { loadGsap } from "@/lib/story/engine";
import { useStory } from "@/lib/story/store";

/** Sections that hand over to the next one as a stacked "page turn" (desktop). The train pins itself. */
const STACKED = ["section.hero-v5", "#discover", "#destinations", "#packages", "#experiences", "#why-us", "#stories"];

/**
 * The home page's GSAP scroll layer (one gsap.context over <main>, reverted on unmount):
 *
 * 1. Section by section (≥ 1024px): each section holds its last screen while the next slides up over
 *    it, receding slightly (scale 0.94) and dimming, so the page reads one chapter at a time.
 *    pinSpacing is off, so no scroll length or anchor positions change.
 * 2. Cards ([data-fx="card"]): rise in with a slight 3D tilt in staggered batches as they enter;
 *    their ornament strokes trace in with them.
 * 3. Photographs in the large cards drift inside their frames as you scroll (≥ 1024px).
 *
 * Nothing runs in reduced mode (OS setting or the site's motion toggle); without JS every card is
 * simply visible, because the hidden start state is only applied here.
 */
export function ScrollFx() {
  const mode = useStory((s) => s.mode);

  useEffect(() => {
    if (mode === "reduced") return;
    const main = document.querySelector("main");
    if (!main) return;
    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let raf = 0;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        /* 2 · Cards */
        const cards = gsap.utils.toArray<HTMLElement>('[data-fx="card"]');
        gsap.set(cards, { autoAlpha: 0, y: 64, rotateX: -7, transformPerspective: 1000, transformOrigin: "50% 100%" });
        cards.forEach((card) => {
          const strokes = card.querySelectorAll<SVGElement>(".orn-draw");
          if (strokes.length) gsap.set(strokes, { strokeDashoffset: 1 });
        });
        // One trigger per card (refreshed after the pinned train, so positions include its pin spacing),
        // staggered by the card's place in its row
        cards.forEach((card) => {
          const siblings = card.parentElement ? Array.from(card.parentElement.children) : [card];
          const delay = (siblings.indexOf(card) % 4) * 0.09;
          ScrollTrigger.create({
            trigger: card,
            start: "top 90%",
            once: true,
            refreshPriority: -2,
            onEnter: () => {
              gsap.to(card, { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.1, delay, ease: "expo.out", overwrite: true, clearProps: "transform,transformPerspective" });
              const strokes = card.querySelectorAll(".orn-draw");
              if (strokes.length) gsap.to(strokes, { strokeDashoffset: 0, duration: 1.8, ease: "power2.out", delay: delay + 0.25 });
            },
          });
        });

        const rise = gsap.utils.toArray<HTMLElement>('[data-fx="rise"]');
        rise.forEach((el) =>
          gsap.from(el, { autoAlpha: 0, y: 80, scale: 0.96, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%", once: true, refreshPriority: -2 } }),
        );

        mm.add("(min-width: 1024px)", () => {
          /* 3 · Photo drift inside the big cards */
          gsap.utils.toArray<HTMLElement>(".royal-card, .showcase-card:not(.is-panel), .story-feature, .pkg-photo, .discover-photo").forEach((frame) => {
            const img = frame.querySelector("img");
            if (!img) return;
            gsap.fromTo(
              img,
              { yPercent: -6, scale: 1.14 },
              { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, refreshPriority: -3 } },
            );
          });

          /* 1 · Section by section */
          const sections = STACKED.map((s) => main.querySelector<HTMLElement>(s)).filter((s): s is HTMLElement => !!s);
          // top-level sections in page order (a pinned one may already sit inside GSAP's pin-spacer div)
          const all = Array.from(main.querySelectorAll<HTMLElement>("section")).filter((s) => !s.parentElement?.closest("section"));
          all.forEach((s, i) => {
            s.style.position = "relative";
            s.style.zIndex = String(i + 1);
          });
          sections.forEach((section) => {
            const next = all[all.indexOf(section) + 1];
            if (!next) return;
            next.classList.add("fx-stack-next");
            const shade = document.createElement("div");
            shade.className = "fx-stack-shade";
            shade.setAttribute("aria-hidden", "true");
            section.appendChild(shade);
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                // tall sections hold their last screen; a one-screen section holds from its top
                start: () => (section.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
                end: () => `+=${window.innerHeight}`,
                pin: true,
                pinSpacing: false,
                scrub: true,
                refreshPriority: -1,
                invalidateOnRefresh: true,
              },
            });
            tl.to(section, { scale: 0.94, transformOrigin: "50% 100%", ease: "none" }, 0).to(shade, { opacity: 0.55, ease: "none" }, 0);
          });
          return () => {
            all.forEach((s) => {
              s.style.position = "";
              s.style.zIndex = "";
            });
            main.querySelectorAll(".fx-stack-shade").forEach((n) => n.remove());
            main.querySelectorAll(".fx-stack-next").forEach((n) => n.classList.remove("fx-stack-next"));
          };
        });
      }, main);
      // positions depend on the train's pin spacing: measure once everything has registered
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [mode]);

  return null;
}
