import { categories, categoryLabel, occasions, recipients } from "@/data/taxonomy";
import { getAllProducts, getMaker, isPersonalisable } from "./catalogue";
import { formatPrice } from "./format";
import type { CategoryId, OccasionId, Product, RecipientId } from "./types";

/**
 * Catalogue search and filtering for /gifts.
 *
 * Everything is driven by URL search params so results are shareable and the
 * back button works. The flow is:
 *   1. `parseSearchParams` reads the raw URL values into `GiftFilters`.
 *   2. `interpretQuery` pulls simple intent ("under ₹1500", "for a friend")
 *      out of the free-text query.
 *   3. `searchGifts` combines both and returns matching, sorted products.
 * Explicit URL filters always win over anything read from the query text.
 */

export type SortId = "featured" | "relevance" | "price-asc" | "price-desc";

export const sortOptions: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "relevance", label: "Best match" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

/** Filters exactly as they appear in the URL. */
export interface GiftFilters {
  q?: string;
  occasion?: OccasionId;
  category?: CategoryId;
  recipient?: RecipientId;
  min?: number;
  max?: number;
  personalised?: boolean;
  sort?: SortId;
}

/** Intent read from the free-text query. */
export interface QueryIntent {
  /** Words left to match against product text once intent is removed. */
  terms: string[];
  occasion?: OccasionId;
  recipient?: RecipientId;
  min?: number;
  max?: number;
  personalised?: boolean;
}

export interface SearchResult {
  products: Product[];
  /** The filters actually applied (URL values merged with query intent). */
  applied: Omit<GiftFilters, "q" | "sort"> & { terms: string[] };
  /** Human-readable notes on what was understood from the query text. */
  understood: string[];
  sort: SortId;
  /** True when no product matched every word, so partial matches are shown. */
  partialMatch: boolean;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isOneOf = <T extends string>(ids: readonly { id: T }[], value?: string) =>
  ids.some((o) => o.id === value) ? (value as T) : undefined;

function toRupees(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export function parseSearchParams(params: RawParams): GiftFilters {
  const q = first(params.q)?.trim().slice(0, 100);
  return {
    q: q || undefined,
    occasion: isOneOf(occasions, first(params.occasion)),
    category: isOneOf(categories, first(params.category)),
    recipient: isOneOf(recipients, first(params.recipient)),
    min: toRupees(first(params.min)),
    max: toRupees(first(params.max)),
    personalised: first(params.personalised) === "1" || undefined,
    sort: isOneOf(sortOptions, first(params.sort)),
  };
}

// ── Query interpretation ──────────────────────────────────────────────────

const RECIPIENT_WORDS: Record<string, RecipientId> = {
  partner: "partner",
  wife: "partner",
  husband: "partner",
  girlfriend: "partner",
  boyfriend: "partner",
  fiance: "partner",
  fiancee: "partner",
  friend: "friend",
  friends: "friend",
  bestie: "friend",
  parent: "parent",
  parents: "parent",
  mom: "parent",
  mum: "parent",
  mother: "parent",
  dad: "parent",
  father: "parent",
  sibling: "sibling",
  sister: "sibling",
  brother: "sibling",
  colleague: "colleague",
  coworker: "colleague",
  boss: "colleague",
  teacher: "someone-else",
};

const OCCASION_PHRASES: [RegExp, OccasionId][] = [
  [/\bbirthdays?\b|\bbday\b/, "birthday"],
  [/\banniversary\b/, "anniversary"],
  [/\bthank(?:\s|-)?you\b|\bthanks\b/, "thank-you"],
  [/\bweddings?\b|\bnewlyweds?\b/, "wedding"],
  [/\bdiwali\b|\bfestivals?\b|\bfestive\b|\brakhi\b|\bholi\b|\beid\b|\bchristmas\b/, "festivals"],
  [/\bjust because\b/, "just-because"],
];

const PERSONALISED_PATTERN =
  /\bpersonali[sz]ed?\b|\bpersonali[sz]able\b|\bcustomi[sz]ed\b|\bcustom\b|\bengraved\b|\bmonogram(?:med)?\b/;

const AMOUNT = String.raw`(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?`;
const amount = (digits: string, k?: string) =>
  Number(digits.replace(/,/g, "")) * (k ? 1000 : 1);

const STOPWORDS = new Set([
  "a", "an", "the", "for", "my", "our", "to", "of", "and", "or", "with",
  "gift", "gifts", "present", "presents", "something", "some", "idea",
  "ideas", "her", "him", "them", "who", "loves", "likes", "nice", "good",
  "best", "i", "me", "in", "on", "is", "that", "this", "please",
]);

/**
 * Reads budget, recipient, occasion and personalisation intent out of a
 * query such as "personalised birthday candle for a friend under ₹1500".
 * Recognised phrases are removed; whatever is left becomes search terms.
 */
export function interpretQuery(query: string): QueryIntent {
  let text = query.toLowerCase().replace(/\s+/g, " ");
  const intent: QueryIntent = { terms: [] };

  const between = new RegExp(String.raw`\b(?:between|from)\s+${AMOUNT}\s*(?:and|to|-|–)\s*${AMOUNT}`);
  const range = new RegExp(String.raw`${AMOUNT}\s*(?:-|–|to)\s*${AMOUNT}`);
  const under = new RegExp(String.raw`\b(?:under|below|less than|upto|up to|within|max|maximum|budget(?: of)?)\s+${AMOUNT}`);
  const over = new RegExp(String.raw`\b(?:over|above|more than|at least|min|minimum)\s+${AMOUNT}`);

  let m = text.match(between) ?? text.match(range);
  if (m) {
    const a = amount(m[1], m[2]);
    const b = amount(m[3], m[4]);
    intent.min = Math.min(a, b);
    intent.max = Math.max(a, b);
    text = text.replace(m[0], " ");
  } else {
    if ((m = text.match(under))) {
      intent.max = amount(m[1], m[2]);
      text = text.replace(m[0], " ");
    }
    if ((m = text.match(over))) {
      intent.min = amount(m[1], m[2]);
      text = text.replace(m[0], " ");
    }
  }

  for (const [pattern, id] of OCCASION_PHRASES) {
    if (pattern.test(text)) {
      intent.occasion = id;
      text = text.replace(pattern, " ");
      break;
    }
  }

  if (PERSONALISED_PATTERN.test(text)) {
    intent.personalised = true;
    text = text.replace(PERSONALISED_PATTERN, " ");
  }

  const words = text.split(/[^\p{L}\p{N}&'-]+/u).filter(Boolean);
  const terms: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const recipient = RECIPIENT_WORDS[word];
    if (recipient) {
      intent.recipient ??= recipient;
      continue;
    }
    if (word === "for" && words[i + 1] === "two") {
      intent.recipient ??= "partner";
      i++;
      continue;
    }
    if (!STOPWORDS.has(word) && word.length > 1) terms.push(word);
  }
  intent.terms = terms;
  return intent;
}

// ── Matching ──────────────────────────────────────────────────────────────

interface IndexedProduct {
  product: Product;
  name: string;
  haystack: string;
}

let index: IndexedProduct[] | undefined;

function getIndex(): IndexedProduct[] {
  index ??= getAllProducts().map((product) => {
    const maker = getMaker(product.makerId);
    const haystack = [
      product.name,
      product.summary,
      product.description,
      product.tags.join(" "),
      product.category,
      categoryLabel(product.category),
      maker.name,
      maker.craft,
      ...(product.materials ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return { product, name: product.name.toLowerCase(), haystack };
  });
  return index;
}

/** Simple plural tolerance: "candles" matches "candle" and vice versa. */
function variants(term: string): string[] {
  const out = [term];
  if (term.endsWith("ies")) out.push(term.slice(0, -3) + "y");
  else if (term.endsWith("es")) out.push(term.slice(0, -2), term.slice(0, -1));
  else if (term.endsWith("s")) out.push(term.slice(0, -1));
  return out;
}

const wordMatch = (text: string, term: string) =>
  variants(term).some((v) => new RegExp(String.raw`\b${escapeRegExp(v)}`).test(text));

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Relevance score: name hits count most. 0 means the term set did not match. */
function score(item: IndexedProduct, terms: string[], requireAll: boolean) {
  let total = 0;
  let hits = 0;
  for (const term of terms) {
    if (wordMatch(item.name, term)) total += 3;
    if (wordMatch(item.haystack, term)) {
      total += 1;
      hits++;
    } else if (requireAll) {
      return 0;
    }
  }
  return hits === 0 ? 0 : total;
}

export function searchGifts(filters: GiftFilters): SearchResult {
  const intent = filters.q ? interpretQuery(filters.q) : { terms: [] };

  // Explicit URL filters win over intent read from the query text.
  const applied = {
    terms: intent.terms,
    occasion: filters.occasion ?? intent.occasion,
    category: filters.category,
    recipient: filters.recipient ?? intent.recipient,
    min: filters.min ?? intent.min,
    max: filters.max ?? intent.max,
    personalised: filters.personalised ?? intent.personalised,
  };

  const understood: string[] = [];
  if (!filters.occasion && intent.occasion)
    understood.push(occasions.find((o) => o.id === intent.occasion)!.label);
  if (!filters.recipient && intent.recipient)
    understood.push(`for a ${recipients.find((r) => r.id === intent.recipient)!.label.toLowerCase()}`);
  if (filters.min === undefined && filters.max === undefined && (intent.min || intent.max))
    understood.push(priceLabel(intent.min, intent.max));
  if (!filters.personalised && intent.personalised) understood.push("personalisable");

  const pool = getIndex().filter(({ product: p }) => {
    if (applied.occasion && !p.occasions.includes(applied.occasion)) return false;
    if (applied.category && p.category !== applied.category) return false;
    if (applied.recipient && !p.recipients.includes(applied.recipient)) return false;
    if (applied.min !== undefined && p.price < applied.min) return false;
    if (applied.max !== undefined && p.price > applied.max) return false;
    if (applied.personalised && !isPersonalisable(p)) return false;
    return true;
  });

  let partialMatch = false;
  let scored = pool.map((item) => ({ item, score: 1 }));
  if (applied.terms.length) {
    scored = pool
      .map((item) => ({ item, score: score(item, applied.terms, true) }))
      .filter((s) => s.score > 0);
    if (!scored.length && applied.terms.length > 1) {
      partialMatch = true;
      scored = pool
        .map((item) => ({ item, score: score(item, applied.terms, false) }))
        .filter((s) => s.score > 0);
    }
  }

  const sort = filters.sort ?? (applied.terms.length ? "relevance" : "featured");
  const byFeatured = (a: Product, b: Product) =>
    Number(!!b.featured) - Number(!!a.featured);

  scored.sort((a, b) => {
    const pa = a.item.product;
    const pb = b.item.product;
    switch (sort) {
      case "price-asc":
        return pa.price - pb.price;
      case "price-desc":
        return pb.price - pa.price;
      case "relevance":
        return b.score - a.score || byFeatured(pa, pb);
      default:
        return byFeatured(pa, pb);
    }
  });

  return {
    products: scored.map((s) => s.item.product),
    applied,
    understood,
    sort,
    partialMatch,
  };
}

// ── URL helpers ───────────────────────────────────────────────────────────

/** Builds a /gifts URL from filters, dropping empty values. */
export function giftsHref(filters: GiftFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.category) params.set("category", filters.category);
  if (filters.recipient) params.set("recipient", filters.recipient);
  if (filters.min !== undefined) params.set("min", String(filters.min));
  if (filters.max !== undefined) params.set("max", String(filters.max));
  if (filters.personalised) params.set("personalised", "1");
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `/gifts?${qs}` : "/gifts";
}

export function priceLabel(min?: number, max?: number): string {
  if (min && max) return `${formatPrice(min)}–${formatPrice(max)}`;
  if (max !== undefined) return `under ${formatPrice(max)}`;
  if (min !== undefined) return `over ${formatPrice(min)}`;
  return "";
}

export const pricePresets: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹1,000", max: 1000 },
  { label: "₹1,000–₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000–₹3,000", min: 2000, max: 3000 },
  { label: "Over ₹3,000", min: 3000 },
];

export function hasActiveFilters(filters: GiftFilters): boolean {
  return Boolean(
    filters.q ||
      filters.occasion ||
      filters.category ||
      filters.recipient ||
      filters.min !== undefined ||
      filters.max !== undefined ||
      filters.personalised,
  );
}
