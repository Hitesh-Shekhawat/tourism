import "server-only";
import { business, isPlaceholder } from "@/content/business";
import { destinations } from "@/content/destinations";
import { budgetBands, FLEXIBLE } from "./options";
import type { EnquiryValues } from "./schema";

/* ── Config ─────────────────────────────────────────────────────────────────────────── */

export function deliveryConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from, replyTo: process.env.ENQUIRY_REPLY_TO_EMAIL || to };
}

/* ── Rate limit + idempotency (in-memory, per server instance) ──────────────────────────
 * Fine for a single Node server. On serverless/multi-instance hosting, swap these two maps
 * for a shared store (e.g. Upstash Redis) - see CHANGELOG.md. */

const hits = new Map<string, number[]>();
const RATE_WINDOW = 10 * 60_000;
const RATE_MAX = 5;

export function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t > RATE_WINDOW)) hits.delete(k);
  return list.length > RATE_MAX;
}

const idem = new Map<string, { ref: string; at: number } | "pending">();

export const idempotency = {
  get: (k: string) => idem.get(k),
  start: (k: string) => idem.set(k, "pending"),
  done: (k: string, ref: string) => idem.set(k, { ref, at: Date.now() }),
  fail: (k: string) => idem.delete(k),
  sweep() {
    const now = Date.now();
    for (const [k, v] of idem) if (v !== "pending" && now - v.at > 24 * 3600_000) idem.delete(k);
  },
};

/* ── Turnstile ──────────────────────────────────────────────────────────────────────── */

export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production"; // dev without keys: allowed; prod: refused
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body }).catch(() => null);
  if (!r?.ok) return false;
  const data = (await r.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

/* ── Reference ID ───────────────────────────────────────────────────────────────────── */

export function referenceId() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `ENQ-${ymd}-${rand}`;
}

/* ── Email ──────────────────────────────────────────────────────────────────────────── */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function summaryRows(v: EnquiryValues) {
  const month =
    v.month === FLEXIBLE
      ? "Flexible / not sure yet"
      : new Date(`${v.month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const dest = v.destinations.map((s) => destinations.find((d) => d.slug === s)?.name ?? s).join(", ");
  return [
    ["Journey", v.tour || "Tailor-made"],
    ["Destinations", dest || "Open to suggestions"],
    ["When", month],
    ["Travellers", `${v.adults} adult${v.adults === 1 ? "" : "s"}${v.children ? `, ${v.children} child${v.children === 1 ? "" : "ren"}` : ""}`],
    ["Budget", budgetBands.find((b) => b.value === v.budget)?.label ?? "Not given"],
    ["Name", v.name],
    ["Phone", v.phone ? `${v.phoneCode} ${v.phone}` : "Not given"],
    ["Email", v.email || "Not given"],
    ["Message", v.message || "None"],
  ] as const;
}

const table = (rows: readonly (readonly [string, string])[]) =>
  `<table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 Georgia,serif;color:#1e1a16">${rows
    .map(([k, val]) => `<tr><td style="color:#5c5248;vertical-align:top;padding-right:18px">${esc(k)}</td><td>${esc(val).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

async function resend(cfg: NonNullable<ReturnType<typeof deliveryConfig>>, msg: { to: string; subject: string; html: string; text: string; reply_to?: string }) {
  const r = await fetch(`${process.env.RESEND_API_BASE || "https://api.resend.com"}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: cfg.from, ...msg }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text().catch(() => "")}`);
}

export async function deliver(v: EnquiryValues, ref: string, page: string | undefined) {
  const cfg = deliveryConfig();
  if (!cfg) throw new Error("Enquiry delivery is not configured (RESEND_API_KEY / ENQUIRY_TO_EMAIL / ENQUIRY_FROM_EMAIL)");
  const rows = summaryRows(v);
  const text = rows.map(([k, val]) => `${k}: ${val}`).join("\n");

  // 1. Business notification: must succeed, or the guest is told honestly it failed.
  await resend(cfg, {
    to: cfg.to,
    subject: `New enquiry ${ref}: ${v.tour || "Tailor-made"} (${v.name})`,
    html: `<p style="font:15px Georgia,serif">Reference <b>${ref}</b>${page ? ` · sent from ${esc(page)}` : ""}</p>${table(rows)}`,
    text: `Reference ${ref}\n${text}`,
    ...(v.email ? { reply_to: v.email } : {}),
  });

  // 2. Optional CRM / Google Sheets (Apps Script) webhook. Failure is logged, not surfaced.
  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, page, receivedAt: new Date().toISOString(), ...v, consent: true, company: undefined }),
    }).catch((e) => console.error("[enquiry] webhook failed", ref, e));
  }

  // 3. Auto-reply to the guest. Failure is logged, not surfaced.
  if (v.email) {
    const brand = isPlaceholder(business.brandName) ? "us" : business.brandName;
    const when = isPlaceholder(business.responseTime) ? "shortly" : `within ${business.responseTime}`;
    await resend(cfg, {
      to: v.email,
      reply_to: cfg.replyTo,
      subject: `We have your enquiry (${ref})`,
      html: `<div style="font:16px/1.6 Georgia,serif;color:#1e1a16;max-width:560px"><p>Dear ${esc(v.name)},</p><p>Thank you for writing to ${esc(brand)}. We'll reply ${esc(when)} with a draft itinerary. Your reference is <b>${ref}</b>.</p><p>Here's what you sent us:</p>${table(rows)}<p>No payment is needed to enquire. Simply reply to this email if you'd like to add anything.</p></div>`,
      text: `Dear ${v.name},\n\nThank you for writing to ${brand}. We'll reply ${when} with a draft itinerary. Your reference is ${ref}.\n\n${text}\n\nNo payment is needed to enquire.`,
    }).catch((e) => console.error("[enquiry] auto-reply failed", ref, e));
  }
}
