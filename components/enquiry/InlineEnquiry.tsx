"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useEnquiry } from "./EnquiryProvider";

const EnquiryForm = dynamic(() => import("./EnquiryForm").then((m) => m.EnquiryForm), { ssr: false, loading: () => <Skeleton /> });

function Skeleton() {
  return <div className="min-h-[640px]" aria-hidden="true" />;
}

/** The full enquiry form, embedded in a page. Its code loads only as it nears the viewport. */
export function InlineEnquiry({ dark = false, tour }: { dark?: boolean; tour?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const { page } = useEnquiry();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-no-float>
      {near ? <EnquiryForm dark={dark} context={{ ...page, tour: tour ?? page.tour }} prefill={tour ? { value: { tour }, n: 1 } : undefined} idPrefix="inline" /> : <Skeleton />}
    </div>
  );
}
