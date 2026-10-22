"use client";

import type { BillingDetails, ContactDetails, DeliveryDetails } from "./checkout";
import { createLocalStore } from "./local-store";
import { getSupabase } from "./supabase";

/**
 * ORDERS. Payment is simulated: no money moves, and the "transaction id" is
 * made up by the simulator. Orders are kept in this browser's localStorage
 * and, when Supabase is configured and the shopper is signed in, also in the
 * `orders` table so they show up on any device.
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

const toRow = (order: Order) => ({ ref: order.ref, total: order.total, status: order.status, data: order });

/**
 * Saves the order in this browser and, when signed in to an account, in the
 * `orders` table. Resolves once the account copy is saved (or has failed).
 */
export async function saveOrder(order: Order): Promise<void> {
  orders.update((list) => [order, ...list.filter((o) => o.ref !== order.ref)]);
  const supabase = getSupabase();
  if (!supabase) return;
  // A Supabase query only runs when it's awaited. user_id defaults to the
  // signed-in user and Row Level Security checks it.
  const { error } = await supabase.from("orders").insert(toRow(order));
  if (error && error.code !== "23505") console.error("Couldn't save the order to your account:", error.message);
}

/**
 * Syncs the signed-in shopper's orders both ways: orders from the account
 * come into this browser, and orders this browser has that the account
 * doesn't (e.g. placed while offline) are uploaded.
 */
export async function syncOrdersFromAccount() {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data, error } = await supabase.from("orders").select("data").order("created_at", { ascending: false }).limit(100);
  if (error || !data) return;
  const remote = data.map((r) => r.data as Order).filter((o) => o && typeof o.ref === "string");
  const remoteRefs = new Set(remote.map((o) => o.ref));
  const missing = orders.read().filter((o) => !remoteRefs.has(o.ref));
  if (missing.length) {
    const { error: uploadError } = await supabase.from("orders").upsert(missing.map(toRow), { onConflict: "ref", ignoreDuplicates: true });
    if (uploadError) console.error("Couldn't upload orders to your account:", uploadError.message);
  }
  orders.update((local) =>
    [...remote, ...local.filter((o) => !remoteRefs.has(o.ref))].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

/** Forgets this browser's copy of orders (on sign-out, so the next person doesn't see them). */
export function clearLocalOrders() {
  orders.write([]);
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
