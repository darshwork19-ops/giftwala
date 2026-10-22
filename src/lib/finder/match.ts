import { externalProducts, type ExternalProduct } from "@/data/external-products";
import { giftIdeas, type GiftIdea, type IdeaForm } from "@/data/gift-ideas";
import { makerProducts, type MakerProduct } from "@/data/instagram-maker-products";
import { instagramMakers, type InstagramMaker } from "@/data/instagram-makers";
import { interests as interestList, occasions } from "@/data/taxonomy";
import { getAllProducts, getMaker, isPersonalisable } from "@/lib/catalogue";
import type { Product } from "@/lib/types";
import { addDays, addWorkingDays, formatShortDate } from "./dates";
import { serviceability, SERVICE_AREA, type Serviceability } from "./destination";
import type { BriefFacts } from "./parse";
import { MODIFIERS, stem } from "./vocabulary";

/**
 * Catalogue matching. Two rules keep results honest:
 *  1. Hard constraints (budget, date, destination) remove products outright.
 *  2. A product must match what the brief is ABOUT (a subject word or an
 *     interest). Occasion, recipient, price and modifiers like "handmade"
 *     can rank a relevant product higher but never make one relevant.
 */

/** Earliest date a product can reach the recipient, before personalisation. */
export function earliestArrival(product: Product, today: string): string {
  const maker = getMaker(product.makerId);
  const dispatch = addWorkingDays(today, product.processingDays.max);
  return addDays(dispatch, maker.deliveryDays);
}

/** Tag words and whole tags, stemmed: "k-drama" → "k-drama", "drama". */
export function tagTerms(product: Pick<Product, "tags">): Set<string> {
  const terms = new Set<string>();
  for (const tag of product.tags) {
    const whole = stem(tag);
    if (!MODIFIERS.has(whole)) terms.add(whole);
    for (const part of tag.split(/[\s-]+/)) {
      const p = stem(part);
      if (p.length > 2 && !MODIFIERS.has(p)) terms.add(p);
    }
  }
  return terms;
}

/** Every subject word the catalogue or the ideas list can respond to. */
export const KNOWN_SUBJECTS: Set<string> = new Set([
  ...getAllProducts().flatMap((p) => [...tagTerms(p)]),
  ...giftIdeas.flatMap((i) => i.triggers.map(stem)),
  ...externalProducts.flatMap((p) => [...tagTerms(p)]),
  ...instagramMakers.flatMap((m) => [...tagTerms(m)]),
  ...makerProducts.flatMap((p) => [...tagTerms(p)]),
]);

export type ExclusionReason = "budget" | "date" | "destination";

export interface Candidate {
  product: Product;
  /** Earliest estimated arrival from sample lead times. */
  arrival: string;
  serviceability?: Serviceability;
  score: number;
  /** Subject words from the brief that this product matched. */
  matched: string[];
  /** True when a subject word matched (not just a broad interest). */
  strong: boolean;
}

export interface FilterResult {
  /** Products that pass hard constraints AND match the brief's subject. */
  relevant: Candidate[];
  excluded: Record<ExclusionReason, number>;
}

export function filterAndScore(facts: BriefFacts, today: string, exclude: string[] = []): FilterResult {
  const excluded: Record<ExclusionReason, number> = { budget: 0, date: 0, destination: 0 };
  const scored: Candidate[] = [];

  for (const product of getAllProducts()) {
    if (exclude.includes(product.id)) continue;
    const maker = getMaker(product.makerId);
    const arrival = earliestArrival(product, today);
    const service = facts.destination ? serviceability(facts.destination, maker.deliveryZones) : undefined;
    // Relevance first, so "left out" counts only cover gifts that would have fit
    const rel = relevance(product, facts);
    if (rel.score === 0) continue;

    if (
      (facts.budgetMax !== undefined && product.price > facts.budgetMax) ||
      (facts.budgetMin !== undefined && product.price < facts.budgetMin)
    ) {
      excluded.budget++;
      continue;
    }
    if (facts.date && arrival > facts.date.iso) {
      excluded.date++;
      continue;
    }
    if (service === "does-not-serve") {
      excluded.destination++;
      continue;
    }

    scored.push({ product, arrival, serviceability: service, ...rel });
  }

  // Interest-only matches are a weaker signal: use them only when no product
  // matches a subject word directly.
  const pool = scored.some((c) => c.strong) ? scored.filter((c) => c.strong) : scored;
  const relevant = pool.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
  return { relevant, excluded };
}

function relevance(product: Product, facts: BriefFacts): Pick<Candidate, "score" | "matched" | "strong"> {
  const terms = tagTerms(product);
  const hits = facts.keywords.filter((w) => terms.has(stem(w)));
  // "k-dramas" also yields "dramas"; keep only the fuller word
  const matched = hits.filter((w) => !hits.some((o) => o !== w && o.includes("-") && o.split("-").includes(w)));
  const interestHits = facts.interests.filter((i) => product.interests.includes(i));
  if (matched.length === 0 && interestHits.length === 0) return { score: 0, matched: [], strong: false };

  let score = matched.length * 5 + interestHits.length * 3;
  if (facts.occasion && product.occasions.includes(facts.occasion)) score += 2;
  if (facts.recipient && product.recipients.includes(facts.recipient)) score += 1;
  if (facts.wantsPersonalised && isPersonalisable(product)) score += 2;
  if (facts.modifiers.some((m) => product.tags.includes(m))) score += 1;
  return { score, matched, strong: matched.length > 0 };
}

/** An idea's kind, from its own `form` or, for older entries, its category. */
export function ideaForm(idea: GiftIdea): IdeaForm {
  if (idea.form) return idea.form;
  const c = idea.category.toLowerCase();
  if (c.includes("experience")) return "experience";
  if (c.includes("collectible") || c.includes("merchandise")) return "collectible";
  if (c.includes("book")) return "learning";
  if (/coffee|tea|food|self-care|fragrance/.test(c)) return "consumable";
  if (/keepsake|family|festive/.test(c)) return "keepsake";
  if (/plants|wellness|jewellery|entertainment|baby/.test(c)) return "lifestyle";
  return "equipment";
}

export interface IdeaMatch {
  idea: GiftIdea;
  matched: string[];
  score: number;
}

/**
 * Gift ideas whose trigger words appear in the brief, best first. The score
 * counts the distinct brief words an idea matches, plus a bump when its main
 * subject (first trigger) matched; `weight` lowers ideas that should trail
 * (a study gift for someone who's studying but loves badminton).
 */
export function matchIdeas(facts: BriefFacts, limit = 30): IdeaMatch[] {
  return giftIdeas
    .map((idea, order) => {
      const triggers = new Set(idea.triggers.map(stem));
      // The giver's own words (not stems), so "focus on adventurous" reads right
      const matched = [...new Set(facts.keywords.filter((w) => triggers.has(stem(w))))];
      const primary = matched.some((w) => stem(w) === stem(idea.triggers[0])) ? 1 : 0;
      return { idea, matched, score: (matched.length * 10 + primary * 3) * (idea.weight ?? 1), order };
    })
    .filter((m) => m.matched.length > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map(({ idea, matched, score }) => ({ idea, matched, score }));
}

// ── Products from verified Mumbai makers ──────────────────────────────────

export interface MakerProductMatch {
  product: MakerProduct;
  matched: string[];
  score: number;
}

/**
 * Individual products that verified Mumbai makers show on Instagram. They
 * have no listed price or lead time, so budget and date can't be checked;
 * the UI says so. Mumbai-only, like the makers.
 */
export function matchMakerProducts(facts: BriefFacts, limit = 12): MakerProductMatch[] {
  if (facts.destination?.kind === "outside") return [];
  return makerProducts
    .map((product) => {
      const terms = tagTerms(product);
      const hits = facts.keywords.filter((w) => terms.has(stem(w)));
      const matched = hits.filter((w) => !hits.some((o) => o !== w && o.includes("-") && o.split("-").includes(w)));
      let score = matched.length * 10;
      if (facts.occasion && product.occasions.includes(facts.occasion)) score += 2;
      return { product, matched, score };
    })
    .filter((m) => m.matched.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** A short, factual "why it fits" line built from what actually matched. */
export function ruleReason(candidate: Candidate, facts: BriefFacts): string {
  const { product, matched } = candidate;
  const parts: string[] = [];
  if (matched.length) parts.push(`Matches “${matched.slice(0, 2).join("” and “")}” from your description`);
  else {
    const interest = facts.interests.find((i) => product.interests.includes(i));
    if (interest) parts.push(`Fits an interest in ${interestList.find((i) => i.id === interest)?.label.toLowerCase()}`);
  }
  if (facts.occasion && product.occasions.includes(facts.occasion)) {
    const label = occasions.find((o) => o.id === facts.occasion)?.label.toLowerCase() ?? "";
    parts.push(`suits ${/^[aeiou]/.test(label) ? "an" : "a"} ${label}`);
  }
  if (facts.wantsPersonalised && isPersonalisable(product)) parts.push("can be personalised");
  return parts.join(", ") + ".";
}

/** One line describing what the hard filters removed, for transparency. */
export function describeExclusions(excluded: Record<ExclusionReason, number>, facts: BriefFacts): string | undefined {
  const bits: string[] = [];
  if (excluded.budget) bits.push(`${excluded.budget} outside your budget`);
  if (excluded.date && facts.date) bits.push(`${excluded.date} that can't be ready by ${formatShortDate(facts.date.iso)}`);
  if (excluded.destination && facts.destination) {
    bits.push(
      facts.destination.kind === "outside"
        ? `${excluded.destination} because sample makers only deliver within ${SERVICE_AREA}`
        : `${excluded.destination} that don't deliver to ${facts.destination.label}`,
    );
  }
  return bits.length ? `Left out ${bits.join(", ")}.` : undefined;
}

// ── Online-shop products ───────────────────────────────────────────────────

const DRINK_WORDS = new Set(
  "bar barware drink drinks drinking whisky whiskey rum beer wine gin vodka cocktail cocktails old monk jameson heineken party host pub".split(" "),
);
const CHILD_WORDS = /\b(kid|kids|child|children|son|daughter|baby|toddler|teen|teenager|school|nephew|niece)\b/;

export interface ExternalMatch {
  product: ExternalProduct;
  matched: string[];
  score: number;
}

/**
 * Products from online shops that match the brief's subject and budget.
 * Liquor-branded barware needs a drink-related word in the brief and is never
 * suggested when the recipient sounds under 18.
 */
export function matchExternal(facts: BriefFacts, briefText: string, limit = 8): ExternalMatch[] {
  const minor = (facts.age !== undefined && facts.age < 18) || CHILD_WORDS.test(briefText.toLowerCase());
  const ranked = externalProducts
    .map((product) => {
      const terms = tagTerms(product);
      const hits = facts.keywords.filter((w) => terms.has(stem(w)));
      const matched = hits.filter((w) => !hits.some((o) => o !== w && o.includes("-") && o.split("-").includes(w)));
      let score = matched.length * 5;
      if (facts.occasion && product.occasions.includes(facts.occasion)) score += 2;
      return { product, matched, score };
    })
    .filter(({ product, matched }) => {
      if (matched.length === 0) return false;
      if (facts.budgetMax !== undefined && product.price > facts.budgetMax) return false;
      if (facts.budgetMin !== undefined && product.price < facts.budgetMin) return false;
      if (product.adultsOnly && (minor || !matched.some((w) => DRINK_WORDS.has(stem(w))))) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);
  return coverEach(ranked, limit);
}

/**
 * Picks up to `limit` items so each matched word ("coffee", "travelling")
 * gets at least one item before any word gets a second.
 */
function coverEach<T extends { matched: string[] }>(ranked: T[], limit: number): T[] {
  const chosen: T[] = [];
  const counts = new Map<string, number>();
  while (chosen.length < limit) {
    const remaining = ranked.filter((r) => !chosen.includes(r));
    if (remaining.length === 0) break;
    // The best item whose least-covered matched word has the fewest picks so far
    const coverage = (r: T) => Math.min(...r.matched.map((m) => counts.get(m) ?? 0));
    const next = remaining.reduce((best, r) => (coverage(r) < coverage(best) ? r : best));
    chosen.push(next);
    next.matched.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  }
  return chosen;
}


/**
 * Well-loved catalogue gifts for the separate "Popular gifts" section. They
 * still respect budget, date and destination, and never count as matches.
 */
export function popularGifts(facts: BriefFacts, today: string, excludeIds: string[], limit = 4): Candidate[] {
  const out: Candidate[] = [];
  for (const product of getAllProducts()) {
    if (out.length >= limit) break;
    if (!product.featured || excludeIds.includes(product.id)) continue;
    const maker = getMaker(product.makerId);
    const arrival = earliestArrival(product, today);
    const service = facts.destination ? serviceability(facts.destination, maker.deliveryZones) : undefined;
    if (facts.budgetMax !== undefined && product.price > facts.budgetMax) continue;
    if (facts.budgetMin !== undefined && product.price < facts.budgetMin) continue;
    if (facts.date && arrival > facts.date.iso) continue;
    if (service === "does-not-serve") continue;
    out.push({ product, arrival, serviceability: service, score: 0, matched: [], strong: false });
  }
  return out;
}

// ── Mumbai makers on Instagram ────────────────────────────────────────────

export interface MakerMatch {
  maker: InstagramMaker;
  matched: string[];
  score: number;
}

/**
 * Instagram makers whose work matches what the brief is about. They list no
 * prices, so budget can't be checked; the UI says so instead of hiding them.
 */
export function matchInstagramMakers(facts: BriefFacts, limit = 6): MakerMatch[] {
  if (facts.destination?.kind === "outside") return []; // Mumbai-only makers
  const ranked = instagramMakers
    .map((maker) => {
      // A maker matches on what they say they make and on the products they show
      const terms = tagTerms({ tags: [...maker.tags, ...makerProducts.filter((p) => p.makerId === maker.id).flatMap((p) => p.tags)] });
      const hits = facts.keywords.filter((w) => terms.has(stem(w)));
      const matched = hits.filter((w) => !hits.some((o) => o !== w && o.includes("-") && o.split("-").includes(w)));
      const interestHits = facts.interests.filter((i) => maker.interests.includes(i));
      let score = matched.length * 5 + interestHits.length * 2;
      if (facts.occasion && maker.occasions.includes(facts.occasion)) score += 1;
      return { maker, matched, interestHits, score };
    })
    .filter((m) => m.matched.length > 0 || m.interestHits.length > 0);
  // Prefer makers that match a subject word over interest-only matches
  const pool = ranked.some((m) => m.matched.length > 0) ? ranked.filter((m) => m.matched.length > 0) : ranked;
  return coverEach(
    pool
      .map(({ maker, matched, interestHits, score }) => ({ maker, matched: matched.length ? matched : interestHits, score }))
      .sort((a, b) => b.score - a.score || b.maker.followers - a.maker.followers),
    limit,
  );
}

