"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires the view_itinerary analytics event once per tour page view. */
export function ViewItinerary({ tour }: { tour: string }) {
  useEffect(() => track("view_itinerary", { tour }), [tour]);
  return null;
}
