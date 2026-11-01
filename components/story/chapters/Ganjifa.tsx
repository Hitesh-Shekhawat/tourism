"use client";

import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { TrailDivider } from "@/components/ui/bits";
import { experiences } from "@/content/experiences";
import { ganjifa } from "@/content/home";
import { chapter, chapterHeadingId } from "@/lib/day";
import { getLenis } from "@/lib/smooth";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading, vhPx } from "@/lib/story/fx";
import { useStory } from "@/lib/story/store";
import { Chapter, ChapterHead } from "../Chapter";

const PIN = chapter("ganjifa").pin!;
const exps = experiences.slice(0, 6);
const N = exps.length + 1; // + "Design your own journey"
let labelScroll: ((label: string) => number | null) | null = null;

/** Lacquered rim: a brass double rule with 12 painted dots, and the title set on the lower arc. */
function Rim({ title, id }: { title: string; id: string }) {
  return (
    <svg className="gj-rim" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id={`arc-${id}`} d="M 17 100 A 83 83 0 0 0 183 100" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="none" stroke="#b08d57" strokeWidth="1" />
      <circle cx="100" cy="100" r="94.5" fill="none" stroke="#b08d57" strokeWidth="0.6" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#b08d57" strokeWidth="0.6" />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
        return <circle key={k} className="gj-dot" style={{ ["--k" as string]: k }} cx={+(100 + Math.cos(a) * 89).toFixed(2)} cy={+(100 + Math.sin(a) * 89).toFixed(2)} r="2.1" fill={k % 3 === 0 ? "#e7c48a" : "#b5562f"} />;
      })}
      <text fontSize="8.4" letterSpacing="1.6" fill="#f7f1e6" fontFamily="var(--font-sans)" fontWeight="600" textAnchor="middle">
        <textPath href={`#arc-${id}`} startOffset="50%">
          {title.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Ch05 · 18:10 · गंजीफ़ा, "Signature Experiences" (§6.6): six circular Ganjifa cards plus "Design
 * your own journey". Desktop (pinned ≈320vh, scrub 1, snapping to labels): deck → fan → each card rises,
 * flips to its back, holds and returns → the fan closes and the last card remains.
 * Compact: a swipe row, tap to flip. Reduced: a two-column list with both faces visible.
 * Both faces are always in the DOM; the back is the button's accessible description.
 */
export function Ganjifa() {
  const [flipped, setFlipped] = useState<number[]>([]);
  const mode = useStory((s) => s.mode);
  useEffect(() => setFlipped([]), [mode]);

  useChapterMotion("ganjifa", 50, (m) => {
    const { gsap, mode } = m;
    const el = document.getElementById("ch-ganjifa")!;
    riseHeading(m, el.querySelector("[data-rise]"));
    if (mode !== "desktop") return;
    const stage = el.querySelector<HTMLElement>(".gj-stage")!;
    const cards = gsap.utils.toArray<HTMLElement>("[data-gj-card]", el);
    const inners = cards.map((c) => c.querySelector<HTMLElement>(".gj-inner")!);
    // Phones: the cards are sized for reading when drawn (story.css), so the deck and fan sit at half size, fanned narrower
    const small = window.innerWidth < 1024;
    const base = small ? 0.5 : 1;
    const drawn = small ? 1 : 1.25;
    const spread = small ? 30 : 60;
    const fanAngle = (i: number) => -spread + (i * spread * 2) / (N - 1);
    const origin = "50% 240%"; // 140% below the card

    // Deck: stacked at the centre with tiny offsets
    cards.forEach((c, i) => gsap.set(c, { transformOrigin: origin, rotation: Math.sin(i * 7.3) * 3, x: Math.sin(i * 3.1) * 6, y: Math.cos(i * 5.7) * 6, scale: base, zIndex: i }));
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.addLabel("deck");
    tl.to(cards, { rotation: (i) => fanAngle(i), x: 0, y: 0, duration: 1, stagger: 0.02 });
    tl.addLabel("fan");
    for (let k = 0; k < exps.length; k++) {
      tl.to(cards[k], { rotation: 0, y: () => -window.innerHeight * 0.3, scale: drawn, zIndex: 50, duration: 0.6, ease: "power3.out" });
      tl.to(inners[k], { rotationY: 180, duration: 0.5 }, "<0.25");
      tl.addLabel(`draw${k}`);
      tl.to({}, { duration: 0.5 }); // hold on the back
      tl.to(inners[k], { rotationY: 0, duration: 0.4 });
      tl.to(cards[k], { rotation: fanAngle(k), y: 0, scale: base, zIndex: k, duration: 0.5 }, "<0.1");
    }
    tl.addLabel("closing");
    tl.to(cards, { rotation: 0, duration: 0.8 });
    tl.to(cards.slice(0, -1), { x: () => -window.innerWidth * 0.75, rotation: -12, duration: 0.9, stagger: 0.03, ease: "power2.in" }, ">-0.1");
    tl.to(cards[N - 1], { y: () => -window.innerHeight * 0.22, scale: small ? 1 : 1.2, duration: 0.7 }, "<0.3");
    tl.to(inners[N - 1], { rotationY: 180, duration: 0.5 }, "<0.2");
    tl.addLabel("close");

    const st = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${vhPx(PIN)()}`,
        pin: true,
        anticipatePin: 1,
        scrub: 1.2,
        snap: { snapTo: "labelsDirectional", duration: { min: 0.5, max: 1.1 }, delay: 0.25, ease: "power1.inOut" },
        invalidateOnRefresh: true,
        onToggle: (s) => stage.style.setProperty("will-change", s.isActive ? "transform" : "auto"),
      },
    });
    st.add(tl);
    labelScroll = (label) => {
      const t = st.scrollTrigger;
      if (!t) return null;
      return t.start + (t.end - t.start) * (tl.labels[label] / tl.duration());
    };
    return () => {
      labelScroll = null;
      gsap.set([...cards, ...inners], { clearProps: "all" });
    };
  });

  const toggle = (i: number) => {
    const y = labelScroll?.(i < exps.length ? `draw${i}` : "close");
    if (useStory.getState().mode === "desktop" && y != null) {
      const l = getLenis();
      if (l) l.scrollTo(y, { duration: 1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    setFlipped((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));
  };

  // Keyboard users who tab onto a back-face link get that card turned over
  const reveal = (i: number) => {
    if (useStory.getState().mode !== "desktop") setFlipped((f) => (f.includes(i) ? f : [...f, i]));
  };

  return (
    <Chapter id="ganjifa" pinned className="bg-paper overflow-hidden">
      <div className="gj-stage">
        <div className="wrap pt-[calc(var(--header-h)+5svh)] pb-8">
          <ChapterHead id="ganjifa" />
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <h2 id={chapterHeadingId("ganjifa")} className="t-h2 max-w-[16ch] lg:col-span-6" data-rise>
              {ganjifa.title}
            </h2>
            <p className="measure t-small text-fg-muted lg:col-span-4 lg:col-start-9 lg:self-end">{ganjifa.note}</p>
          </div>
        </div>

        <ul className="gj-row">
          {exps.map((e, i) => (
            <li key={e.slug} className={`gj-card ${flipped.includes(i) ? "is-flipped" : ""}`} data-gj-card>
              <div className="gj-lift">
                <div className="gj-inner">
                  <div className="gj-face gj-front">
                    <div className="gj-photo">
                      <Photo k={e.image} fill sizes="(min-width: 1024px) 280px, 60vw" compact decorative />
                    </div>
                    <Rim title={e.title} id={e.slug} />
                    <button type="button" className="absolute inset-0 rounded-full" aria-describedby={`gj-back-${i}`} aria-pressed={flipped.includes(i) || undefined} onClick={() => toggle(i)}>
                      <span className="sr-only">{e.title}</span>
                    </button>
                  </div>
                  <div className="gj-face gj-back" id={`gj-back-${i}`} onFocus={() => reveal(i)}>
                    <div>
                      <p className="t-label text-[#5c5248]">{e.label}</p>
                      <h3 className="t-h3 mt-3">{e.title}</h3>
                      <p className="t-small mt-2 text-[#5c5248]">{e.summary}</p>
                      <Link href={`/experiences/${e.slug}`} className="link mt-4 inline-block py-1 font-semibold text-[#8f3f1f]">
                        Discover →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          <li className={`gj-card ${flipped.includes(N - 1) ? "is-flipped" : ""}`} data-gj-card>
            <div className="gj-lift">
              <div className="gj-inner">
                <div className="gj-face gj-front grid place-items-center bg-[#2f4a6d]!">
                  <TrailDivider className="w-[46%] text-dune" />
                  <Rim title={ganjifa.ownCard.title} id="own" />
                  <button type="button" className="absolute inset-0 rounded-full" aria-describedby={`gj-back-${N - 1}`} onClick={() => toggle(N - 1)}>
                    <span className="sr-only">{ganjifa.ownCard.title}</span>
                  </button>
                </div>
                <div className="gj-face gj-back" id={`gj-back-${N - 1}`} onFocus={() => reveal(N - 1)}>
                  <div>
                    <p className="t-label text-[#5c5248]">{ganjifa.ownCard.label}</p>
                    <h3 className="t-h3 mt-3">{ganjifa.ownCard.title}</h3>
                    <p className="t-small mt-2 text-[#5c5248]">{ganjifa.ownCard.text}</p>
                    <EnquiryButton variant="text" className="mt-4 py-1 text-[#8f3f1f]">
                      {ganjifa.ownCard.cta}
                    </EnquiryButton>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Chapter>
  );
}
