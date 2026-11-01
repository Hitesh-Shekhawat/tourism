import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Analytics } from "@/components/analytics/Analytics";
import { EnquiryProvider } from "@/components/enquiry/EnquiryProvider";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Splash } from "@/components/layout/Splash";
import { Motion } from "@/components/motion/Motion";
import { ArchDefs } from "@/components/ui/Arch";
import { business } from "@/content/business";
import { siteUrl } from "@/content/site";
import { validateContent } from "@/content/validate";
import { motionBootScript } from "@/lib/story/boot";
import "@/styles/globals.css";
import { fraunces, frauncesItalic, instrument, tiro } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `Private journeys across Rajasthan · ${business.brandName}`, template: `%s · ${business.brandName}` },
  description: "Unhurried private journeys through Rajasthan's forts, lakes and desert: Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar and Bikaner.",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f1e6",
  width: "device-width",
  initialScale: 1,
};

// Fails the build (and dev render) if content/day.json or the typed content drift from their schemas
validateContent();

export default function RootLayout({ children, sheet }: { children: React.ReactNode; sheet: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en-GB" className={`${fraunces.variable} ${frauncesItalic.variable} ${instrument.variable} ${tiro.variable}`} suppressHydrationWarning>
        <head>
          {/* Pre-paint: html.js, html[data-motion] and the splash flag, so no layout variant flashes */}
          <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        </head>
        <body>
          <Splash />
          <a href="#main" className="sr-only z-[100] bg-ink px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Skip to content
          </a>
          <ArchDefs />
          <EnquiryProvider>
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            {sheet}
            <FloatingContact />
            <Analytics />
            <Motion />
          </EnquiryProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
