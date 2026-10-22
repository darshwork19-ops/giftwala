"use client";

import {
  emptyBilling,
  emptyDelivery,
  MAX_QUANTITY,
  type BillingDetails,
  type CartLine,
  type ContactDetails,
  type DeliveryDetails,
} from "./checkout";
import { createLocalStore } from "./local-store";

/**
 * DEMO CART AND CHECKOUT DRAFT, kept in this browser's localStorage. The
 * address details are remembered so a returning shopper doesn't retype them.
 */

export interface CheckoutDraft {
  delivery: DeliveryDetails;
  billing: BillingDetails;
  contact?: ContactDetails;
}

const isLines = (v: unknown): v is CartLine[] =>
  Array.isArray(v) && v.every((l) => l && typeof l.id === "string" && (l.kind === "gift" || l.kind === "box"));
const isDraft = (v: unknown): v is CheckoutDraft =>
  typeof v === "object" && v !== null && "delivery" in v && "billing" in v;

const cart = createLocalStore<CartLine[]>("giftwala.cart.v1", [], isLines);
const draft = createLocalStore<CheckoutDraft>(
  "giftwala.checkout.v1",
  { delivery: emptyDelivery, billing: emptyBilling },
  isDraft,
);

export const useCart = cart.useValue;
export const useCheckoutDraft = draft.useValue;

function newId() {
  return crypto.getRandomValues(new Uint32Array(2)).join("-");
}

export function addGift(productId: string, options: Record<string, string>) {
  cart.update((lines) => {
    // The same gift with the same personalisation just adds to the quantity
    const same = lines.find(
      (l) => l.kind === "gift" && l.productId === productId && JSON.stringify(l.options) === JSON.stringify(options),
    );
    if (same) return lines.map((l) => (l === same ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + 1) } : l));
    return [...lines, { id: newId(), kind: "gift", productId, options, quantity: 1 }];
  });
}

export function addBox(productIds: string[], message?: string) {
  cart.update((lines) => [...lines, { id: newId(), kind: "box", productIds, message, quantity: 1 }]);
}

export function setQuantity(id: string, quantity: number) {
  const q = Math.max(1, Math.min(MAX_QUANTITY, Math.round(quantity)));
  cart.update((lines) => lines.map((l) => (l.id === id ? { ...l, quantity: q } : l)));
}

export function removeLine(id: string) {
  cart.update((lines) => lines.filter((l) => l.id !== id));
}

export function clearCart() {
  cart.write([]);
}

/** A delivery date or area picked earlier (e.g. in the Gift Finder) pre-fills checkout. */
export function rememberDeliveryHints(hints: { deliverBy?: string; area?: string }) {
  draft.update((d) => ({
    ...d,
    delivery: {
      ...d.delivery,
      deliverBy: d.delivery.deliverBy || hints.deliverBy || "",
      area: d.delivery.area || hints.area || "",
    },
  }));
}

export function saveCheckoutDraft(next: CheckoutDraft) {
  draft.write(next);
}

export function readCheckoutDraft(): CheckoutDraft {
  return draft.read();
}
