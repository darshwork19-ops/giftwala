import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewStep } from "@/components/checkout/review-step";
import { Skeleton } from "@/components/checkout/shared";

export const metadata: Metadata = { title: "Checkout · Review" };

export default function ReviewPage() {
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <Suspense fallback={<Skeleton />}>
        <ReviewStep />
      </Suspense>
    </div>
  );
}
