/**
 * PRODUCTS FROM ONLINE SHOPS — real listings on other websites.
 *
 * Currently The Drunken Mug (upcycled bottle glassware), collected by hand from
 * its public website on 21 Oct 2026. Names, prices and links come from the
 * shop; prices change, so the UI always shows the "checked on" date and sends
 * shoppers to the shop to buy. GIFTWALA has no partnership, feed or checkout
 * with the shop: stock, delivery, payment and returns are handled by the shop.
 * The site owner confirmed photos from The Drunken Mug can be used.
 *
 * Items marked `adultsOnly` carry liquor branding and are only suggested for
 * adult recipients.
 */
import type { InterestId, OccasionId } from "@/lib/types";

export interface Shop {
  id: string;
  name: string;
  url: string;
}

export interface ExternalProduct {
  id: string;
  name: string;
  shopId: string;
  /** The product page on the shop's site. */
  url: string;
  /** Selling price in rupees when checked. */
  price: number;
  /** The shop's listed MRP / original price, when shown. */
  compareAt?: number;
  priceCheckedOn: string;
  image: { src: string; alt: string };
  category: string;
  summary: string;
  tags: string[];
  interests: InterestId[];
  occasions: OccasionId[];
  adultsOnly?: boolean;
}

export const shops: Shop[] = [
  { id: "drunken-mug", name: "The Drunken Mug", url: "https://www.thedrunkenmug.in" },
];

const CHECKED = "2026-10-21";
const tdm = (file: string) => `https://cdn.shopify.com/s/files/1/0695/1298/6683/files/${file}`;
const BAR: string[] = ["barware", "bar", "drinks", "drink", "glassware", "glass", "upcycled", "sustainable", "eco"];

export const externalProducts: ExternalProduct[] = [
  // ── The Drunken Mug · upcycled bottle glassware ────────────────────────
  {
    id: "x-tdm-old-monk-mug",
    name: "The Original Old Monk Upcycled Glass Mug",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/original-old-monk-upcycled-glass-mug-600ml",
    price: 479,
    compareAt: 600,
    priceCheckedOn: CHECKED,
    image: { src: tdm("fix_img.png?v=1789456503"), alt: "The Original Old Monk upcycled glass mug" },
    category: "Barware",
    summary: "A heavy glass mug cut from an Old Monk bottle.",
    tags: [...BAR, "rum", "old monk", "mug"],
    interests: ["home-decor"],
    occasions: ["birthday", "just-because", "thank-you"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-old-monk-face-2",
    name: "Old Monk Face Glass 600ml, Set of 2",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/old-monk-glass-600-ml-5",
    price: 599,
    compareAt: 750,
    priceCheckedOn: CHECKED,
    image: { src: tdm("Old_Monk_Face_Glass_600Ml_Set_Of_2.jpg?v=1789455300"), alt: "Two Old Monk face glasses" },
    category: "Barware",
    summary: "A pair of tall glasses cut from Old Monk bottles, face embossing intact.",
    tags: [...BAR, "rum", "old monk", "pair", "couple"],
    interests: ["home-decor"],
    occasions: ["birthday", "anniversary", "wedding", "just-because"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-jameson-4",
    name: "Jameson Glass, Set of 4",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/jameson-glass-350-ml-3",
    price: 839,
    compareAt: 1050,
    priceCheckedOn: CHECKED,
    image: { src: tdm("Jameson_Glass_Set_Of_4.jpg?v=1789454868"), alt: "Four glasses cut from Jameson bottles" },
    category: "Barware",
    summary: "Four whiskey glasses cut from Jameson bottles.",
    tags: [...BAR, "whisky", "whiskey", "jameson", "set"],
    interests: ["home-decor"],
    occasions: ["birthday", "thank-you", "festivals"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-green-slim-6",
    name: "Green Bottle Slim Glasses, Set of 6",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/bottle-glass-250-ml",
    price: 1919,
    compareAt: 2400,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("Upcycled_Green_Bottle_Slim_Glasses_Set_of_6_-_250_ML_-_Made_from_Heineken_Bottles.jpg?v=1789455884"),
      alt: "Six slim green glasses made from Heineken bottles",
    },
    category: "Barware",
    summary: "Six slim green glasses cut from Heineken bottles.",
    tags: [...BAR, "beer", "heineken", "set", "housewarming"],
    interests: ["home-decor"],
    occasions: ["wedding", "festivals", "thank-you"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-jager-platter",
    name: "Jägermeister Green Bottle Platter with Cork",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/j-germeister-bottle-platter-30cm",
    price: 599,
    compareAt: 750,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("Upcycled_Jagermeister_Green_Bottle_Platter_with_Cork_-_550_ML_-_9.5_Inches.jpg?v=1789454120"),
      alt: "A flattened green Jägermeister bottle used as a serving platter",
    },
    category: "Barware",
    summary: "A melted-flat Jägermeister bottle with cork feet, for serving snacks.",
    tags: [...BAR, "platter", "serving", "party", "host"],
    interests: ["home-decor"],
    occasions: ["festivals", "just-because"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-ballantines-jug",
    name: "Ballantine’s Bottle Serving Jug, Amber Glass",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/ballantine-s-bottle-serving-jug-1l",
    price: 599,
    compareAt: 750,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("Upcycled_Ballantine_s_Bottle_Serving_Jug_Amber_Glass_-_With_Handle.jpg?v=1789454135"),
      alt: "An amber glass serving jug with a handle, made from a Ballantine's bottle",
    },
    category: "Barware",
    summary: "An amber serving jug with a handle, cut from a Ballantine’s bottle.",
    tags: [...BAR, "whisky", "jug", "serving", "host"],
    interests: ["home-decor"],
    occasions: ["festivals", "wedding", "thank-you"],
    adultsOnly: true,
  },
  {
    id: "x-tdm-green-jug-cork",
    name: "Green Glass Jug with Marble Cork Stopper",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/glass-jug-free-size",
    price: 839,
    compareAt: 1050,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("Upcycled_Green_Glass_Jug_with_Handcrafted_Marble_Cork_Stopper.jpg?v=1789455651"),
      alt: "A green upcycled glass jug with a marble-patterned cork stopper",
    },
    category: "Home & table",
    summary: "An upcycled green bottle jug with a handcrafted marble cork stopper.",
    tags: ["upcycled", "sustainable", "eco", "jug", "glassware", "home", "table", "water"],
    interests: ["home-decor"],
    occasions: ["wedding", "festivals", "thank-you", "just-because"],
  },
  {
    id: "x-tdm-citrus-straws",
    name: "Glass Straws with Citrus Charm, Set of 6",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/glass-stirrer-8inches",
    price: 1319,
    compareAt: 1650,
    priceCheckedOn: CHECKED,
    image: { src: tdm("Glass_Straw_with_Citrus_Charm_-_Set_of_6.jpg?v=1789455822"), alt: "Six glass straws with small citrus charms" },
    category: "Home & table",
    summary: "Six reusable glass straws, each with a little citrus charm.",
    tags: ["eco", "sustainable", "reusable", "straws", "glassware", "mocktail", "cocktail", "summer"],
    interests: ["home-decor", "food-coffee"],
    occasions: ["birthday", "just-because", "thank-you"],
  },
  {
    id: "x-tdm-diet-coke-sipper",
    name: "Diet Coke Sipper",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/diet-coke-sipper",
    price: 549,
    compareAt: 690,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("80942bcf-581e-49f2-afcb-00bca53fa275_5073b926-97d1-4680-b63d-5ae9cb8891d5.jpg?v=1790243713"),
      alt: "A white Diet Coke themed glass sipper",
    },
    category: "Drinkware",
    summary: "A glass sipper for the friend who's never without a Diet Coke.",
    tags: ["diet coke", "coke", "soda", "sipper", "glassware", "upcycled", "fun"],
    interests: ["food-coffee"],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-tdm-toothpick-holder",
    name: "Artisan Glass Toothpick Holder with Cork Base",
    shopId: "drunken-mug",
    url: "https://www.thedrunkenmug.in/products/artisan-glass-toothpick-free-size",
    price: 479,
    compareAt: 600,
    priceCheckedOn: CHECKED,
    image: {
      src: tdm("Artisan_Glass_Toothpick_Holder_with_Cork_Base_Set_of_2.jpg?v=1789455396"),
      alt: "Two small glass toothpick holders on cork bases",
    },
    category: "Home & table",
    summary: "A pair of small glass holders on cork bases for the dining table.",
    tags: ["upcycled", "glassware", "table", "kitchen", "home", "dining"],
    interests: ["home-decor"],
    occasions: ["thank-you", "festivals", "just-because"],
  },

];

export function getShop(id: string): Shop {
  const shop = shops.find((s) => s.id === id);
  if (!shop) throw new Error(`Unknown shop id: ${id}`);
  return shop;
}
