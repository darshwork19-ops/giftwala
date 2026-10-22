import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/components/checkout/cart-view";
import { Skeleton } from "@/components/checkout/shared";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <Suspense fallback={<Skeleton />}>
        <CartView />
      </Suspense>
    </div>
  );
}
