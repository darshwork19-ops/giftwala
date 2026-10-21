import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

// Clean, warm sans for body text and controls
const bodySans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

// Refined editorial serif for headlines
const displaySerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "GIFTWALA — Know the person. Find the gift that feels like them.",
    template: "%s · GIFTWALA",
  },
  description:
    "Recipient-first gift discovery: describe the person you're buying for and find gifts that fit their interests, from independent makers and beyond.",
  applicationName: "GIFTWALA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bodySans.variable} ${displaySerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-burgundy focus:shadow-soft"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
