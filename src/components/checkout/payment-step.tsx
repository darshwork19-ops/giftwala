"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { summariseCart, validateBilling, validateContact, validateDelivery, type CartSummary } from "@/lib/checkout";
import { useCart, useCheckoutDraft, type CheckoutDraft } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import {
  newOrderRef,
  paymentMethodLabels,
  saveOrder,
  simulatedTransactionId,
  type Order,
  type PaymentMethod,
} from "@/lib/orders";
import { routes } from "@/lib/routes";
import { CheckoutSteps, OrderSummary, PageTitle, primaryPill, Redirect, secondaryPill, Skeleton, useRequireProfile, useToday } from "./shared";

export function PaymentStep() {
  const profile = useRequireProfile();
  const lines = useCart();
  const draft = useCheckoutDraft();
  const today = useToday();
  if (!profile || lines === undefined || !draft || !today) return <Skeleton />;
  const cart = summariseCart(lines, today);
  if (cart.lines.length === 0) return <Redirect to={routes.cart} />;
  const invalid =
    !draft.contact ||
    Object.keys({ ...validateContact(draft.contact), ...validateDelivery(draft.delivery, cart), ...validateBilling(draft.billing) }).length > 0;
  if (invalid) return <Redirect to={routes.checkout} />;
  return <SimulatedGateway cart={cart} draft={draft as Required<CheckoutDraft>} />;
}

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"];

/**
 * A stand-in for a payment gateway. It deliberately has no card, UPI-PIN or
 * bank-login fields: nobody should type real payment details into a demo.
 */
function SimulatedGateway({ cart, draft }: { cart: CartSummary; draft: Required<CheckoutDraft> }) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [state, setState] = useState<"idle" | "processing" | "failed">("idle");

  async function pay(outcome: "success" | "failure") {
    setState("processing");
    await new Promise((r) => setTimeout(r, 1200)); // A gateway round-trip, roughly
    if (outcome === "failure") {
      setState("failed");
      return;
    }
    const now = new Date().toISOString();
    const order: Order = {
      ref: newOrderRef(),
      createdAt: now,
      lines: cart.lines.map((l) => ({
        kind: l.line.kind,
        name: l.name,
        makers: l.makers,
        image: l.image,
        details: l.details,
        quantity: l.line.quantity,
        unitPrice: l.unitPrice,
        total: l.total,
      })),
      subtotal: cart.subtotal,
      delivery: cart.delivery,
      total: cart.total,
      deliveryAddress: draft.delivery,
      billing: draft.billing,
      contact: draft.contact,
      payment: { method, simulated: true, transactionId: simulatedTransactionId(), paidAt: now },
      status: "paid",
    };
    // Wait for the account copy, so it's saved before this page navigates away
    await saveOrder(order);
    // Optional hand-off to an order workflow (n8n); a no-op unless configured
    fetch("/api/order-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "order", ...order }),
      keepalive: true,
    }).catch(() => {});
    // The confirmation page empties the cart: doing it here would bounce this page back to an empty cart first
    router.replace(`${routes.order(order.ref)}&placed=1`);
  }

  const busy = state === "processing";
  return (
    <>
      <CheckoutSteps current={3} />
      <div className="mt-8">
        <PageTitle title="Payment" accent="(simulated)" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <section aria-labelledby="gateway-title" className="overflow-hidden rounded-[1.25rem] border border-charcoal/15 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-linen bg-charcoal px-6 py-4 text-white">
            <p id="gateway-title" className="font-medium">GIFTWALA Pay · test simulator</p>
            <p className="text-sm text-white/80">{formatPrice(cart.total)}</p>
          </div>
          <div className="p-6">
            <p className="rounded-xl bg-blush px-4 py-3 text-sm text-berry">
              This is not a real payment gateway. No money moves and no payment details are asked for. Choose an
              outcome to see what happens next.
            </p>

            <fieldset className="mt-6" disabled={busy}>
              <legend className="text-sm font-medium">Pay with</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((m) => (
                  <label key={m} className="cursor-pointer rounded-xl border border-linen px-3 py-3 text-center text-sm has-[:checked]:border-burgundy has-[:checked]:bg-blush has-[:checked]:text-burgundy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy">
                    <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="sr-only" />
                    {paymentMethodLabels[m]}
                  </label>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-linen p-4 text-sm text-muted">
                {method === "upi" && "With a real gateway you'd approve this in your UPI app (GPay, PhonePe, Paytm…)."}
                {method === "card" && "With a real gateway you'd enter card details on the gateway's own secure page, never on GIFTWALA."}
                {method === "netbanking" && (
                  <>
                    With a real gateway you&apos;d pick your bank and sign in on the bank&apos;s own page.
                    <span className="mt-2 block text-xs">Supported banks would include {BANKS.join(", ")} and more.</span>
                  </>
                )}
              </div>
            </fieldset>

            {state === "failed" && (
              <p role="alert" className="mt-5 rounded-xl border border-berry/30 px-4 py-3 text-sm text-berry">
                Payment failed (simulated). You haven&apos;t been charged and your cart is unchanged. Try again or choose
                another method.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" disabled={busy} onClick={() => pay("success")} className={primaryPill}>
                {busy ? "Processing…" : `Simulate successful payment of ${formatPrice(cart.total)}`}
              </button>
              <button type="button" disabled={busy} onClick={() => pay("failure")} className={secondaryPill}>
                Simulate a failed payment
              </button>
            </div>
            <button type="button" disabled={busy} onClick={() => router.push(routes.checkoutReview)}
              className="mt-4 text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
              Cancel and go back
            </button>
          </div>
        </section>
        <OrderSummary cart={cart} />
      </div>
    </>
  );
}
