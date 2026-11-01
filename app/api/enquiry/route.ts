import { NextResponse } from "next/server";
import { deliver, deliveryConfig, idempotency, rateLimited, referenceId, verifyTurnstile } from "@/lib/enquiry/server";
import { enquiryRequestSchema, type EnquiryResponse } from "@/lib/enquiry/schema";

const UNAVAILABLE = "We couldn't send this right now. Please WhatsApp or call us.";

const reply = (body: EnquiryResponse, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

  if (rateLimited(ip)) {
    return reply({ ok: false, reason: "rate_limited", message: "That's a few enquiries in a short time. Please wait a few minutes, or WhatsApp us." }, 429);
  }

  const json = await req.json().catch(() => null);
  const parsed = enquiryRequestSchema.safeParse(json);
  if (!parsed.success) {
    return reply({ ok: false, reason: "invalid", message: "Some details need another look." }, 400);
  }
  const { values, idempotencyKey, turnstileToken, page } = parsed.data;

  // Honeypot filled: a bot. Answer like a success, send nothing.
  if (values.company) return reply({ ok: true, ref: referenceId() });

  // Duplicate submit (double click, retry after a dropped response): return the first result.
  idempotency.sweep();
  const seen = idempotency.get(idempotencyKey);
  if (seen && seen !== "pending") return reply({ ok: true, ref: seen.ref });
  if (seen === "pending") return reply({ ok: false, reason: "unavailable", message: "Still sending your enquiry. One moment." }, 409);

  // Honesty rule (§7.2): without delivery configured, never show success.
  if (!deliveryConfig()) {
    console.error("[enquiry] delivery not configured: set RESEND_API_KEY, ENQUIRY_TO_EMAIL and ENQUIRY_FROM_EMAIL");
    return reply({ ok: false, reason: "unavailable", message: UNAVAILABLE }, 503);
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    if (!process.env.TURNSTILE_SECRET_KEY) console.error("[enquiry] TURNSTILE_SECRET_KEY missing in production");
    return reply({ ok: false, reason: "verification", message: "We couldn't verify this submission. Please try again, or WhatsApp us." }, 400);
  }

  idempotency.start(idempotencyKey);
  const ref = referenceId();
  try {
    await deliver(values, ref, page);
    idempotency.done(idempotencyKey, ref);
    return reply({ ok: true, ref });
  } catch (e) {
    idempotency.fail(idempotencyKey);
    console.error("[enquiry] delivery failed", ref, e);
    return reply({ ok: false, reason: "unavailable", message: UNAVAILABLE }, 502);
  }
}
