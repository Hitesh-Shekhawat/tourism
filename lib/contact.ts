import { business, isPlaceholder, whatsappDigits } from "@/content/business";

export type EnquiryContext = { tour?: string; destination?: string };

export function whatsappMessage(ctx: EnquiryContext = {}) {
  const about = ctx.tour ? ` the "${ctx.tour}" journey` : ctx.destination ? ` a trip to ${ctx.destination}` : " a trip to Rajasthan";
  return `Hello, I'd like to ask about${about}.`;
}

/**
 * wa.me link with a pre-filled message. Without a configured number, wa.me still opens WhatsApp
 * and lets the guest pick a chat, so the link never dead-ends; BUSINESS_INFO_REQUIRED.md lists
 * the missing number.
 */
export function whatsappHref(ctx: EnquiryContext = {}) {
  const n = whatsappDigits();
  return `https://wa.me/${n ?? ""}?text=${encodeURIComponent(whatsappMessage(ctx))}`;
}

/** WhatsApp buttons render only when the business number is configured (enhancement brief §3 · 09). */
export const hasWhatsApp = () => whatsappDigits() !== null;

export const telHref = () => (isPlaceholder(business.phone) ? null : `tel:${business.phone.replace(/[^\d+]/g, "")}`);
export const mailHref = () => (isPlaceholder(business.email) ? null : `mailto:${business.email}`);
