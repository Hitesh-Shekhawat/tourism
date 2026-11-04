import { Fraunces, Instrument_Sans, Tiro_Devanagari_Hindi, Yatra_One } from "next/font/google";

// Four font files (§3.2 budget: five). Fraunces variable roman with opsz + SOFT (headlines settle
// from SOFT 0 to 100), Fraunces italic (pull quotes), Instrument Sans variable, Tiro Devanagari
// (Devanagari subset only). Only the display roman is preloaded: the Ch00 headline is the LCP.
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal"],
  display: "swap",
  variable: "--font-fraunces",
  preload: true,
});

// Italic (pull quotes, catalogue numerals) without the opsz/SOFT axes: a third of the file size
export const frauncesItalic = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
  variable: "--font-fraunces-italic",
  preload: false,
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
  preload: false,
});

export const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  display: "swap",
  variable: "--font-tiro",
  preload: false,
});

// Brush-lettered Devanagari for the hero wordmark only (components/homepage/RajasthanWordmark.tsx).
// Devanagari subset, one weight, preloaded because the wordmark is part of the hero h1.
export const yatra = Yatra_One({
  subsets: ["devanagari"],
  weight: "400",
  display: "swap",
  variable: "--font-yatra",
  preload: true,
});
