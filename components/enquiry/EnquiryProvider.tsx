"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { EnquiryContext } from "@/lib/contact";

export type Prefill = { tour?: string; destinations?: string[]; month?: string; adults?: number };

type Ctx = {
  isOpen: boolean;
  open: (prefill?: Prefill) => void;
  close: () => void;
  /** Context of the current page (tour or destination) for WhatsApp messages and the bottom bar. */
  page: EnquiryContext;
  setPage: (c: EnquiryContext) => void;
  prefill: { value: Prefill; n: number };
};

const EnquiryCtx = createContext<Ctx | null>(null);

// The drawer (react-hook-form + zod) loads on first intent, then stays mounted so values survive closing.
const EnquiryDrawer = dynamic(() => import("./EnquiryDrawer"), { ssr: false });
const preload = () => void import("./EnquiryDrawer");

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState<EnquiryContext>({});
  const [prefill, setPrefill] = useState<{ value: Prefill; n: number }>({ value: {}, n: 0 });

  const open = useCallback((p?: Prefill) => {
    if (p) setPrefill((s) => ({ value: p, n: s.n + 1 }));
    setMounted(true);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Warm the drawer chunk on the first pointer/keyboard intent anywhere, so the first open is instant.
  useEffect(() => {
    const warm = () => preload();
    window.addEventListener("pointerover", warm, { once: true, passive: true });
    window.addEventListener("keydown", warm, { once: true });
    return () => {
      window.removeEventListener("pointerover", warm);
      window.removeEventListener("keydown", warm);
    };
  }, []);

  const value = useMemo(() => ({ isOpen, open, close, page, setPage, prefill }), [isOpen, open, close, page, prefill]);

  return (
    <EnquiryCtx.Provider value={value}>
      {children}
      {mounted && <EnquiryDrawer />}
    </EnquiryCtx.Provider>
  );
}

export function useEnquiry() {
  const c = useContext(EnquiryCtx);
  if (!c) throw new Error("useEnquiry outside EnquiryProvider");
  return c;
}

/** Drop into a page to set its enquiry context (tour / destination). */
export function SetEnquiryContext({ tour, destination }: EnquiryContext) {
  const { setPage } = useEnquiry();
  useEffect(() => {
    setPage({ tour, destination });
    return () => setPage({});
  }, [tour, destination, setPage]);
  return null;
}
