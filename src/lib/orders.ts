"use client";

import type { BillingDetails, ContactDetails, DeliveryDetails } from "./checkout";
import { createLocalStore } from "./local-store";

/**
 * DEMO ORDERS, kept in this browser's localStorage. Payment is simulated:
 * no money moves, and the "transaction id" is made up by the simulator.
 */

export type PaymentMethod = "upi" | "card" | "netbanking";

export interface Order {
  ref: string;
  createdAt: string;
  lines: {
    kind: "gift" | "box";
    name: string;
    makers: string[];
    image: { src: string; alt: string };
    details: { label: string; value: string; extraCost: number }[];
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  delivery: number;
  total: number;
  deliveryAddress: DeliveryDetails;
  billing: BillingDetails;
  contact: ContactDetails;
  payment: { method: PaymentMethod; simulated: true; transactionId: string; paidAt: string };
  status: "paid";
}

const isOrders = (v: unknown): v is Order[] => Array.isArray(v) && v.every((o) => o && typeof o.ref === "string");
const orders = createLocalStore<Order[]>("giftwala.orders.v1", [], isOrders);

export const useOrders = orders.useValue;

export function saveOrder(order: Order) {
  orders.update((list) => [order, ...list.filter((o) => o.ref !== order.ref)]);
}

function code(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (b) => alphabet[b % alphabet.length]).join("");
}

/** "GWO-7K3Q9X": short enough to read out over the phone. */
export const newOrderRef = () => `GWO-${code(6)}`;
/** Marked SIM so it can never be mistaken for a real gateway reference. */
export const simulatedTransactionId = () => `SIM-${code(10)}`;

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
};
