import { z } from "zod";

/** One schema, used by the form (client) and the API route (server). */
export const enquirySchema = z
  .object({
    destinations: z.array(z.string().max(60)).max(12),
    tour: z.string().max(120),
    month: z.string().min(1, "Choose a month, or “Not sure yet”").max(20),
    adults: z.number({ message: "Enter a number" }).int().min(1, "At least one adult").max(40),
    children: z.number({ message: "Enter a number" }).int().min(0).max(30),
    budget: z.string().max(20),
    name: z.string().trim().min(2, "Please tell us your name").max(100, "That's a little long"),
    phoneCode: z.string().regex(/^\+\d{1,4}$/, "Choose a country code"),
    phone: z.union([z.literal(""), z.string().trim().regex(/^[\d\s()-]{6,20}$/, "Enter a valid phone number, digits only")]),
    email: z.union([z.literal(""), z.email("Enter a valid email address").max(200)]),
    message: z.string().max(2000, "Please keep it under 2,000 characters"),
    consent: z.boolean().refine((v) => v, "Please agree so we can contact you"),
    /** Honeypot: real people never see or fill this. The API accepts it silently and sends nothing. */
    company: z.string().max(500).optional(),
  })
  .refine((d) => d.phone.trim() !== "" || d.email.trim() !== "", {
    path: ["phone"],
    message: "Add a phone number or an email so we can reply",
  });

export type EnquiryValues = z.infer<typeof enquirySchema>;

export const step1Fields = ["destinations", "tour", "month", "adults", "children", "budget"] as const;
export const step2Fields = ["name", "phoneCode", "phone", "email", "message", "consent"] as const;

export const enquiryDefaults: EnquiryValues = {
  destinations: [],
  tour: "",
  month: "",
  adults: 2,
  children: 0,
  budget: "",
  name: "",
  phoneCode: "+91",
  phone: "",
  email: "",
  message: "",
  consent: false,
  company: "",
};

/** Envelope posted to /api/enquiry. */
export const enquiryRequestSchema = z.object({
  values: enquirySchema,
  idempotencyKey: z.string().regex(/^[a-zA-Z0-9-]{16,64}$/),
  turnstileToken: z.string().max(4096).optional(),
  page: z.string().max(300).optional(),
});

export type EnquiryResponse = { ok: true; ref: string } | { ok: false; reason: "invalid" | "rate_limited" | "verification" | "unavailable"; message: string };
