import { unsplash } from "@/lib/images";
import type { Maker } from "@/lib/types";

/**
 * SAMPLE DATA — these makers are fictional demonstration records created for
 * this hackathon build. They are not real businesses, partners or verified
 * sellers. Photography is stock imagery from Unsplash.
 */
export const makers: Maker[] = [
  {
    id: "mitti-studio",
    slug: "mitti-studio",
    name: "Mitti Studio",
    location: "Bandra West, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs"],
    deliveryDays: 1,
    craft: "Hand-thrown stoneware",
    tagline: "Small-batch stoneware, thrown and glazed by hand.",
    story:
      "Mitti Studio is a two-person pottery studio making everyday pieces meant to be used, not kept on a shelf. Every mug and vase is thrown on the wheel, so no two are quite the same.",
    process:
      "Pieces are wheel-thrown, trimmed, bisque-fired and finished with food-safe glazes in a second firing.",
    image: {
      src: unsplash("photo-1589051088132-06f36a22012a"),
      alt: "Hands covered in wet clay shaping the rim of a ceramic bowl",
    },
  },
  {
    id: "saanjh-candles",
    slug: "saanjh-candles",
    name: "Saanjh Candle Co.",
    location: "Andheri East, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs", "thane"],
    deliveryDays: 1,
    craft: "Soy wax candles",
    tagline: "Slow-burning candles for quiet evenings.",
    story:
      "Saanjh means dusk. The studio pours soy wax candles in small batches, with scents built around familiar things: sandalwood, monsoon earth, cardamom tea.",
    process:
      "Candles are hand-poured in soy wax with cotton wicks and cured before they are packed.",
    image: {
      src: unsplash("photo-1561212856-44e9bae482aa"),
      alt: "Close-up of a lit candle glowing in low light",
    },
  },
  {
    id: "kaagaz-and-co",
    slug: "kaagaz-and-co",
    name: "Kaagaz & Co.",
    location: "Dadar, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs", "thane", "navi-mumbai"],
    deliveryDays: 1,
    craft: "Handmade paper and bookbinding",
    tagline: "Journals and cards bound by hand.",
    story:
      "Kaagaz & Co. makes notebooks, writing sets and cards for people who still like the feel of pen on paper. Journals are stitched and bound in the studio.",
    process:
      "Covers are cut and pressed by hand, and pages are sewn in signatures so the journal lies flat.",
    image: {
      src: unsplash("photo-1591195852468-03a01d1375d6"),
      alt: "An open lined notebook with a ballpoint pen resting above it",
    },
  },
  {
    id: "cocoa-lane",
    slug: "cocoa-lane",
    name: "Cocoa Lane",
    location: "Lower Parel, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs"],
    deliveryDays: 1,
    craft: "Small-batch chocolate",
    tagline: "Chocolate made in small batches.",
    story:
      "Cocoa Lane is a small chocolate kitchen making bars, bonbons and truffles. Flavours change with the season, and boxes are packed by hand the week they ship.",
    image: {
      src: unsplash("photo-1571091799989-e88304d6aed3"),
      alt: "Cocoa beans beside pieces of dark chocolate",
    },
  },
  {
    id: "hari-bhari",
    slug: "hari-bhari",
    name: "Hari Bhari",
    location: "Powai, Mumbai",
    deliveryZones: ["central", "western-suburbs", "thane"],
    deliveryDays: 1,
    craft: "Plants and terrariums",
    tagline: "Easy-going plants, potted and ready to gift.",
    story:
      "Hari Bhari grows and pots plants that forgive the occasional missed watering. Each one comes with a simple care card.",
    image: {
      src: unsplash("photo-1609061801093-1b7a8a574c69"),
      alt: "A leafy green plant in a white ceramic pot",
    },
  },
  {
    id: "phoolwari",
    slug: "phoolwari",
    name: "Phoolwari",
    location: "Matunga, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs", "thane", "navi-mumbai"],
    deliveryDays: 0,
    craft: "Floral design",
    tagline: "Bouquets arranged the morning they go out.",
    story:
      "Phoolwari is a small florist arranging seasonal bouquets by hand. Stems vary with what is fresh at the market, so the colours stay true but the exact flowers may change.",
    image: {
      src: unsplash("photo-1457089328109-e5d9bd499191"),
      alt: "A loose arrangement of assorted flowers on a table",
    },
  },
  {
    id: "dhaaga-weaves",
    slug: "dhaaga-weaves",
    name: "Dhaaga Weaves",
    location: "Colaba, Mumbai",
    deliveryZones: ["south-mumbai", "central"],
    deliveryDays: 2,
    craft: "Textiles and block print",
    tagline: "Soft textiles in quiet, lasting colours.",
    story:
      "Dhaaga Weaves works with fabric in natural fibres, making stoles, scarves and table linen for everyday wear and use.",
    image: {
      src: unsplash("photo-1755408007655-9ac329cfa145"),
      alt: "Carved wooden printing blocks with different patterns",
    },
  },
  {
    id: "pitara-hampers",
    slug: "pitara-hampers",
    name: "Pitara Hampers",
    location: "Malad West, Mumbai",
    deliveryZones: ["south-mumbai", "central", "western-suburbs", "thane", "navi-mumbai"],
    deliveryDays: 1,
    craft: "Curated gift hampers",
    tagline: "Hampers put together by hand, one at a time.",
    story:
      "Pitara is Hindi for a treasure box. The team assembles hampers around a mood, such as a slow morning or a festive evening, and packs each one by hand.",
    image: {
      src: unsplash("photo-1513885535751-8b9238bd345a"),
      alt: "A stack of wrapped gift boxes",
    },
  },
  {
    id: "tara-crafts",
    slug: "tara-crafts",
    name: "Tara Crafts",
    location: "Ghatkopar, Mumbai",
    deliveryZones: ["central", "western-suburbs", "thane", "navi-mumbai"],
    deliveryDays: 1,
    craft: "Brass, wood and small keepsakes",
    tagline: "Small keepsakes in brass and wood.",
    story:
      "Tara Crafts makes lamps, figurines and small pieces of jewellery: the kind of objects that end up on a windowsill for years.",
    image: {
      src: unsplash("photo-1783255571174-d329a3895407"),
      alt: "Hands holding a traditional brass lamp with several flames",
    },
  },
];
