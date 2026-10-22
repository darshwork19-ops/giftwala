"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { clearCart } from "@/lib/cart";
import { billingAddressLines, deliveryAddressLines } from "@/lib/checkout";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabels, syncOrdersFromAccount, useOrders, type Order } from "@/lib/orders";
import { useProfile } from "@/lib/profile";
import { useOrderRequests } from "@/lib/order-requests";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { DemoNotice, PageTitle, primaryPill, secondaryPill, Skeleton } from "./shared";

export function OrdersView() {
  const params = useSearchParams();
  const ref = params.get("ref");
  const placed = params.get("placed") === "1";
  // Arriving straight from a successful payment: the cart has been bought
  useEffect(() => {
    if (placed) clearCart();
  }, [placed]);
  // Signed in to an account: bring in orders placed on other devices
  const signedIn = Boolean(useProfile());
  useEffect(() => {
    if (signedIn) void syncOrdersFromAccount();
  }, [signedIn]);
  const orders = useOrders();
  const requests = useOrderRequests();
  if (orders === undefined) return <Skeleton />;

  if (ref) {
    const order = orders.find((o) => o.ref === ref);
    if (!order) {
      return (
        <div className="max-w-xl">
          <PageTitle title={`We can't find order ${ref}`} />
          <p className="mt-4 text-muted">Orders are saved in the browser they were placed in. Open this page on the same device.</p>
          <Link href={routes.orders} className={`${secondaryPill} mt-8`}>All your orders</Link>
        </div>
      );
    }
    return <OrderDetail order={order} />;
  }

  return (
    <>
      <PageTitle title="Your" accent="orders." />
      {orders.length === 0 ? (
        <div className="mt-6 max-w-xl">
          <p className="text-muted">You haven&apos;t placed an order in this browser yet.</p>
          <Link href={routes.giftFinder} className={`${primaryPill} mt-8`}>Find their perfect gift</Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-linen border-y border-linen">
          {orders.map((o) => (
            <li key={o.ref}>
              <Link href={routes.order(o.ref)} className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block font-serif text-xl group-hover:text-burgundy">
                    {o.lines.map((l) => l.name).join(", ")}
                  </span>
                  <span className="text-sm text-muted">
                    {o.ref} · placed {formatShortDate(o.createdAt.slice(0, 10))} · for {o.deliveryAddress.recipientName}, arrives by{" "}
                    {formatShortDate(o.deliveryAddress.deliverBy)}
                  </span>
                </span>
                <span className="font-medium">{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {requests.length > 0 && (
        <p className="mt-8 text-sm text-muted">
          Looking for an earlier gift request?{" "}
          <Link href={routes.requests} className="underline underline-offset-4 hover:text-burgundy">See your requests</Link>.
        </p>
      )}
    </>
  );
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <>
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm text-sage">
          <span aria-hidden="true">✓</span> Payment received (simulated)
        </p>
        <PageTitle title="Thank you." accent="Your order is placed." />
        <p className="mt-4 text-muted">
          Order <span className="font-medium text-charcoal">{order.ref}</span> · placed{" "}
          {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}. A
          confirmation would go to {order.contact.email}.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div className="space-y-10">
          <ol className="grid gap-4 sm:grid-cols-3" aria-label="Order progress">
            {[
              { title: "Paid", body: `${paymentMethodLabels[order.payment.method]} · ${order.payment.transactionId}`, done: true },
              { title: "With the makers", body: "Each maker prepares their part of the order.", done: false },
              { title: "Delivered", body: `By ${formatShortDate(order.deliveryAddress.deliverBy)}`, done: false },
            ].map((s) => (
              <li key={s.title} className={`rounded-xl border p-4 ${s.done ? "border-sage/40 bg-white" : "border-linen"}`}>
                <p className={`font-medium ${s.done ? "text-sage" : "text-muted"}`}>{s.done ? "✓ " : ""}{s.title}</p>
                <p className="mt-1 text-xs text-muted">{s.body}</p>
              </li>
            ))}
          </ol>

          <section aria-labelledby="order-items">
            <h2 id="order-items" className="font-serif text-2xl">Gifts</h2>
            <ul className="mt-4 divide-y divide-linen border-y border-linen">
              {order.lines.map((l, i) => (
                <li key={i} className="flex gap-4 py-5">
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-linen">
                    <GiftImage src={l.image.src} alt={l.image.alt} sizes="80px" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <p className="font-serif text-lg leading-snug">{l.name}</p>
                      <p className="font-medium">{formatPrice(l.total)}</p>
                    </div>
                    <p className="text-muted">{l.quantity} × {formatPrice(l.unitPrice)} · {l.makers.join(", ")}</p>
                    {l.details.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-muted">
                        {l.details.map((d) => (
                          <li key={d.label + d.value}>{l.kind === "box" ? d.label : `${d.label}: ${d.value}`}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="border-b border-linen pb-2 font-serif text-xl">Delivering to</h2>
              <div className="mt-3 space-y-0.5 text-sm text-muted">
                <p className="font-medium text-charcoal">{order.deliveryAddress.recipientName}</p>
                {deliveryAddressLines(order.deliveryAddress).map((line) => <p key={line}>{line}</p>)}
              </div>
            </section>
            <section>
              <h2 className="border-b border-linen pb-2 font-serif text-xl">Billed to</h2>
              <div className="mt-3 space-y-0.5 text-sm text-muted">
                {order.billing.sameAsDelivery && <p className="font-medium text-charcoal">{order.contact.name}</p>}
                {billingAddressLines(order.billing, order.deliveryAddress).map((line) => <p key={line}>{line}</p>)}
              </div>
            </section>
          </div>
          <DemoNotice />
        </div>

        <aside className="rounded-[1.25rem] border border-linen bg-white/70 p-6 lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-serif text-2xl">Payment</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery ? formatPrice(order.delivery) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-linen pt-3 text-base font-medium"><dt>Paid</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">
            Method: {paymentMethodLabels[order.payment.method]} (simulated). Reference {order.payment.transactionId} was made up by
            the test simulator; no real transaction exists.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href={routes.gifts} className={primaryPill}>Keep exploring</Link>
            <Link href={routes.orders} className={secondaryPill}>All your orders</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
