import { makers } from "@/data/makers";
import { products } from "@/data/products";
import type { Maker, Product } from "./types";

/**
 * Read-only access to the local sample catalogue. Pages use these helpers
 * rather than importing the data arrays directly, so the source can later be
 * swapped for a database without touching the UI.
 */

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = products.filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByMaker(makerId: string): Product[] {
  return products.filter((p) => p.makerId === makerId);
}

export function getAllMakers(): Maker[] {
  return makers;
}

export function getMaker(id: string): Maker {
  const maker = makers.find((m) => m.id === id);
  if (!maker) throw new Error(`Unknown maker id: ${id}`);
  return maker;
}

export function getMakerBySlug(slug: string): Maker | undefined {
  return makers.find((m) => m.slug === slug);
}

/**
 * True when a product offers real personalisation (a name, engraving, colour
 * and so on). A gift message, packaging or a practical choice such as coffee
 * grind does not count on its own.
 */
const NON_PERSONAL_OPTIONS = new Set(["gift-message", "packaging", "grind"]);

export function isPersonalisable(product: Product): boolean {
  return product.personalisation.some((o) => !NON_PERSONAL_OPTIONS.has(o.id));
}

/** How many products offer a given personalisation option id. */
export function countProductsWithOption(optionId: string): number {
  return products.filter((p) => p.personalisation.some((o) => o.id === optionId))
    .length;
}
