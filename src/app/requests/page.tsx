import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestStatusView } from "@/components/request/request-status";

export const metadata: Metadata = {
  title: "Your order requests",
  robots: { index: false },
};

export default function RequestsPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-linen" />}>
        <RequestStatusView />
      </Suspense>
    </div>
  );
}
