import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { externalProducts, getShop, shops } from "./external-products";
import { illustrationFor } from "./illustrations";
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
  it("has unique ids and links to each shop's own product pages", () => {
    expect(new Set(externalProducts.map((p) => p.id)).size).toBe(externalProducts.length);
    for (const p of externalProducts) expect(p.url.startsWith(`${getShop(p.shopId).url}/products/`), p.id).toBe(true);
    expect(externalProducts.length).toBeGreaterThan(50);
  });

  it("only shows photos for shops whose permission is confirmed", () => {
    expect(shops.find((s) => s.id === "drunken-mug")?.photoPermission).toBe("granted");
    expect(shops.filter((s) => s.id !== "drunken-mug").every((s) => s.photoPermission === "pending")).toBe(true);
  });

  it("every product without photo permission has a drawn illustration of its kind", () => {
    const pending = externalProducts.filter((p) => getShop(p.shopId).photoPermission !== "granted");
    expect(pending.every((p) => illustrationFor(p) !== "gift")).toBe(true);
  });

  it("small brands' prices are real and within the import range", () => {
    const small = externalProducts.filter((p) => p.shopId !== "drunken-mug");
    expect(small.length).toBeGreaterThanOrEqual(100);
    expect(small.every((p) => p.price >= 199 && p.price <= 12000)).toBe(true);
  });

  it("marks liquor-branded pieces 18+", () => {
    const branded = externalProducts.filter(
      (p) => p.shopId === "drunken-mug" && /old monk|jameson|absolut|bacardi|whisky|vodka|gin|beer|wine/i.test(p.name),
    );
    expect(branded.every((p) => p.adultsOnly)).toBe(true);
  });
});

describe("gift ideas", () => {
  it("have unique ids", () => {
    expect(new Set(giftIdeas.map((i) => i.id)).size).toBe(giftIdeas.length);
  });
});
