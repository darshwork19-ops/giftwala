import { giftIdeas, type GiftIdea } from "@/data/gift-ideas";
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
export function tagTerms(product: Product): Set<string> {
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

/**
 * Gift ideas whose trigger words appear in the brief. Ideas whose main
 * subject matched rank first, and each interest in the brief gets covered
 * before a second idea for the same interest is added.
 */
export function matchIdeas(facts: BriefFacts, limit = 4): { idea: GiftIdea; matched: string[] }[] {
  const words = new Set(facts.keywords.map(stem));
  const hits = giftIdeas
    .map((idea, order) => {
      const matched = idea.triggers.filter((t) => words.has(stem(t)));
      const primary = matched.includes(idea.triggers[0]) ? 1 : 0;
      return { idea, matched, score: matched.length + primary, order };
    })
    .filter((m) => m.matched.length > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  const chosen: typeof hits = [];
  const covered = new Set<string>();
  for (const pass of [true, false]) {
    for (const hit of hits) {
      if (chosen.length >= limit) break;
      if (chosen.includes(hit)) continue;
      const addsNew = hit.matched.some((m) => !covered.has(m));
      if (pass && !addsNew) continue;
      chosen.push(hit);
      hit.matched.forEach((m) => covered.add(m));
    }
  }
  return chosen.map(({ idea, matched }) => ({ idea, matched }));
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
