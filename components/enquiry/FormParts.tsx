"use client";

import type { ReactNode } from "react";

/** Shared field parts for the enquiry forms (the drawer / inline form and the home hero form). */
export function ErrorText({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} aria-live="polite" className="mt-2 flex min-h-0 items-start gap-1.5 text-[0.875rem] text-terracotta-deep [.on-dark_&]:text-[#ffd9c7]">
      {msg && (
        <>
          <svg className="mt-[3px] shrink-0" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 3.6v4.2M7 9.6v.9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {msg}
        </>
      )}
    </p>
  );
}

export function Field({ id, label, error, filled, children }: { id: string; label: string; error?: string; filled?: boolean; children: ReactNode }) {
  return (
    <div>
      <div className={`field ${filled ? "filled" : ""} flex flex-col-reverse`} data-invalid={!!error}>
        {/* label after the control in DOM so `input:not(:placeholder-shown) + label` works; visually it floats above */}
        {children}
        <label htmlFor={id}>{label}</label>
      </div>
      <ErrorText id={`${id}-err`} msg={error} />
    </div>
  );
}

export function Stepper({ id, label, value, onChange, min, max, dark }: { id: string; label: string; value: number; onChange: (n: number) => void; min: number; max: number; dark: boolean }) {
  const btn = `grid size-11 place-items-center rounded-[2px] border text-lg leading-none transition-colors disabled:opacity-35 ${dark ? "border-ivory/40 hover:border-ivory" : "border-dune hover:border-ink"}`;
  return (
    <div role="group" aria-labelledby={`${id}-l`}>
      <span id={`${id}-l`} className={`mb-2 block text-[0.9375rem] ${dark ? "text-ivory/85" : "text-ink-muted"}`}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>
        <output id={id} aria-live="polite" className="tabular w-8 text-center text-xl">
          {value}
        </output>
        <button type="button" className={btn} aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}
