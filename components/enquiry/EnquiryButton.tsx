"use client";

import type { ReactNode } from "react";
import { Arrow } from "@/components/ui/bits";
import { useEnquiry, type Prefill } from "./EnquiryProvider";

/** Any CTA that opens the enquiry drawer, optionally pre-filled. */
export function EnquiryButton({
  children,
  prefill,
  variant = "primary",
  className = "",
  arrow = true,
}: {
  children: ReactNode;
  prefill?: Prefill;
  variant?: "primary" | "secondary" | "text";
  className?: string;
  arrow?: boolean;
}) {
  const { open } = useEnquiry();
  const cls = variant === "text" ? `link inline-flex items-center gap-2 font-semibold ${className}` : `btn btn-${variant} ${className}`;
  return (
    <button type="button" aria-haspopup="dialog" className={cls} onClick={() => open(prefill)}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
