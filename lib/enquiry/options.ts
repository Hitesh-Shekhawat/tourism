/** Option lists shared by the plan-trip bar and the enquiry form. No zod here: this ships in the hero bar. */

export const FLEXIBLE = "flexible";

export function monthOptions(count = 18, from = new Date()) {
  const out: { value: string; label: string }[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let i = 0; i < count; i++) {
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

export const budgetBands = [
  { value: "", label: "Prefer not to say" },
  { value: "under-50k", label: "Under ₹50,000 per person" },
  { value: "50k-1l", label: "₹50,000 – ₹1,00,000 per person" },
  { value: "1l-2l", label: "₹1,00,000 – ₹2,00,000 per person" },
  { value: "2l-plus", label: "Above ₹2,00,000 per person" },
];

export const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+353", label: "Ireland (+353)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+86", label: "China (+86)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+94", label: "Sri Lanka (+94)" },
];
