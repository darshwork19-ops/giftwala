import type { DeliveryZone } from "@/lib/types";
import { findArea, zoneLabels } from "./areas";

/**
 * Where the gift should go. The sample makers only deliver within the Mumbai
 * region, so this resolves a destination to one of three honest states:
 *
 * - "zone":     a named Mumbai area, so we know the delivery zone.
 * - "region":   a PIN code inside the Mumbai/Thane/Navi Mumbai range. The PIN
 *               format is valid, but we don't map PINs to zones, so only
 *               makers that cover every zone can be treated as serving it.
 * - "outside":  a PIN or city outside the area the sample makers serve.
 *
 * A valid PIN format never proves a courier serves that address.
 */
export type Destination =
  | { kind: "zone"; label: string; zone: DeliveryZone }
  | { kind: "region"; label: string; pin: string }
  | { kind: "outside"; label: string; pin?: string };

/** PIN ranges for Mumbai, Thane and Navi Mumbai post offices. */
const REGION_PIN_RANGES: [number, number][] = [
  [400001, 400104], // Mumbai
  [400601, 400615], // Thane
  [400701, 400710], // Navi Mumbai
];

const OTHER_CITIES =
  /\b(delhi|new delhi|noida|gurgaon|gurugram|bangalore|bengaluru|pune|hyderabad|chennai|kolkata|ahmedabad|jaipur|lucknow|goa|chandigarh|indore|surat|nagpur|kochi|bhopal)\b/;

export const SERVICE_AREA = "Mumbai, Thane and Navi Mumbai";

/** The first PIN-code-shaped number in the text, ignoring amounts like ₹400000. */
export function findPin(text: string): string | undefined {
  const match = text.match(/(?<![₹\d.,])\b([1-9]\d{5})\b(?!\s*(?:k\b|rs|rupees|inr))/i);
  if (!match) return undefined;
  const before = text.slice(0, match.index).toLowerCase();
  if (/(₹|rs\.?|inr|under|below|upto|up to|budget|around|about|max)\s*$/.test(before)) return undefined;
  return match[1];
}

export function findDestination(text: string): Destination | undefined {
  const lower = text.toLowerCase();
  const area = findArea(text);
  if (area) return { kind: "zone", label: `${area.area} · ${zoneLabels[area.zone]}`, zone: area.zone };

  const pin = findPin(text);
  if (pin) {
    const n = Number(pin);
    const inRegion = REGION_PIN_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
    return inRegion
      ? { kind: "region", label: `PIN ${pin}`, pin }
      : { kind: "outside", label: `PIN ${pin}`, pin };
  }

  const city = lower.match(OTHER_CITIES);
  if (city) return { kind: "outside", label: city[1].replace(/\b\w/g, (c) => c.toUpperCase()) };
  return undefined;
}

export type Serviceability = "serves" | "unconfirmed" | "does-not-serve";

/** Whether a maker's sample delivery zones cover the destination. */
export function serviceability(destination: Destination, makerZones: DeliveryZone[]): Serviceability {
  switch (destination.kind) {
    case "zone":
      return makerZones.includes(destination.zone) ? "serves" : "does-not-serve";
    case "region":
      // Without a PIN → zone map we can only be sure for makers covering all zones
      return makerZones.length === Object.keys(zoneLabels).length ? "serves" : "unconfirmed";
    case "outside":
      return "does-not-serve";
  }
}
