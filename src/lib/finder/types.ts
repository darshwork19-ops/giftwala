/** Shapes shared by the /api/match route and the Gift Finder page. */

export interface MatchRequest {
  brief: string;
  /** Product ids already shown, so "show other ideas" returns new ones. */
  exclude?: string[];
  /** Overrides the budget read from the brief (used by "less expensive"). */
  budgetMax?: number;
  /** "rules" skips AI ranking (used after an AI error, only when asked). */
  mode?: "auto" | "rules";
}

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
  image: { src: string; alt: string };
  category: string;
  summary: string;
  reason: string;
  adultsOnly: boolean;
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
  /** Well-loved catalogue gifts within the same budget/date/destination, shown separately. */
  popular: ListingCard[];
  ideas: IdeaCard[];
  /** Explains what delivery checks were (and weren't) possible. */
  deliveryNote?: string;
  excludedNote?: string;
  /** Relevant listings not shown yet ("show other ideas"). */
  remaining: number;
}
