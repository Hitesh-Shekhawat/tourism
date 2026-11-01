import type { Metadata } from "next";
import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Cancellation & Refund Policy",
  description: "Cancellation charges, refunds and how to change a booking.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return <LegalPage doc="cancellation-policy" />;
}
