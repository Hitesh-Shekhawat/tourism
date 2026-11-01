"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "consent.analytics";

function loadGa() {
  if (!GA_ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() {
    // gtag needs the real `arguments` object
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // Consent Mode v2: default denied, then granted for analytics only (no ads storage).
  window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/**
 * GA4 loads only after the visitor accepts (§7.2). Without NEXT_PUBLIC_GA_ID there is
 * no banner and no tracking at all. Contact-link clicks are tracked by delegation.
 */
export function Analytics() {
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    let choice: string | null = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {}
    if (choice === "granted") loadGa();
    else if (choice !== "denied") setAsk(true);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("https://wa.me/")) track("whatsapp_click", { page: location.pathname });
      else if (href.startsWith("tel:")) track("phone_click", { page: location.pathname });
      else if (href.startsWith("mailto:")) track("email_click", { page: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const decide = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    if (v === "granted") loadGa();
    setAsk(false);
  };

  if (!ask) return null;
  return (
    <div data-consent-banner role="region" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-[60] border border-brass/45 bg-ivory p-5 shadow-[0_10px_40px_-12px_rgb(30_26_22/.35)] sm:right-auto sm:left-5 sm:max-w-md">
      <p className="t-small">
        We'd like to use analytics cookies to understand which pages help travellers plan. Nothing is set unless you agree.{" "}
        <a href="/privacy" className="prose-link">
          Privacy policy
        </a>
      </p>
      <div className="mt-4 flex gap-3">
        <button type="button" className="btn btn-primary min-h-11! flex-1 px-4!" onClick={() => decide("granted")}>
          Accept
        </button>
        <button type="button" className="btn btn-secondary min-h-11! flex-1 px-4!" onClick={() => decide("denied")}>
          Decline
        </button>
      </div>
    </div>
  );
}
