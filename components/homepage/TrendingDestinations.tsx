"use client";

import dynamic from "next/dynamic";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { AtlasAnchor } from "@/components/explorer/AtlasAnchor";
import { useSectionMotion } from "@/components/homepage/HomeMotion";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow, Check } from "@/components/ui/bits";
import { assets } from "@/content/assets";
import { getPlace, placeLinks, type Place } from "@/content/explorer";
import { imageSources } from "@/content/imageSources";
import { getLenis } from "@/lib/smooth";
import { useStory } from "@/lib/story/store";
import type { TrainProgress } from "./LuxuryTrainScene";

const route = ["jaipur", "jodhpur", "udaipur", "jaisalmer", "pushkar", "bikaner", "mount-abu"];
const stops = route.map((id) => getPlace(id)!);
const stopPhotos = stops.map((place) => {
  const source = imageSources[place.image] ?? assets[place.image].src;
  const path = typeof source === "string" ? source : source?.src;
  return path ? `/_next/image?url=${encodeURIComponent(path)}&w=640&q=65` : null;
});
const STOP_COUNT = stops.length;
const STAGE_COUNT = STOP_COUNT + 2;

const LuxuryTrainScene = dynamic(
  () => import("./LuxuryTrainScene").then((module) => module.LuxuryTrainScene),
  { ssr: false, loading: () => <TrainPoster /> },
);

function PlaceLink({ place, children, className }: { place: Place; children: ReactNode; className: string }) {
  const { itinerary, destination } = placeLinks(place);
  const href = itinerary ?? destination;
  return href ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <AtlasAnchor state={place.state} place={place.id} className={className}>{children}</AtlasAnchor>
  );
}

function TrainPoster() {
  return (
    <div className="train-poster" aria-label="Rajasthan destinations from Jaipur to Mount Abu">
      <Photo k="placeJaisalmer" fill sizes="(min-width: 1024px) 68vw, 100vw" decorative />
      <span className="train-poster-shade" />
      <span className="train-poster-copy">
        <span className="t-label">The royal train · Rajasthan</span>
        <span className="font-display">Jaipur <i>—</i> Jodhpur <i>—</i> Udaipur <i>—</i> Jaisalmer <i>—</i> Pushkar <i>—</i> Bikaner <i>—</i> Mount Abu</span>
      </span>
    </div>
  );
}

function highlights(place: Place) {
  const values = place.attractions.slice(0, 3).map((sight) => sight.name);
  if (values.length < 3) values.push(place.epithet);
  return values;
}

function MobileStop({ place, index }: { place: Place; index: number }) {
  return (
    <article className="train-mobile-card">
      <div className="train-mobile-photo">
        <Photo k={place.image} fill sizes="(min-width: 640px) 85vw, 100vw" decorative />
      </div>
      <div className="train-mobile-copy">
        <p className="t-label train-info-label">Journey {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> Destination {String(index + 1).padStart(2, "0")}</p>
        <h3 className="train-info-title font-display">{place.name}</h3>
        <p className="train-info-epithet">{place.epithet}</p>
        <p className="train-info-summary">{place.summary}</p>
        <ul className="train-info-highlights" aria-label={`Highlights in ${place.name}`}>
          {highlights(place).map((sight, index) => (
            <li key={index}><Check /> {sight}</li>
          ))}
        </ul>
        <PlaceLink place={place} className="train-explore">
          Explore {place.name} <Arrow />
        </PlaceLink>
      </div>
    </article>
  );
}

/** A pinned R3F train traverse on larger screens; mobile keeps a full-train view and natural stops. */
export function TrendingDestinations({ n }: { n: string }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef<TrainProgress>({ value: 0 });
  const trigger = useRef<ScrollTrigger | null>(null);
  const mobileStops = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [inView, setInView] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [staticScene, setStaticScene] = useState(false);
  const mode = useStory((state) => state.mode);

  const setStage = (value: number) => {
    progress.current.value = value;
    const next = value < 1 / STAGE_COUNT
      ? -1
      : Math.min(STOP_COUNT - 1, Math.floor(value * STAGE_COUNT) - 2);
    setActive((current) => current === next ? current : next);
  };

  useSectionMotion(root, ({ gsap }, section) => {
    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      const tween = gsap.to(progress.current, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 1024 ? 4.1 : 4.8))}`,
          pin: section,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setStage(self.progress),
          onRefresh: (self) => setStage(self.progress),
          onLeaveBack: () => setStage(0),
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      return () => {
        trigger.current = null;
        progress.current.value = 0;
        setActive(-1);
      };
    });
    return () => media.revert();
  });

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "320px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const compact = window.matchMedia("(max-width: 1023px)").matches;
      const fewCores = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) < 6;
      setLowPower(compact || fewCores);
      setStaticScene(window.matchMedia("(max-width: 767px)").matches || mode === "reduced");
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [mode]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const sync = () => {
      observer?.disconnect();
      observer = null;
      if (window.matchMedia("(min-width: 768px)").matches && mode !== "reduced") return;
      progress.current.value = 1;
      const nodes = mobileStops.current.filter((node): node is HTMLLIElement => !!node);
      if (!nodes.length) return;
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stopIndex);
        if (Number.isInteger(index)) setActive(index);
      }, { threshold: [0.35, 0.6, 0.8], rootMargin: "-15% 0px -25% 0px" });
      nodes.forEach((node) => observer?.observe(node));
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [mode]);

  const goToStage = (index: number) => {
    const activeTrigger = trigger.current;
    if (activeTrigger && index >= 0) {
      const value = (index + 2) / STAGE_COUNT;
      const y = activeTrigger.start + value * (activeTrigger.end - activeTrigger.start);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    if (index < 0 && activeTrigger) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(activeTrigger.start, { duration: 0.9 });
      else window.scrollTo({ top: activeTrigger.start, behavior: "smooth" });
      return;
    }
    if (index >= 0) mobileStops.current[index]?.scrollIntoView({ behavior: mode === "reduced" ? "auto" : "smooth", block: "center" });
  };

  return (
    <section ref={root} id="trending" aria-label="Seven places to begin" className="sec train-section">
      <div className="train-journey">
        <div className="wrap train-heading">
          <SectionHeading
            n={n}
            label="The Rajasthan railway"
            id="trending-title"
            title="Seven places to begin."
            note="A royal passage through the cities, lakes and desert landscapes of Rajasthan."
            dark
          />
        </div>

        <div className="train-main">
          <div className="train-scene-frame" aria-label="Interactive three-dimensional royal train">
            {inView ? (
              <LuxuryTrainScene
                progress={progress.current}
                active={active}
                stops={stops}
                photos={stopPhotos}
                onSelectStop={goToStage}
                lowPower={lowPower}
                staticScene={staticScene}
                fallback={<TrainPoster />}
              />
            ) : (
              <TrainPoster />
            )}
            <p className="train-scene-kicker" aria-hidden="true">Engine <span>←</span> Jaipur · Jodhpur · Udaipur · Jaisalmer · Pushkar · Bikaner · Mount Abu</p>
          </div>

        </div>

        <nav className="train-progress" aria-label="Train journey destinations">
          <span className="train-progress-caption t-label">Journey stops</span>
          {stops.map((place, index) => (
            <button
              key={place.id}
              type="button"
              className={`train-progress-stop ${active === index ? "is-active" : ""}`}
              aria-label={`Go to destination ${String(index + 1).padStart(2, "0")}: ${place.name}`}
              aria-pressed={active === index}
              onClick={() => goToStage(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="train-progress-name">{place.name}</span>
            </button>
          ))}
          <div className="train-progress-line" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0, (active + 1) / STOP_COUNT)})` }} /></div>
        </nav>
      </div>

      <ol className="train-mobile-stops" aria-label="Destination details">
        {stops.map((place, index) => (
          <li
            key={place.id}
            ref={(node) => { mobileStops.current[index] = node; }}
            className="train-mobile-stop"
            data-stop-index={index}
          >
            <MobileStop place={place} index={index} />
          </li>
        ))}
      </ol>
    </section>
  );
}
