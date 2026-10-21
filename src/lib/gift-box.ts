import { getMaker } from "@/lib/catalogue";
import { zoneLabels } from "@/lib/finder/areas";
import { addDays, addWorkingDays } from "@/lib/finder/dates";
import type { DeliveryZone, Product } from "@/lib/types";

/**
 * Mix-and-match gift box rules. A box combines 2–6 GIFTWALA catalogue gifts
 * that are packed together, so it can only go where EVERY maker in it
 * delivers, and only after the slowest item is ready.
 */
export const BOX_MIN = 2;
export const BOX_MAX = 6;
/** Demo assumption: one working day to collect and pack the items together. */
export const ASSEMBLY_DAYS = 1;

export interface BoxSummary {
  count: number;
  subtotal: number;
  /** Zones every maker in the box delivers to. */
  zones: DeliveryZone[];
  /** Earliest estimated arrival, or undefined for an empty box. */
  earliest?: string;
  perishable: boolean;
  makers: string[];
  /** Why the box can't be requested yet, if it can't. */
  problem?: string;
}

export function summariseBox(products: Product[], today: string): BoxSummary {
  const makers = [...new Set(products.map((p) => p.makerId))].map(getMaker);
  const allZones = Object.keys(zoneLabels) as DeliveryZone[];
  const zones = allZones.filter((z) => makers.every((m) => m.deliveryZones.includes(z)));
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);

  let earliest: string | undefined;
  if (products.length > 0) {
    const slowest = Math.max(...products.map((p) => p.processingDays.max));
    const transit = Math.max(...makers.map((m) => m.deliveryDays));
    earliest = addDays(addWorkingDays(today, slowest + ASSEMBLY_DAYS), transit);
  }

  let problem: string | undefined;
  if (products.length < BOX_MIN) problem = `Choose at least ${BOX_MIN} gifts for a box.`;
  else if (products.length > BOX_MAX) problem = `A box holds up to ${BOX_MAX} gifts.`;
  else if (zones.length === 0) problem = "These makers don't share a delivery area, so they can't go in one box.";

  return {
    count: products.length,
    subtotal,
    zones,
    earliest,
    perishable: products.some((p) => p.returnPolicy === "non-returnable-perishable"),
    makers: makers.map((m) => m.name),
    problem,
  };
}
