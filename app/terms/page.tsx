import type { Metadata } from "next";
import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms",
  description: "The terms that apply when you plan and book a journey with us.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
