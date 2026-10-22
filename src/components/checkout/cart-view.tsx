"use client";

import Link from "next/link";
import { MAX_QUANTITY, summariseCart } from "@/lib/checkout";
import { removeLine, setQuantity, useCart } from "@/lib/cart";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { zoneLabels } from "@/lib/finder/areas";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CheckoutSteps, OrderSummary, PageTitle, primaryPill, secondaryPill, Skeleton, useToday } from "./shared";

export function CartView() {
  const lines = useCart();
  const today = useToday();
  if (lines === undefined || !today) return <Skeleton />;
  const cart = summariseCart(lines, today);

  if (cart.lines.length === 0) {
    return (
      <div className="max-w-xl">
        <PageTitle title="Your cart is" accent="empty." />
        <p className="mt-4 text-muted">Find something that feels like them, then add it here.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={routes.giftFinder} className={primaryPill}>Find their perfect gift</Link>
          <Link href={routes.gifts} className={secondaryPill}>Explore gifts</Link>
        </div>
      </div>
    );
  }

  const shared = cart.zones.length > 0;
  return (
    <>
      <CheckoutSteps current={0} />
      <div className="mt-8">
        <PageTitle title="Your cart" accent={`· ${cart.count} ${cart.count === 1 ? "gift" : "gifts"}`} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          <ul className="divide-y divide-linen border-y border-linen">
            {cart.lines.map((l) => (
              <li key={l.line.id} className="flex gap-4 py-6 sm:gap-6">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-linen sm:h-36 sm:w-28">
                  <GiftImage src={l.image.src} alt={l.image.alt} sizes="112px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                    <div>
                      <p className="text-xs text-muted">{l.line.kind === "box" ? "Gift box · packed by GIFTWALA" : `Sample maker · ${l.makers[0]}`}</p>
                      <h2 className="mt-1 font-serif text-xl leading-snug">{l.name}</h2>
                    </div>
                    <p className="font-medium sm:text-right">{formatPrice(l.total)}</p>
                  </div>
                  {l.details.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-sm text-muted">
                      {l.details.map((d) => (
                        <li key={d.label + d.value}>
                          {l.line.kind === "box" ? d.label : `${d.label}: ${d.value}`}
                          {d.extraCost > 0 && ` (+${formatPrice(d.extraCost)})`}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-muted">Earliest arrival {formatShortDate(l.earliest)} (sample lead times)</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-charcoal/15">
                      <button type="button" aria-label={`One fewer ${l.name}`} disabled={l.line.quantity <= 1}
                        onClick={() => setQuantity(l.line.id, l.line.quantity - 1)}
                        className="h-9 w-9 rounded-full text-lg disabled:opacity-40">−</button>
                      <span className="w-8 text-center text-sm" aria-live="polite" aria-label={`Quantity ${l.line.quantity}`}>{l.line.quantity}</span>
                      <button type="button" aria-label={`One more ${l.name}`} disabled={l.line.quantity >= MAX_QUANTITY}
                        onClick={() => setQuantity(l.line.id, l.line.quantity + 1)}
                        className="h-9 w-9 rounded-full text-lg disabled:opacity-40">+</button>
                    </div>
                    <button type="button" onClick={() => removeLine(l.line.id)}
                      className="text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className={`mt-6 text-sm ${shared ? "text-muted" : "font-medium text-berry"}`} role={shared ? undefined : "alert"}>
            {shared
              ? `Everything here can be delivered together to: ${cart.zones.map((z) => zoneLabels[z]).join(", ")}.`
              : "These makers don't share a delivery area, so this cart can't go to one address. Remove an item to continue."}
          </p>
          <Link href={routes.gifts} className="mt-6 inline-block text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
            ← Keep shopping
          </Link>
        </div>
        <OrderSummary cart={cart}>
          {shared ? (
            <Link href={routes.checkout} className={`${primaryPill} mt-6 w-full`}>
              Checkout <ArrowRightIcon width={16} height={16} />
            </Link>
          ) : (
            <button type="button" disabled className={`${primaryPill} mt-6 w-full`}>Checkout</button>
          )}
        </OrderSummary>
      </div>
    </>
  );
}
