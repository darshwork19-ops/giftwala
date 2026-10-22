import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/components/checkout/orders-view";
import { Skeleton } from "@/components/checkout/shared";

export const metadata: Metadata = { title: "Your orders" };

export default function OrdersPage() {
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <Suspense fallback={<Skeleton />}>
        <OrdersView />
      </Suspense>
    </div>
  );
}
