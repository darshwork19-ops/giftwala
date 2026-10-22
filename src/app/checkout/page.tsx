import type { Metadata } from "next";
import { Suspense } from "react";
import { AddressStep } from "@/components/checkout/address-step";
import { Skeleton } from "@/components/checkout/shared";

export const metadata: Metadata = { title: "Checkout · Address" };

export default function CheckoutPage() {
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <Suspense fallback={<Skeleton />}>
        <AddressStep />
      </Suspense>
    </div>
  );
}
