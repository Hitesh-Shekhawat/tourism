/**
 * Motion tokens (§2): the only durations and curves the site animates with. CSS reads the same
 * values from styles/tokens.css (--dur-ui, --dur-reveal, --dur-hero, --ease-out, --ease-in-out).
 * No bounce or elastic easing anywhere.
 */
export const DUR = { ui: 0.2, reveal: 0.6, hero: 1.0, section: 1.2 } as const;
export const EASE = { out: "cubic-bezier(.22,1,.36,1)", inOut: "cubic-bezier(.65,0,.35,1)" } as const;
/** GSAP equivalents of EASE (GSAP's CustomEase isn't shipped; these are visually indistinguishable). */
export const GSAP_EASE = { out: "expo.out", inOut: "power2.inOut" } as const;
export const STAGGER = 0.06;

/** Breakpoints shared by gsap.matchMedia: horizontal choreography only on wide, motion-allowed screens. */
export const MQ_MOTION = {
  wide: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  narrow: "(max-width: 1023px)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;
