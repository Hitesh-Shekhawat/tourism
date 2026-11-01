import { business, isPlaceholder } from "@/content/business";

/**
 * Typographic wordmark until the owner supplies a logo. While BRAND_NAME is unfilled it shows
 * the placeholder itself (§0: blanks stay visible).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  const name = business.brandName;
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg width="20" height="26" viewBox="0 0 20 26" aria-hidden="true" className="shrink-0 text-brass">
        <path d="M1 25V10.5C1 5.5 5.5 2.6 10 1c4.5 1.6 9 4.5 9 9.5V25" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 25v-11c0-2.4 2.2-4 5-5.2 2.8 1.2 5 2.8 5 5.2v11" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {isPlaceholder(name) ? (
        <span className="ph-inline text-[0.8125rem]">{name}</span>
      ) : (
        <span className="font-display text-[1.5rem] leading-none font-semibold tracking-[-0.01em]">{name}</span>
      )}
    </span>
  );
}
