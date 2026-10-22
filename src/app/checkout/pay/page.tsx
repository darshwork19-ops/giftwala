import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentStep } from "@/components/checkout/payment-step";
import { Skeleton } from "@/components/checkout/shared";

export const metadata: Metadata = { title: "Checkout · Payment" };

export default function PayPage() {
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <Suspense fallback={<Skeleton />}>
        <PaymentStep />
      </Suspense>
    </div>
  );
}
