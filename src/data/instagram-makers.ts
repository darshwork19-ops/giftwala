/**
 * MUMBAI MAKERS ON INSTAGRAM — real, independent gifting businesses.
 *
 * Source: the site owner's Mumbai gifting research (AI Hack), re-checked on
 * 21 Oct 2026 with Apify's Instagram profile and post scrapers. Each maker:
 *  - is a public, Mumbai-based gifting business with 500+ followers;
 *  - posted within the last 60 days;
 *  - passed an engagement check on recent posts: median likes ≥ 0.3% of
 *    followers AND (avg comments ≥ 0.5 OR likes ≥ 1%), or — where the account
 *    hides like counts — an average of ≥ 2 comments per post.
 * Instagram doesn't publish share counts, so shares could not be checked.
 *
 * These makers sell by Instagram DM: there are no listed prices, stock or
 * delivery data, so the UI never shows a price or delivery promise for them.
 * Descriptions are GIFTWALA's own summaries of what each account offers; no
 * photos, personal names or phone numbers are stored.
 */
import type { InterestId, OccasionId } from "@/lib/types";

export interface InstagramMaker {
  id: string;
  name: string;
  handle: string;
  /** What they make, in a line. */
  makes: string;
  followers: number;
  /** Median likes on recent posts, or null when the account hides likes. */
  medianLikes: number | null;
  avgComments: number;
  checkedOn: string;
  tags: string[];
  interests: InterestId[];
  occasions: OccasionId[];
}

const CHECKED = "2026-10-21";
const HAMPER = ["hamper", "hampers", "gift box", "gift", "gifts", "custom", "personalised", "curated"];
const BAKE = ["cake", "cakes", "bakery", "baker", "baked", "dessert", "desserts", "sweet", "treat", "treats"];

export const instagramMakers: InstagramMaker[] = [
  {
    id: "ig-giftbyjiggiart",
    name: "Gift by Jiggiart",
    handle: "giftbyjiggiart_official",
    makes: "Artwork gifts: custom photo frames, pencil sketches and digital portraits.",
    followers: 873,
    medianLikes: 33.5,
    avgComments: 10.6,
    checkedOn: CHECKED,
    tags: ["art", "artwork", "portrait", "sketch", "pencil", "drawing", "illustration", "photo frame", "frame", "photos", "custom", "personalised", "memories"],
    interests: ["art-handmade", "keepsakes", "personalised"],
    occasions: ["birthday", "anniversary", "wedding", "just-because"],
  },
  {
    id: "ig-junior-crew",
    name: "The Junior Crew",
    handle: "junior_crew11",
    makes: "Small customised gifts and hampers, including handmade shell keepsakes.",
    followers: 592,
    medianLikes: 17,
    avgComments: 10.6,
    checkedOn: CHECKED,
    tags: [...HAMPER, "handmade", "keepsake", "keepsakes", "shell", "small gifts", "return gifts"],
    interests: ["keepsakes", "art-handmade", "personalised"],
    occasions: ["birthday", "just-because", "thank-you"],
  },
  {
    id: "ig-crumbles-by-anokhi",
    name: "Crumbles by Anokhi",
    handle: "crumblesbyanokhi",
    makes: "Handcrafted, eggless bakes: doughnuts, cookies and chocolate treats.",
    followers: 1053,
    medianLikes: 22,
    avgComments: 1.6,
    checkedOn: CHECKED,
    tags: [...BAKE, "eggless", "cookies", "cookie", "doughnuts", "donuts", "chocolate", "baking"],
    interests: ["food-coffee"],
    occasions: ["birthday", "thank-you", "just-because"],
  },
  {
    id: "ig-sugarsins",
    name: "SugarSins",
    handle: "sugarsins.cakes",
    makes: "Celebration cakes and bakes from a small Mumbai home bakery.",
    followers: 2478,
    medianLikes: 23,
    avgComments: 2.6,
    checkedOn: CHECKED,
    tags: [...BAKE, "birthday cake", "celebration", "baking"],
    interests: ["food-coffee"],
    occasions: ["birthday", "anniversary", "just-because"],
  },
  {
    id: "ig-scribble-along",
    name: "Scribble Along",
    handle: "scribblealong",
    makes: "Luxury gift hampers and bespoke packaging for celebrations and weddings.",
    followers: 6604,
    medianLikes: 39.5,
    avgComments: 33.3,
    checkedOn: CHECKED,
    tags: [...HAMPER, "luxury", "packaging", "wedding hamper", "bespoke"],
    interests: ["personalised"],
    occasions: ["wedding", "festivals", "birthday", "anniversary"],
  },
  {
    id: "ig-sweet-surprise",
    name: "Sweet Surprise",
    handle: "sweetsurprise.sr",
    makes: "Waffle treats, artisanal chocolates and customised baby-announcement goodies.",
    followers: 2675,
    medianLikes: 10.5,
    avgComments: 1.2,
    checkedOn: CHECKED,
    tags: [...BAKE, "waffle", "waffles", "chocolate", "chocolates", "baby", "baby announcement", "new baby"],
    interests: ["food-coffee"],
    occasions: ["birthday", "just-because", "thank-you"],
  },
  {
    id: "ig-twinkling-crafts",
    name: "Twinkling Crafts",
    handle: "twinkling_crafts",
    makes: "Personalised gifts, wedding favours and festive gift sets.",
    followers: 7336,
    medianLikes: 22.5,
    avgComments: 6.2,
    checkedOn: CHECKED,
    tags: [...HAMPER, "favours", "wedding favours", "diwali", "festive", "craft", "crafts"],
    interests: ["personalised", "art-handmade"],
    occasions: ["wedding", "festivals", "birthday"],
  },
  {
    id: "ig-decor-designs-by-tash",
    name: "Decor Designs by Tash",
    handle: "decordesignsbytash",
    makes: "Balloon and floral bouquets, premium hampers and trousseau packing.",
    followers: 1114,
    medianLikes: 20,
    avgComments: 3.5,
    checkedOn: CHECKED,
    tags: [...HAMPER, "balloons", "balloon", "bouquet", "flowers", "floral", "trousseau", "diwali"],
    interests: ["plants-nature"],
    occasions: ["birthday", "wedding", "anniversary", "festivals"],
  },
  {
    id: "ig-tck",
    name: "TCK – The Chocolate Kitchen",
    handle: "tck_thechocolatekitchen",
    makes: "Artisanal chocolate gift hampers, including festive and baby-announcement boxes.",
    followers: 6322,
    medianLikes: null,
    avgComments: 8.8,
    checkedOn: CHECKED,
    tags: ["chocolate", "chocolates", "artisanal", "hamper", "hampers", "diwali", "festive", "baby announcement", "sweet", "treat"],
    interests: ["food-coffee"],
    occasions: ["festivals", "birthday", "thank-you", "wedding"],
  },
  {
    id: "ig-craft-auras",
    name: "Craft Auras",
    handle: "craftauras",
    makes: "Personalised gift hampers and return favours, made to order.",
    followers: 1210,
    medianLikes: 9.5,
    avgComments: 0.7,
    checkedOn: CHECKED,
    tags: [...HAMPER, "return favours", "favours", "made to order"],
    interests: ["personalised"],
    occasions: ["birthday", "wedding", "just-because"],
  },
  {
    id: "ig-parva-creations",
    name: "Parva Creations",
    handle: "parva.creations",
    makes: "Custom gift hampers, ring platters, baby hampers and trousseau packing.",
    followers: 1471,
    medianLikes: 17.5,
    avgComments: 0.3,
    checkedOn: CHECKED,
    tags: [...HAMPER, "ring platter", "engagement", "baby", "baby hamper", "trousseau", "wedding"],
    interests: ["personalised"],
    occasions: ["wedding", "birthday", "festivals"],
  },
  {
    id: "ig-chunks-of-heaven",
    name: "Chunks of Heaven",
    handle: "chunks.of.heaven_",
    makes: "Curated hampers with balloon and floral styling for celebrations.",
    followers: 1543,
    medianLikes: null,
    avgComments: 5.3,
    checkedOn: CHECKED,
    tags: [...HAMPER, "balloons", "balloon", "flowers", "floral", "party", "diwali"],
    interests: ["plants-nature"],
    occasions: ["birthday", "festivals", "anniversary"],
  },
  {
    id: "ig-bombay-board",
    name: "The Bombay Board",
    handle: "thebombayboard",
    makes: "Cheese and charcuterie boards, grazing platters and food gift boxes.",
    followers: 3701,
    medianLikes: 47,
    avgComments: 5.5,
    checkedOn: CHECKED,
    tags: ["cheese", "charcuterie", "grazing", "platter", "board", "food", "foodie", "gourmet", "party", "host", "snacks"],
    interests: ["food-coffee"],
    occasions: ["festivals", "birthday", "thank-you", "anniversary"],
  },
];

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}
