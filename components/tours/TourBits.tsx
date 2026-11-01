import type { Tour } from "@/content/tours";
import { OwnerBlock } from "@/components/ui/bits";

export const nightsDays = (t: Tour) => `${t.durationNights} nights · ${t.durationDays} days`;
export const routeLine = (t: Tour) => t.route.join(" — ");

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** "From ₹… per person (twin sharing)" only if supplied; otherwise "Price on request". Never invented. */
export function Price({ t, className = "" }: { t: Tour; className?: string }) {
  return t.priceFromINR ? (
    <p className={className}>
      <span className="t-small text-ink-muted">From </span>
      <span className="tabular font-display text-[1.75rem] leading-none">₹{inr.format(t.priceFromINR)}</span>
      <span className="t-small text-ink-muted"> {t.priceBasis ?? "per person (twin sharing)"}</span>
    </p>
  ) : (
    <p className={`font-display text-[1.375rem] leading-none ${className}`}>Price on request</p>
  );
}

/** Sample tours ship with a visible notice that blocks a production build until confirmed. */
export function DraftNotice({ t, className = "" }: { t: Tour; className?: string }) {
  if (!t.draft) return null;
  return (
    <OwnerBlock className={className}>
      Sample itinerary written for the template. Confirm or replace the route, days, inclusions and price in <code className="font-mono text-[0.8em]">content/tours/{t.slug}.ts</code>, then set <code className="font-mono text-[0.8em]">draft: false</code>.
    </OwnerBlock>
  );
}
