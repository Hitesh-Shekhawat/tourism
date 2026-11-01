/**
 * Business facts (§0 of the brief). Every value still wrapped in {{ }} is unfilled.
 * Replace the whole string, braces included, with the real value. Never invent one.
 * `npm run placeholders` regenerates BUSINESS_INFO_REQUIRED.md from what is left.
 */
export const business = {
  brandName: "{{BRAND_NAME}}",
  tagline: "{{TAGLINE}}",
  phone: "{{PHONE}}", // display format, e.g. "+91 98765 43210"
  whatsappNumber: "{{WHATSAPP_NUMBER}}", // digits only, e.g. "919876543210"
  email: "{{EMAIL}}",
  address: {
    street: "{{OFFICE_ADDRESS_STREET}}",
    city: "{{OFFICE_CITY}}",
    region: "Rajasthan",
    postalCode: "{{PIN}}",
    country: "IN",
  },
  googleMapsUrl: "{{GOOGLE_MAPS_URL}}",
  /** Optional embed URL for the contact-page map facade (Google Maps → Share → Embed a map → src). */
  googleMapsEmbedUrl: "{{GOOGLE_MAPS_EMBED_URL}}",
  gstin: "{{GSTIN}}", // set to "" if not applicable

  /** Real approvals only, each with its registration number. Leave the array empty if there are none. */
  approvals: [] as { name: string; number: string; logo?: string }[],
  yearsInOperation: "{{YEARS_IN_OPERATION}}",
  responseTime: "{{RESPONSE_TIME_PROMISE}}", // e.g. "4 working hours"
  officeHours: "{{OFFICE_HOURS}}", // e.g. "Mon–Sat, 9:30–19:00 IST"
  /** schema.org openingHours, e.g. ["Mo-Sa 09:30-19:00"]. Leave empty until confirmed. */
  openingHoursSchema: [] as string[],
  /** Real accounts only. Remove a key rather than leaving a fake URL. */
  social: {} as Partial<Record<"instagram" | "facebook" | "youtube", string>>,
  googleReviewsUrl: "{{GOOGLE_REVIEWS_URL}}",
  /** One-line statement for the footer. */
  brandStatement: "{{BRAND_STATEMENT}}",
};

export const isPlaceholder = (v: string | undefined | null) => !v || /\{\{.*\}\}/.test(v);

export const whatsappDigits = () => (isPlaceholder(business.whatsappNumber) ? null : business.whatsappNumber.replace(/\D/g, ""));
