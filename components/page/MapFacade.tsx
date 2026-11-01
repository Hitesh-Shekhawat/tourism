"use client";

import { useState } from "react";
import { business, isPlaceholder } from "@/content/business";
import { OwnerBlock } from "@/components/ui/bits";

/** Click-to-load map (§11): no Google Maps requests until the visitor asks. */
export function MapFacade() {
  const [show, setShow] = useState(false);
  const embed = business.googleMapsEmbedUrl;
  const link = business.googleMapsUrl;

  if (isPlaceholder(embed)) {
    return <OwnerBlock>Google Maps embed URL ({embed}) and the share link ({link}).</OwnerBlock>;
  }
  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-brass/50 bg-sandstone">
      {show ? (
        <iframe src={embed} title="Map to our office" className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <button type="button" className="btn btn-secondary" onClick={() => setShow(true)}>
              Show map
            </button>
            <p className="t-small mt-3 text-ink-muted">Loads Google Maps, which may set cookies.</p>
            {!isPlaceholder(link) && (
              <a href={link} className="prose-link t-small mt-2 inline-block" target="_blank" rel="noopener">
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
