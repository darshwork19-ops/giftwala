import type { Metadata } from "next";
import { Suspense } from "react";
import { FinderResults } from "@/components/finder/finder-results";

export const metadata: Metadata = {
  title: "Gift Finder",
  description:
    "Describe the person you're buying for and get gifts and gift ideas that fit them, your budget and your date.",
};

export default function GiftFinderPage() {
  return (
    <div className="page-container pt-12 pb-20 sm:pt-16">
      <p className="mb-4 text-sm tracking-wide text-muted">Gift Finder</p>
      <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
        Tell us about them. <span className="text-burgundy italic">We&apos;ll find gifts that fit.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-muted">
        Matching gifts from the GIFTWALA catalogue, online shops and Mumbai makers, plus clearly labelled ideas
        to look for elsewhere. Delivery is only checked when you give a Mumbai area or PIN and a date. GIFTWALA
        listings and their makers are sample data for this demo.
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-[1.25rem] bg-linen" />}>
          <FinderResults />
        </Suspense>
      </div>
    </div>
  );
}
