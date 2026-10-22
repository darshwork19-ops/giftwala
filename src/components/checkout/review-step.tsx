"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  billingAddressLines,
  deliveryAddressLines,
  summariseCart,
  validateBilling,
  validateContact,
  validateDelivery,
  type CartSummary,
} from "@/lib/checkout";
import { useCart, useCheckoutDraft, type CheckoutDraft } from "@/lib/cart";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { CheckoutSteps, DemoNotice, OrderSummary, PageTitle, primaryPill, Redirect, Skeleton, useRequireProfile, useToday } from "./shared";

export function ReviewStep() {
  const profile = useRequireProfile();
  const lines = useCart();
  const draft = useCheckoutDraft();
  const today = useToday();
  if (!profile || lines === undefined || !draft || !today) return <Skeleton />;
  const cart = summariseCart(lines, today);
  if (cart.lines.length === 0) return <Redirect to={routes.cart} />;
  // Details can go stale (an item added, a day passed): send them back to fix it
  const invalid =
    !draft.contact ||
    Object.keys({ ...validateContact(draft.contact), ...validateDelivery(draft.delivery, cart), ...validateBilling(draft.billing) }).length > 0;
  if (invalid) return <Redirect to={routes.checkout} />;
  return <Review cart={cart} draft={draft as Required<CheckoutDraft>} />;
}

function Review({ cart, draft }: { cart: CartSummary; draft: Required<CheckoutDraft> }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const nonReturnable = cart.lines.filter((l) => l.perishable || l.personalised);

  return (
    <>
      <CheckoutSteps current={2} />
      <div className="mt-8">
        <PageTitle title="Check everything," accent="then confirm." />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div className="space-y-10">
          <section aria-labelledby="review-items">
            <div className="flex items-baseline justify-between">
              <h2 id="review-items" className="font-serif text-2xl">Gifts</h2>
              <Link href={routes.cart} className="text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">Edit cart</Link>
            </div>
            <ul className="mt-4 divide-y divide-linen border-y border-linen">
              {cart.lines.map((l) => (
                <li key={l.line.id} className="flex gap-4 py-5">
                  <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-linen">
                    <GiftImage src={l.image.src} alt={l.image.alt} sizes="80px" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <p className="font-serif text-lg leading-snug">{l.name}</p>
                      <p className="font-medium">{formatPrice(l.total)}</p>
                    </div>
                    <p className="text-muted">
                      {l.line.quantity} × {formatPrice(l.unitPrice)} · {l.makers.join(", ")}
                    </p>
                    {l.details.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-muted">
                        {l.details.map((d) => (
                          <li key={d.label + d.value}>{l.line.kind === "box" ? d.label : `${d.label}: ${d.value}`}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            <Block title="Delivery" edit>
              <p className="font-medium text-charcoal">{draft.delivery.recipientName}</p>
              {deliveryAddressLines(draft.delivery).map((line) => <p key={line}>{line}</p>)}
              {draft.delivery.recipientPhone && <p>{draft.delivery.recipientPhone}</p>}
              <p className="mt-2 text-charcoal">Arrives by {formatShortDate(draft.delivery.deliverBy)}</p>
            </Block>
            <Block title="Billing" edit>
              {draft.billing.sameAsDelivery && <p className="font-medium text-charcoal">{draft.contact.name}</p>}
              {billingAddressLines(draft.billing, draft.delivery).map((line, i) => (
                <p key={line} className={i === 0 && !draft.billing.sameAsDelivery ? "font-medium text-charcoal" : ""}>{line}</p>
              ))}
              {draft.billing.sameAsDelivery && <p className="mt-2 text-xs">Same as the delivery address</p>}
            </Block>
            <Block title="Contact" edit>
              <p>{draft.contact.name}</p>
              <p>{draft.contact.email}</p>
              <p>{draft.contact.phone}</p>
            </Block>
            <Block title="Returns">
              {nonReturnable.length > 0 ? (
                <p>
                  {nonReturnable.map((l) => l.name).join(", ")} {nonReturnable.length === 1 ? "is" : "are"} personalised or
                  perishable, so {nonReturnable.length === 1 ? "it" : "they"} can&apos;t be returned unless damaged on arrival.
                </p>
              ) : (
                <p>Returnable if unused, within the maker&apos;s return window.</p>
              )}
            </Block>
          </div>
          <DemoNotice />
        </div>

        <OrderSummary cart={cart}>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-burgundy" />
            <span>I&apos;ve checked the gifts, addresses and date, and I understand this is a demo with a simulated payment.</span>
          </label>
          <button type="button" disabled={!agreed} onClick={() => router.push(routes.checkoutPay)} className={`${primaryPill} mt-5 w-full`}>
            Confirm and pay {formatPrice(cart.total)}
          </button>
        </OrderSummary>
      </div>
    </>
  );
}

function Block({ title, edit = false, children }: { title: string; edit?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-linen pb-2">
        <h2 className="font-serif text-xl">{title}</h2>
        {edit && (
          <Link href={routes.checkout} className="text-xs text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
            Change
          </Link>
        )}
      </div>
      <div className="mt-3 space-y-0.5 text-sm text-muted">{children}</div>
    </section>
  );
}
