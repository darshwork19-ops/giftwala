import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { externalProducts } from "./external-products";
import { giftIdeas } from "./gift-ideas";
import { makerProducts } from "./instagram-maker-products";
import { instagramMakers } from "./instagram-makers";

describe("Mumbai maker products", () => {
  it("belong to a known maker, with unique ids", () => {
    const ids = new Set(instagramMakers.map((m) => m.id));
    expect(makerProducts.every((p) => ids.has(p.makerId))).toBe(true);
    expect(new Set(makerProducts.map((p) => p.id)).size).toBe(makerProducts.length);
  });

  it("every maker shows at least two products", () => {
    for (const m of instagramMakers) {
      expect(makerProducts.filter((p) => p.makerId === m.id).length, m.handle).toBeGreaterThanOrEqual(2);
    }
  });

  it("every photo exists in /public", () => {
    for (const p of makerProducts) {
      expect(existsSync(join(process.cwd(), "public", p.image.src)), p.image.src).toBe(true);
    }
  });

  it("never lists a price", () => {
    expect(makerProducts.some((p) => "price" in p)).toBe(false);
  });
});

describe("The Drunken Mug catalogue", () => {
  it("has unique ids and real shop links", () => {
    expect(new Set(externalProducts.map((p) => p.id)).size).toBe(externalProducts.length);
    expect(externalProducts.every((p) => p.url.startsWith("https://www.thedrunkenmug.in/products/"))).toBe(true);
    expect(externalProducts.length).toBeGreaterThan(50);
  });

  it("marks liquor-branded pieces 18+", () => {
    const branded = externalProducts.filter((p) => /old monk|jameson|absolut|bacardi|whisky|vodka|gin|beer|wine/i.test(p.name));
    expect(branded.every((p) => p.adultsOnly)).toBe(true);
  });
});

describe("gift ideas", () => {
  it("have unique ids", () => {
    expect(new Set(giftIdeas.map((i) => i.id)).size).toBe(giftIdeas.length);
  });
});
