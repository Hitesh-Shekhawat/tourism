import type { Metadata } from "next";
import { LegalPage } from "@/components/page/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description: "How we collect, use and protect the details you share with us.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
