"use client";

/**
 * GA4 events (§7.2). gtag is only loaded after consent (components/analytics/Consent.tsx);
 * before that, track() is a no-op.
 */
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
    fbq?: Gtag;
  }
}

export type EventName = "form_start" | "generate_lead" | "whatsapp_click" | "phone_click" | "email_click" | "view_itinerary" | "chapter_view" | "sheet_open";

export function track(name: EventName, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  if (name === "generate_lead") window.fbq?.("track", "Lead");
}
