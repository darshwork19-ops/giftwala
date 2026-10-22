import type { IllustrationTheme } from "@/data/illustrations";

/** Shapes shared by the /api/match route and the Gift Finder page. */

export interface MatchRequest {
  brief: string;
  /** Product ids already shown, so "show other ideas" returns new ones. */
  exclude?: string[];
  /** Overrides the budget read from the brief (used by "less expensive"). */
  budgetMax?: number;
  /** "rules" skips AI ranking (used after an AI error, only when asked). */
  mode?: "auto" | "rules";
  /** A refinement that re-ranks the same brief ("more practical", "more unusual"…). */
  prefer?: Preference;
}

export type Preference = "practical" | "unusual" | "experiences" | "handmade";

/**
 * - results:   at least one validated listing or labelled gift idea.
 * - no_match:  a real request, but nothing fits; nothing is shown.
 * - follow_up: a gift request without enough to go on; one question asked.
 * - nonsense / off_topic: not a gift request; no products shown.
 * - ai_error:  the AI failed; nothing is shown instead of a generic list.
 */
export type FinderStatus = "results" | "no_match" | "follow_up" | "nonsense" | "off_topic" | "ai_error";

/**
 * Delivery status for a listing, never stronger than the data allows.
 * - estimated:    destination and date given, the sample maker serves it and
 *                 the sample lead time fits. Still an estimate, not a slot.
 * - not_verified: destination or date missing, or the PIN can't be mapped.
 */
export interface DeliveryInfo {
  status: "estimated" | "not_verified";
  label: string;
}

/** A real record from the GIFTWALA (demo) catalogue. */
export interface ListingCard {
  kind: "listing";
  id: string;
  slug: string;
  name: string;
  price: number;
  image: { src: string; alt: string };
  maker: { name: string; slug: string; location: string };
  reason: string;
  personalisable: boolean;
  delivery: DeliveryInfo;
  /** Earliest estimated arrival (sample lead times), for pre-filling requests. */
  arrival: string;
}

/** A real product on another shop's website. GIFTWALA doesn't sell it. */
export interface ExternalCard {
  kind: "external";
  id: string;
  name: string;
  shop: { name: string; url: string };
  url: string;
  price: number;
  compareAt?: number;
  priceCheckedOn: string;
  /** Null until the shop's photo permission is confirmed (text-only card). */
  image: { src: string; alt: string } | null;
  /** Drawn stand-in shown when `image` is null. */
  illustration: IllustrationTheme;
  category: string;
  summary: string;
  reason: string;
  adultsOnly: boolean;
}

/** An independent Mumbai maker who sells by Instagram DM (no listed prices). */
export interface MakerCard {
  kind: "instagram-maker";
  id: string;
  name: string;
  handle: string;
  /** Their Instagram profile. */
  url: string;
  /** Their page on GIFTWALA, with the products they show on Instagram. */
  studioUrl: string;
  /** Up to three product photos, when the maker's photos may be shown. */
  preview: { src: string; alt: string }[];
  makes: string;
  followers: number;
  medianLikes: number | null;
  avgComments: number;
  checkedOn: string;
  reason: string;
}

/** A gift concept with no seller, price, stock or link behind it. */
export interface IdeaCard {
  kind: "idea";
  id: string;
  title: string;
  summary: string;
  category: string;
  reason: string;
  lookFor: string[];
  whereToFind: string;
  form: string;
  /** The one question worth answering before buying, if any. */
  check?: string;
}

/** A product a verified Mumbai maker shows on Instagram (price on request). */
export interface MakerProductCard {
  kind: "maker-product";
  id: string;
  name: string;
  summary: string;
  category: string;
  /** Null when the maker's photos may not be shown. */
  image: { src: string; alt: string } | null;
  maker: { name: string; handle: string; studioUrl: string };
  postUrl: string;
  reason: string;
}

export type ResultKind = "listing" | "external" | "maker-product" | "idea";

/**
 * Display groups. Only groups with at least one result are shown.
 * - best:        the strongest matches of any kind
 * - experiences: things to do rather than things to own
 * - hobby:       gear, upgrades and learning for a stated interest
 * - makers:      independent Mumbai makers' products
 * - more:        other relevant options
 */
export type ResultGroup = "best" | "experiences" | "hobby" | "makers" | "more";

/** One entry in the ranked, de-duplicated shortlist; the card lives in its kind's array. */
export interface ResultRef {
  kind: ResultKind;
  id: string;
  group: ResultGroup;
  /** Words from the brief this result matched, for "focus on one interest". */
  matched: string[];
}

export interface FinderResponse {
  status: FinderStatus;
  /** Shown for every status except plain results. */
  message?: string;
  followUp?: { question: string; suggestions: string[] };
  /** "ai" only when a model ranked and explained the listings. */
  mode: "ai" | "rules";
  provider?: "Gemini" | "Claude";
  understood: {
    summary?: string;
    budgetMax?: number;
    date?: { iso: string; label: string };
    destination?: { label: string; kind: "zone" | "region" | "outside" };
    recipient?: string;
    occasion?: string;
    interests: string[];
  };
  listings: ListingCard[];
  /** Matching products on other shops' websites (bought there). */
  external: ExternalCard[];
  /** Matching independent Mumbai makers who take orders on Instagram. */
  makers: MakerCard[];
  /** Well-loved catalogue gifts within the same budget/date/destination, shown separately. */
  popular: ListingCard[];
  ideas: IdeaCard[];
  /** Matching products from verified Mumbai makers. */
  makerProducts: MakerProductCard[];
  /**
   * The ranked, de-duplicated shortlist across every source, up to 15. Every
   * entry points at a card above; nothing appears here that isn't relevant.
   */
  results: ResultRef[];
  /** Set when fewer than 10 relevant results exist, with ways to see more. */
  limited?: { note: string; broaden: ("budget" | "date" | "area" | "interests")[] };
  /** Explains what delivery checks were (and weren't) possible. */
  deliveryNote?: string;
  excludedNote?: string;
  /** Relevant listings not shown yet ("show other ideas"). */
  remaining: number;
}
