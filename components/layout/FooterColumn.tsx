"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

/**
 * A footer column: an accordion below 1024px (button + aria-expanded). From 1024px it is always open
 * and its title is a plain heading, so no toggle claims to be collapsed while its links are visible.
 */
export function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const id = useId();
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="border-b border-[var(--line-dark)] lg:border-0">
      <h2 className="t-label text-ivory/70 lg:mb-5">
        {desktop ? (
          title
        ) : (
          <button type="button" className="flex min-h-12 w-full items-center justify-between text-left tracking-[inherit] uppercase" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
            {title}
            <svg className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`} width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        )}
      </h2>
      <div id={id} className={`${open ? "block" : "hidden"} pb-5 lg:block lg:pb-0`}>
        {children}
      </div>
    </div>
  );
}
