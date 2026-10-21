/**
 * PRODUCTS FROM ONLINE SHOPS — real listings on other websites.
 *
 * Collected by hand from each shop's public website on 21 Oct 2026. Names,
 * prices and links were read from the shop's own pages; prices change, so the
 * UI always shows the "checked on" date and sends shoppers to the shop to buy.
 * GIFTWALA has no partnership, feed or checkout with these shops: stock,
 * delivery, payment and returns are handled entirely by the shop.
 *
 * Product photos are the shops' own images, shown with the site owner's
 * decision to use them; confirm permission with each shop before launch.
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
  { id: "decathlon", name: "Decathlon India", url: "https://www.decathlon.in" },
];

const CHECKED = "2026-10-21";
const tdm = (file: string) => `https://cdn.shopify.com/s/files/1/0695/1298/6683/files/${file}`;
const dec = (path: string) => `https://contents.mediadecathlon.com/${path}`;
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

  // ── Decathlon India · sport and outdoor gear ───────────────────────────
  {
    id: "x-dec-ew550-bat",
    name: "Adult English Willow Cricket Bat G5, Size SH (EW550)",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8937266/ew-550-adult",
    price: 12999,
    compareAt: 19999,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p3109346/5440d356923b778c36313774a6c4e02d/adult-english-willow-cricket-bat-g5-size-sh-lightweight-leather-ball-bat-with-cover-ew550.jpg"),
      alt: "An English willow cricket bat with cover",
    },
    category: "Cricket",
    summary: "A lightweight English willow bat for leather-ball cricket, with a cover.",
    tags: ["cricket", "bat", "batting", "english willow", "leather ball", "sport"],
    interests: [],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-cricket-kit",
    name: "Cricket All Weather Plastic Kit CST500",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8667641/cricket-all-weather-plastic-kit-cst500",
    price: 1499,
    compareAt: 2299,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p2239229/eebfc19ce3ad5a218eaa97f06fdcfa1d/cricket-all-weather-plastic-kit-cst500.jpg"),
      alt: "A plastic cricket set with bat, ball and stumps",
    },
    category: "Cricket",
    summary: "A plastic bat, ball and stumps set for games at the beach, park or terrace.",
    tags: ["cricket", "bat", "kit", "stumps", "outdoor", "beach", "sport", "family"],
    interests: [],
    occasions: ["birthday", "just-because", "festivals"],
  },
  {
    id: "x-dec-t500-bat",
    name: "Adult Hard Plastic Cricket Bat T500 Lite",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8882604/cricket-box-set-bat-t500-light",
    price: 799,
    compareAt: 949,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p3258509/f4a332a510439675111ec8e433077738/adult-hard-plastic-cricket-bat-size-sh-soft-for-tennis-ball-t500-lite-box-black.jpg"),
      alt: "A black hard plastic cricket bat for tennis-ball cricket",
    },
    category: "Cricket",
    summary: "A light hard-plastic bat for tennis-ball and box cricket.",
    tags: ["cricket", "bat", "tennis ball", "box cricket", "sport"],
    interests: [],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-br100-set",
    name: "Adult Badminton Racket BR 100 Starter Set",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8515771/adult-badminton-racket-br-100-set-starter-blue-red",
    price: 799,
    compareAt: 1199,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p2780752/182b98879310a830f68503e383e30c51/adult-badminton-racket-br-100-set-starter-blue-red.jpg"),
      alt: "Two badminton rackets, one blue and one red, with shuttlecocks",
    },
    category: "Badminton",
    summary: "Two rackets and shuttles: enough to start playing together.",
    tags: ["badminton", "racket", "racquet", "shuttle", "pair", "sport", "couple", "family"],
    interests: [],
    occasions: ["birthday", "anniversary", "just-because"],
  },
  {
    id: "x-dec-br100-racket",
    name: "Adult Badminton Racket BR 100",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8515767/adult-badminton-racket-br-100-blue",
    price: 299,
    compareAt: 499,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p2664135/57ab7df0240b5a42ddd901776a7e9917/adult-badminton-racket-br-100-blue.jpg"),
      alt: "A blue badminton racket",
    },
    category: "Badminton",
    summary: "An entry-level racket for casual games.",
    tags: ["badminton", "racket", "racquet", "sport"],
    interests: [],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-shuttles",
    name: "Badminton Plastic Shuttlecock PSC 100, Pack of 6",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8333131/badminton-plastic-shuttlecock-psc-100x6-yellow",
    price: 299,
    compareAt: 599,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p1588369/54fd992cbd2e6622bde8b147ea56d44d/badminton-plastic-shuttlecock-psc-100x6-yellow.jpg"),
      alt: "A tube of six yellow plastic shuttlecocks",
    },
    category: "Badminton",
    summary: "Six durable plastic shuttles for regular play.",
    tags: ["badminton", "shuttle", "shuttlecock", "sport"],
    interests: [],
    occasions: ["just-because", "thank-you"],
  },
  {
    id: "x-dec-mt100-50l",
    name: "Hiking & Trekking 50L Backpack MT100",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8735043/50-l-trekking-backpack-mt100",
    price: 2999,
    compareAt: 4999,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p2607010/23d6eba05a69b56da2fb6e5661e31a51/hiking-trekking-padded-back-support-50l-backpack.jpg"),
      alt: "A 50 litre trekking backpack with padded back support",
    },
    category: "Trekking",
    summary: "A 50-litre pack with padded back support for weekend treks.",
    tags: ["trek", "trekking", "hiking", "backpack", "mountain", "camping", "outdoor", "adventure", "travel"],
    interests: [],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-easyfit-50l",
    name: "Trekking Bag 50L Easy-Fit MT100",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8559690/trekking-bag-50l-easy-fit-mt-100-black",
    price: 4999,
    compareAt: 6999,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p2774762/b2201dbca82ba79b0529b7dae4388f81/trekking-bag-50l-easy-fit-mt-100-black.jpg"),
      alt: "A black 50 litre trekking bag with adjustable fit",
    },
    category: "Trekking",
    summary: "An adjustable-fit 50-litre trekking bag for multi-day trips.",
    tags: ["trek", "trekking", "hiking", "backpack", "mountain", "mountaineering", "outdoor", "adventure", "travel"],
    interests: [],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-yoga-6mm",
    name: "Yoga Mat 6mm with Carry Strap",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8600557/yoga-mat-6mm-thick-183-x-61-cm-better-grip-with-carry-strap-green",
    price: 999,
    compareAt: 1699,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p3157850/ef8cfce0bb7ded07ed741d0c96475e2f/yoga-mat-6mm-thick-183-x-61-cm-better-grip-with-carry-strap-green.jpg"),
      alt: "A green 6mm yoga mat with a carry strap",
    },
    category: "Fitness",
    summary: "A 6mm grippy mat with a carry strap for classes or home practice.",
    tags: ["yoga", "mat", "fitness", "workout", "wellness", "self-care"],
    interests: ["self-care"],
    occasions: ["birthday", "just-because"],
  },
  {
    id: "x-dec-yoga-8mm",
    name: "8mm Grippy and Comfortable Gentle Yoga Mat",
    shopId: "decathlon",
    url: "https://www.decathlon.in/p/8665059/8-mm-grippy-and-comfortable-gentle-yoga-mat-dark-blue",
    price: 1999,
    compareAt: 3499,
    priceCheckedOn: CHECKED,
    image: {
      src: dec("p3157847/6941035ab78b8548a467e7e88774f2a9/8-mm-grippy-and-comfortable-gentle-yoga-mat-dark-blue.jpg"),
      alt: "A thick dark blue yoga mat",
    },
    category: "Fitness",
    summary: "A thick, cushioned 8mm mat that's gentle on knees.",
    tags: ["yoga", "mat", "fitness", "wellness", "self-care", "pilates"],
    interests: ["self-care"],
    occasions: ["birthday", "just-because", "thank-you"],
  },
];

export function getShop(id: string): Shop {
  const shop = shops.find((s) => s.id === id);
  if (!shop) throw new Error(`Unknown shop id: ${id}`);
  return shop;
}
