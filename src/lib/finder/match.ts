import { categoryLabel, interests as interestList, occasions } from "@/data/taxonomy";
import { getAllProducts, getMaker, isPersonalisable } from "@/lib/catalogue";
import type { Product } from "@/lib/types";
import { zoneLabels } from "./areas";
import { addDays, addWorkingDays, formatShortDate } from "./dates";
import type { BriefFacts } from "./parse";

/** Earliest date a product can reach the recipient, before personalisation. */
export function earliestArrival(product: Product, today: string): string {
  const maker = getMaker(product.makerId);
  const dispatch = addWorkingDays(today, product.processingDays.max);
  return addDays(dispatch, maker.deliveryDays);
}

export type ExclusionReason = "budget" | "date" | "area";

export interface Candidate {
  product: Product;
  arrival: string;
  score: number;
}

export interface FilterResult {
  candidates: Candidate[];
  excluded: Record<ExclusionReason, number>;
}

/**
 * Hard filters run first and are never overridden by AI: price, arrival by
 * the date, delivery to the area. Anything left is scored for relevance.
 */
export function filterAndScore(facts: BriefFacts, today: string, exclude: string[] = []): FilterResult {
  const excluded: Record<ExclusionReason, number> = { budget: 0, date: 0, area: 0 };
  const candidates: Candidate[] = [];

  for (const product of getAllProducts()) {
    if (exclude.includes(product.id)) continue;
    const maker = getMaker(product.makerId);
    const arrival = earliestArrival(product, today);

    if (facts.budgetMax !== undefined && product.price > facts.budgetMax) {
      excluded.budget++;
      continue;
    }
    if (facts.date && arrival > facts.date.iso) {
      excluded.date++;
      continue;
    }
    if (facts.area && !maker.deliveryZones.includes(facts.area.zone)) {
      excluded.area++;
      continue;
    }
    candidates.push({ product, arrival, score: score(product, facts) });
  }

  candidates.sort((a, b) => b.score - a.score || a.product.price - b.product.price);
  return { candidates, excluded };
}

/** Lower-case and drop a plural "s", so "cats" matches "cat". */
function stem(word: string): string {
  const w = word.toLowerCase();
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}

/** Tag words and whole tags, stemmed: "k-drama" → "k-drama", "k", "drama". */
function tagTerms(product: Product): Set<string> {
  const terms = new Set<string>();
  for (const tag of product.tags) {
    terms.add(stem(tag));
    for (const part of tag.split(/[\s-]+/)) if (part.length > 2) terms.add(stem(part));
  }
  return terms;
}

function matchedKeyword(product: Product, facts: BriefFacts): string | undefined {
  const terms = tagTerms(product);
  return facts.keywords.find((w) => terms.has(stem(w)));
}

function score(product: Product, facts: BriefFacts): number {
  let s = 0;
  const terms = tagTerms(product);
  const haystack = [product.name, product.summary].join(" ").toLowerCase();

  for (const word of facts.keywords) {
    if (terms.has(stem(word))) s += 5;
    else if (haystack.includes(stem(word))) s += 2;
  }
  for (const interest of facts.interests) {
    if (product.interests.includes(interest)) s += 3;
  }
  if (facts.occasion && product.occasions.includes(facts.occasion)) s += 3;
  if (facts.recipient && product.recipients.includes(facts.recipient)) s += 2;
  if (facts.interests.includes("personalised") && isPersonalisable(product)) s += 2;
  // Use most of the budget rather than the cheapest thing in the catalogue
  if (facts.budgetMax) s += (product.price / facts.budgetMax) * 1.5;
  return s;
}

/** A short, factual "why it fits" line for when AI is not available. */
export function ruleReason(product: Product, facts: BriefFacts): string {
  const parts: string[] = [];
  const matchedTag = matchedKeyword(product, facts);
  if (matchedTag) parts.push(`matches "${matchedTag}"`);

  const interest = facts.interests.find((i) => product.interests.includes(i));
  if (interest && !matchedTag) {
    parts.push(`fits an interest in ${interestList.find((i) => i.id === interest)?.label.toLowerCase()}`);
  }
  if (facts.occasion && product.occasions.includes(facts.occasion)) {
    const label = occasions.find((o) => o.id === facts.occasion)?.label.toLowerCase() ?? "";
    parts.push(`suits ${/^[aeiou]/.test(label) ? "an" : "a"} ${label}`);
  }
  if (isPersonalisable(product)) parts.push("can be personalised");
  if (parts.length === 0) parts.push(`a well-loved pick in ${categoryLabel(product.category).toLowerCase()}`);

  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/** One line describing what the hard filters removed, for transparency. */
export function describeExclusions(excluded: Record<ExclusionReason, number>, facts: BriefFacts): string | undefined {
  const bits: string[] = [];
  if (excluded.budget) bits.push(`${excluded.budget} over budget`);
  if (excluded.date && facts.date) bits.push(`${excluded.date} that can't arrive by ${formatShortDate(facts.date.iso)}`);
  if (excluded.area && facts.area) bits.push(`${excluded.area} that don't deliver to ${zoneLabels[facts.area.zone]}`);
  return bits.length ? `Left out ${bits.join(", ")}.` : undefined;
}
