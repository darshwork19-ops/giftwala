"use client";

import { useSyncExternalStore } from "react";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";

/**
 * Order requests live in this browser's localStorage. There is no backend and
 * no payment: a request is a structured message the buyer sends to the maker.
 */

export type RequestStatus = "ready" | "sent" | "confirmed";

export interface OrderRequest {
  ref: string;
  createdAt: string;
  productId: string;
  productSlug: string;
  productName: string;
  makerName: string;
  basePrice: number;
  personalisation: { label: string; value: string; extraCost: number }[];
  /** Present for a mix-and-match gift box: every item packed together. */
  items?: { name: string; maker: string; price: number }[];
  total: number;
  deliverBy: string;
  area: string;
  recipientName: string;
  address: string;
  buyerName: string;
  buyerPhone: string;
  status: RequestStatus;
  history: { status: RequestStatus; at: string; note?: string }[];
}

const KEY = "giftwala.requests.v1";
const EMPTY: OrderRequest[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: OrderRequest[] } = { raw: null, value: EMPTY };

function read(): OrderRequest[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.value;
  let value: OrderRequest[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed;
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function write(requests: OrderRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(requests));
  } catch {
    // Storage full or blocked: the in-page state still updates below.
  }
  cache = { raw: JSON.stringify(requests), value: requests };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** All saved requests, newest first. Empty during server rendering. */
export function useOrderRequests(): OrderRequest[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveOrderRequest(request: OrderRequest) {
  write([request, ...read().filter((r) => r.ref !== request.ref)]);
}

export function updateStatus(ref: string, status: RequestStatus, note?: string) {
  write(
    read().map((r) =>
      r.ref === ref
        ? { ...r, status, history: [...r.history, { status, at: new Date().toISOString(), note }] }
        : r,
    ),
  );
}

/** "GW-7K3Q9" — short enough to read out over the phone. */
export function newReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `GW-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

/** The structured order message the maker receives. */
export function orderMessage(r: OrderRequest): string {
  const lines = [
    `New GIFTWALA order request ${r.ref}`,
    "",
    ...(r.items
      ? [`Gift box with ${r.items.length} items:`, ...r.items.map((i) => `- ${i.name} by ${i.maker} (${formatPrice(i.price)})`)]
      : [`Gift: ${r.productName} (${formatPrice(r.basePrice)})`]),
    ...r.personalisation.map(
      (p) => `${p.label}: ${p.value}${p.extraCost ? ` (+${formatPrice(p.extraCost)})` : ""}`,
    ),
    `Total: ${formatPrice(r.total)}`,
    "",
    `Deliver by: ${formatShortDate(r.deliverBy)}`,
    `Recipient: ${r.recipientName}`,
    `Address: ${r.address}, ${r.area}, Mumbai`,
    "",
    `From: ${r.buyerName}, ${r.buyerPhone}`,
    "",
    "Please reply to confirm you can make and deliver this by the date.",
  ];
  return lines.join("\n");
}
