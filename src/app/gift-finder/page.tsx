import type { Metadata } from "next";
import { Suspense } from "react";
import { FinderResults } from "@/components/finder/finder-results";

export const metadata: Metadata = {
  title: "Gift Finder",
  description:
    "Describe the person you're buying for and get three handmade gifts from Mumbai makers that fit your budget and can arrive in time.",
};

export default function GiftFinderPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <p className="eyebrow mb-3">Gift Finder</p>
      <h1 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Tell us about them. We&apos;ll find three gifts.
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Every suggestion fits your budget, can reach their Mumbai area by your date, and comes from an
        independent maker. Makers and gifts here are sample data for this demo.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-linen" />}>
          <FinderResults />
        </Suspense>
      </div>
    </div>
  );
}
