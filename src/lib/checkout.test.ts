import { describe, expect, it } from "vitest";
import { getAllProducts, getMaker } from "@/lib/catalogue";
import {
  emptyBilling,
  emptyDelivery,
  isMumbaiPin,
  priceLine,
  summariseCart,
  validateBilling,
  validateDelivery,
  type CartLine,
} from "./checkout";
import { findArea } from "./finder/areas";

const TODAY = "2026-10-22";
const products = getAllProducts();
const withPaidOption = products.find((p) =>
  p.personalisation.some((o) => (o.kind === "text" ? o.extraCost > 0 : o.choices.some((c) => c.extraCost > 0))),
)!;
const gift = (productId: string, options: Record<string, string> = {}, quantity = 1): CartLine => ({
  id: productId,
  kind: "gift",
  productId,
  options,
  quantity,
});

describe("cart pricing", () => {
  it("prices from the catalogue, including paid personalisation and quantity", () => {
    const option = withPaidOption.personalisation.find((o) =>
      o.kind === "text" ? o.extraCost > 0 : o.choices.some((c) => c.extraCost > 0),
    )!;
    const value = option.kind === "text" ? "Asha" : option.choices.find((c) => c.extraCost > 0)!.id;
    const extra = option.kind === "text" ? option.extraCost : option.choices.find((c) => c.id === value)!.extraCost;
    const line = priceLine(gift(withPaidOption.id, { [option.id]: value }, 2), TODAY)!;
    expect(line.unitPrice).toBe(withPaidOption.price + extra);
    expect(line.total).toBe((withPaidOption.price + extra) * 2);
  });

  it("drops lines whose product no longer exists", () => {
    expect(summariseCart([gift("does-not-exist")], TODAY).lines).toHaveLength(0);
  });

  it("prices a gift box as the sum of its gifts", () => {
    const [a, b] = products;
    const box = priceLine({ id: "b", kind: "box", productIds: [a.id, b.id], quantity: 1 }, TODAY)!;
    expect(box.unitPrice).toBe(a.price + b.price);
  });

  it("only allows zones every maker in the cart delivers to", () => {
    const cart = summariseCart(products.slice(0, 4).map((p) => gift(p.id)), TODAY);
    for (const zone of cart.zones) {
      expect(products.slice(0, 4).every((p) => getMaker(p.makerId).deliveryZones.includes(zone))).toBe(true);
    }
  });
});

describe("delivery and billing checks", () => {
  const cart = summariseCart([gift(products[0].id)], TODAY);
  const area = ["Andheri", "Dadar", "Colaba", "Thane", "Vashi"].find((a) => cart.zones.includes(findArea(a)!.zone))!;
  const good = { ...emptyDelivery, recipientName: "Asha", line1: "12 Sea View, Linking Road", area, pin: "400050", deliverBy: cart.earliest! };

  it("accepts a complete Mumbai address on or after the earliest date", () => {
    expect(validateDelivery(good, cart)).toEqual({});
  });

  it("rejects PINs outside Mumbai, Thane and Navi Mumbai", () => {
    expect(isMumbaiPin("400050")).toBe(true);
    expect(isMumbaiPin("110001")).toBe(false);
    expect(validateDelivery({ ...good, pin: "560001" }, cart).pin).toBeDefined();
  });

  it("rejects a date earlier than the order can arrive", () => {
    expect(validateDelivery({ ...good, deliverBy: TODAY }, cart).deliverBy).toBeDefined();
  });

  it("needs a full billing address only when it differs from delivery", () => {
    expect(validateBilling(emptyBilling)).toEqual({});
    const errors = validateBilling({ ...emptyBilling, sameAsDelivery: false });
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(["billing-name", "billing-line1", "billing-city", "billing-state", "billing-pin"]),
    );
    expect(
      validateBilling({ sameAsDelivery: false, name: "Asha Rao", line1: "4 MG Road", line2: "", city: "Pune", state: "Maharashtra", pin: "411001" }),
    ).toEqual({});
  });
});
