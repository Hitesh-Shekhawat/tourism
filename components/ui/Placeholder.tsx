import type { ReactNode } from "react";
import { showPlaceholders } from "@/lib/content-flags";

/**
 * A labelled stand-in for missing content: "Placeholder: replace with …". Development only; in a
 * production build it renders nothing, so the block around it should also be gated with canShow().
 */
export function Placeholder({ what, className = "", children, dark = false }: { what: string; className?: string; children?: ReactNode; dark?: boolean }) {
  if (!showPlaceholders) return null;
  return (
    <div className={`ph-block ${dark ? "ph-block-dark" : ""} ${className}`} role="note">
      <span className="ph-block-label">Placeholder: replace with {what}</span>
      {children && <span className="ph-block-note">{children}</span>}
    </div>
  );
}
