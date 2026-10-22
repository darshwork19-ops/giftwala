import { getAllProducts, getMaker } from "@/lib/catalogue";
import { findArea, zoneLabels } from "@/lib/finder/areas";
import { addDays, addWorkingDays } from "@/lib/finder/dates";
import { summariseBox } from "@/lib/gift-box";
import type { DeliveryZone, Product } from "@/lib/types";

/**
 * Cart and checkout rules, kept free of browser code so they can be tested.
 *
 * A cart holds GIFTWALA catalogue gifts (with personalisation) and gift
 * boxes. The whole order goes to one Mumbai address by one date, so every
 * maker in the cart must deliver to that area and the date can't be earlier
 * than the slowest line. Prices are always recomputed from the catalogue, never
 * trusted from what was stored.
 */

export const MAX_QUANTITY = 5;
/** No delivery charges are set for the sample makers. */
export const DELIVERY_FEE = 0;

export type CartLine =
  | {
      id: string;
      kind: "gift";
      productId: string;
      /** Personalisation option id → chosen value (choice id or text). */
      options: Record<string, string>;
      quantity: number;
    }
  | { id: string; kind: "box"; productIds: string[]; message?: string; quantity: number };

export interface PricedLine {
  line: CartLine;
  name: string;
  image: { src: string; alt: string };
  makers: string[];
  /** Human-readable personalisation, or the box's contents. */
  details: { label: string; value: string; extraCost: number }[];
  unitPrice: number;
  total: number;
  zones: DeliveryZone[];
  /** Earliest estimated arrival (sample lead times). */
  earliest: string;
  perishable: boolean;
  personalised: boolean;
}

const allZones = Object.keys(zoneLabels) as DeliveryZone[];

function product(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

/** Prices a line from the catalogue; undefined if a product no longer exists. */
export function priceLine(line: CartLine, today: string): PricedLine | undefined {
  if (line.kind === "box") {
    const products = line.productIds.map(product);
    if (products.some((p) => !p)) return undefined;
    const items = products as Product[];
    const box = summariseBox(items, today);
    return {
      line,
      name: `Gift box of ${items.length}`,
      image: items[0].images[0],
      makers: box.makers,
      details: [
        ...items.map((p) => ({ label: p.name, value: getMaker(p.makerId).name, extraCost: 0 })),
        ...(line.message ? [{ label: "Gift message", value: line.message, extraCost: 0 }] : []),
      ],
      unitPrice: box.subtotal,
      total: box.subtotal * line.quantity,
      zones: box.zones,
      earliest: box.earliest ?? today,
      perishable: box.perishable,
      personalised: false,
    };
  }

  const p = product(line.productId);
  if (!p) return undefined;
  const maker = getMaker(p.makerId);
  const details: PricedLine["details"] = [];
  let extraDays = 0;
  for (const option of p.personalisation) {
    const value = line.options[option.id]?.trim();
    if (!value) continue;
    if (option.kind === "choice") {
      const choice = option.choices.find((c) => c.id === value);
      if (!choice) continue;
      details.push({ label: option.label, value: choice.label, extraCost: choice.extraCost });
    } else {
      details.push({ label: option.label, value, extraCost: option.extraCost });
    }
    extraDays += option.processingDaysAdded ?? 0;
  }
  const unitPrice = p.price + details.reduce((sum, d) => sum + d.extraCost, 0);
  return {
    line,
    name: p.name,
    image: p.images[0],
    makers: [maker.name],
    details,
    unitPrice,
    total: unitPrice * line.quantity,
    zones: maker.deliveryZones,
    earliest: addDays(addWorkingDays(today, p.processingDays.max + extraDays), maker.deliveryDays),
    perishable: p.returnPolicy === "non-returnable-perishable",
    // A gift message or packaging choice doesn't make an item non-returnable
    personalised: p.personalisation.some(
      (o) => o.id !== "gift-message" && o.id !== "packaging" && Boolean(line.options[o.id]?.trim()),
    ),
  };
}

export interface CartSummary {
  lines: PricedLine[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  /** Zones every line can be delivered to. */
  zones: DeliveryZone[];
  /** Earliest date the whole order can arrive. */
  earliest?: string;
}

export function summariseCart(lines: CartLine[], today: string): CartSummary {
  const priced = lines.map((l) => priceLine(l, today)).filter((l) => l !== undefined);
  const subtotal = priced.reduce((sum, l) => sum + l.total, 0);
  return {
    lines: priced,
    count: priced.reduce((sum, l) => sum + l.line.quantity, 0),
    subtotal,
    delivery: priced.length ? DELIVERY_FEE : 0,
    total: subtotal + (priced.length ? DELIVERY_FEE : 0),
    zones: allZones.filter((z) => priced.every((l) => l.zones.includes(z))),
    earliest: priced.length ? priced.map((l) => l.earliest).sort().at(-1) : undefined,
  };
}

// ── Addresses ─────────────────────────────────────────────────────────────

export interface DeliveryDetails {
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2: string;
  landmark: string;
  area: string;
  pin: string;
  deliverBy: string;
}

export interface BillingDetails {
  sameAsDelivery: boolean;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
}

export const emptyDelivery: DeliveryDetails = {
  recipientName: "", recipientPhone: "", line1: "", line2: "", landmark: "", area: "", pin: "", deliverBy: "",
};
export const emptyBilling: BillingDetails = {
  sameAsDelivery: true, name: "", line1: "", line2: "", city: "", state: "", pin: "",
};

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

const PHONE = /^(\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PIN = /^[1-9]\d{5}$/;
/** PIN ranges for Mumbai, Thane and Navi Mumbai post offices. */
const REGION_PIN_RANGES: [number, number][] = [
  [400001, 400104],
  [400601, 400615],
  [400701, 400710],
];

export const cleanPhone = (s: string) => s.replace(/[\s-]/g, "");
export const isPhone = (s: string) => PHONE.test(cleanPhone(s));
export const isEmail = (s: string) => EMAIL.test(s.trim());
export const isMumbaiPin = (s: string) => {
  const n = Number(s.trim());
  return PIN.test(s.trim()) && REGION_PIN_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
};

export type Errors = Record<string, string>;

export function validateDelivery(d: DeliveryDetails, cart: CartSummary): Errors {
  const e: Errors = {};
  if (d.recipientName.trim().length < 2) e.recipientName = "Add the recipient's name.";
  if (d.recipientPhone.trim() && !isPhone(d.recipientPhone)) e.recipientPhone = "Add a 10-digit Indian mobile number, or leave it blank.";
  if (d.line1.trim().length < 5) e.line1 = "Add the flat or house number and building.";
  const area = findArea(d.area);
  if (!area) e.area = "Choose the delivery area.";
  else if (!cart.zones.includes(area.zone)) {
    const blocking = cart.lines.filter((l) => !l.zones.includes(area.zone)).map((l) => l.name);
    e.area = `${blocking.join(", ")} can't be delivered to ${zoneLabels[area.zone]}.`;
  }
  if (!PIN.test(d.pin.trim())) e.pin = "Add the 6-digit PIN code.";
  else if (!isMumbaiPin(d.pin)) e.pin = "That PIN isn't in Mumbai, Thane or Navi Mumbai, where these makers deliver.";
  if (!d.deliverBy) e.deliverBy = "Choose the date it should arrive by.";
  else if (cart.earliest && d.deliverBy < cart.earliest) e.deliverBy = "That's earlier than the order can arrive.";
  return e;
}

export function validateBilling(b: BillingDetails): Errors {
  if (b.sameAsDelivery) return {};
  const e: Errors = {};
  if (b.name.trim().length < 2) e["billing-name"] = "Add the name for the bill.";
  if (b.line1.trim().length < 5) e["billing-line1"] = "Add the billing address.";
  if (b.city.trim().length < 2) e["billing-city"] = "Add the city.";
  if (!INDIAN_STATES.includes(b.state)) e["billing-state"] = "Choose the state.";
  if (!PIN.test(b.pin.trim())) e["billing-pin"] = "Add the 6-digit PIN code.";
  return e;
}

export function validateContact(c: ContactDetails): Errors {
  const e: Errors = {};
  if (c.name.trim().length < 2) e["contact-name"] = "Add your name.";
  if (!isEmail(c.email)) e["contact-email"] = "Add a valid email address.";
  if (!isPhone(c.phone)) e["contact-phone"] = "Add a 10-digit Indian mobile number.";
  return e;
}

/** One-line address for summaries. */
export function deliveryAddressLines(d: DeliveryDetails): string[] {
  return [
    [d.line1, d.line2].filter((s) => s.trim()).join(", "),
    d.landmark.trim() ? `Near ${d.landmark.trim()}` : "",
    `${d.area}, Mumbai ${d.pin}`.trim(),
  ].filter(Boolean);
}

export function billingAddressLines(b: BillingDetails, d: DeliveryDetails): string[] {
  if (b.sameAsDelivery) return deliveryAddressLines(d);
  return [b.name, [b.line1, b.line2].filter((s) => s.trim()).join(", "), `${b.city}, ${b.state} ${b.pin}`];
}
