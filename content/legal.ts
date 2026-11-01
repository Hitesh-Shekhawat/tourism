/**
 * Legal pages. The owner supplies the text (ideally reviewed by a lawyer). Each page renders
 * its sections; while `sections` is null it shows an "Owner to supply" block, which fails the
 * production build.
 */
export type LegalDoc = { title: string; updated: string | null; sections: { heading: string; body: string[] }[] | null };

export const legal: Record<"privacy" | "terms" | "cancellation-policy", LegalDoc> = {
  privacy: { title: "Privacy Policy", updated: null, sections: null },
  terms: { title: "Terms", updated: null, sections: null },
  "cancellation-policy": { title: "Cancellation & Refund Policy", updated: null, sections: null },
};
