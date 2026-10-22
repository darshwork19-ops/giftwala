import type { ExternalProduct } from "./external-products";

/**
 * Which drawn illustration stands in for a product whose shop hasn't
 * confirmed photo use. It shows the kind of thing (coffee, a cricket bat),
 * never the product itself, and is always labelled as an illustration.
 */
export type IllustrationTheme =
  | "coffee"
  | "tea"
  | "yoga"
  | "notebook"
  | "photobook"
  | "dog"
  | "cat"
  | "plant"
  | "boardgame"
  | "cricket"
  | "cycling"
  | "climbing"
  | "camping"
  | "outdoorwear"
  | "backpack"
  | "clay"
  | "copper"
  | "candle"
  | "gift";

const BY_SHOP: Record<string, IllustrationTheme> = {
  "dope-coffee": "coffee",
  "corridor-seven": "coffee",
  "tea-culture": "tea",
  "kosha-yoga": "yoga",
  greenkin: "plant",
  "kreeda-games": "boardgame",
  tramboo: "cricket",
  "bums-on-the-saddle": "cycling",
  trawoc: "backpack",
  claymen: "clay",
  "studio-coppre": "copper",
  "misa-candles": "candle",
};

export function illustrationFor(product: Pick<ExternalProduct, "shopId" | "category" | "name">): IllustrationTheme {
  const text = `${product.category} ${product.name}`.toLowerCase();
  switch (product.shopId) {
    case "odd-giraffe":
      return /photo/.test(text) ? "photobook" : "notebook";
    case "pawsindia":
      return /\bcat\b|kitten|scratcher/.test(text) && !/\bdog\b/.test(text) ? "cat" : "dog";
    case "gokyo":
    case "tripole":
      if (/climb|belay|ascender/.test(text)) return "climbing";
      if (/tent|sleeping|camp/.test(text)) return "camping";
      if (/bag|pack|rucksack/.test(text)) return "backpack";
      return "outdoorwear";
  }
  return BY_SHOP[product.shopId] ?? "gift";
}
