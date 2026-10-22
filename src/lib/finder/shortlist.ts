import type { ResultGroup, ResultKind, ResultRef, Preference } from "./types";

/**
 * Builds the ranked, de-duplicated shortlist the Gift Finder shows, across
 * every source (catalogue listings, online-shop products, Mumbai makers'
 * products and labelled gift ideas). Every input is already relevant and
 * within the hard constraints; this step only orders, diversifies and caps.
 *
 * Diversity, in order:
 *   1. Coverage: each brief word that anything matched ("cricket",
 *      "travelling") gets its best buyable item and its best idea before
 *      any word gets more.
 *   2. Variety caps: at most 2 items per cluster (same kind of thing, e.g.
 *      two glassware pieces from one shop, or two maker products from one
 *      maker), and per-source caps so one source can't fill the list.
 *   3. Near-duplicate names are skipped.
 * Nothing is added to reach a count: fewer relevant items = a shorter list.
 */

export const MAX_RESULTS = 15;
export const TARGET_RESULTS = 10;
const PER_CLUSTER = 2;
const PER_KIND: Record<ResultKind, number> = { listing: 8, external: 6, "maker-product": 4, idea: 12 };

export interface Pooled {
  kind: ResultKind;
  id: string;
  /** Relevance from the matcher, on a shared scale (≈10 per matched brief word). */
  score: number;
  matched: string[];
  /** Items in the same cluster are near-substitutes. */
  cluster: string;
  name: string;
  /** For grouping and preferences: idea form, or a tag-derived hint for products. */
  form: "equipment" | "experience" | "learning" | "collectible" | "consumable" | "keepsake" | "lifestyle" | "product";
  /** Listings: the delivery estimate fits the requested date and area. */
  deliverable?: boolean;
  handmade?: boolean;
}

// Something real to buy beats an idea of equal relevance
const KIND_BONUS: Record<ResultKind, number> = { listing: 4, external: 4, "maker-product": 3, idea: 0 };

/** Preference nudges, applied on top of relevance (they re-rank, never add). */
function preferenceBonus(item: Pooled, prefer?: Preference): number {
  switch (prefer) {
    case "experiences":
      return item.form === "experience" ? 12 : item.form === "learning" ? 4 : -4;
    case "practical":
      return item.form === "equipment" || item.form === "consumable" ? 8 : item.form === "keepsake" ? -6 : 0;
    case "unusual":
      return item.kind === "maker-product" ? 8 : item.form === "experience" || item.form === "collectible" ? 6 : 0;
    case "handmade":
      return item.kind === "maker-product" || item.handmade ? 10 : item.kind === "idea" ? -3 : 0;
    default:
      return 0;
  }
}

function total(item: Pooled, prefer?: Preference): number {
  return item.score + KIND_BONUS[item.kind] + (item.deliverable ? 2 : 0) + preferenceBonus(item, prefer);
}

// Bracketed parts are variants ("Drip Bags (August Rush)"), so they don't count
const words = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2),
  );

/** Two names that share most of their words are treated as the same gift. */
function nearDuplicate(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return false;
  const shared = [...wa].filter((w) => wb.has(w)).length;
  return shared / Math.min(wa.size, wb.size) >= 0.75;
}

export function buildShortlist(pool: Pooled[], prefer?: Preference, limit = MAX_RESULTS): ResultRef[] {
  const ranked = [...pool].sort((a, b) => total(b, prefer) - total(a, prefer) || a.id.localeCompare(b.id));
  const chosen: Pooled[] = [];
  const perCluster = new Map<string, number>();
  const perKind = new Map<ResultKind, number>();

  const fits = (item: Pooled) =>
    !chosen.includes(item) &&
    (perCluster.get(item.cluster) ?? 0) < PER_CLUSTER &&
    (perKind.get(item.kind) ?? 0) < PER_KIND[item.kind] &&
    !chosen.some((c) => c.kind === item.kind && nearDuplicate(c.name, item.name));
  const take = (item: Pooled) => {
    chosen.push(item);
    perCluster.set(item.cluster, (perCluster.get(item.cluster) ?? 0) + 1);
    perKind.set(item.kind, (perKind.get(item.kind) ?? 0) + 1);
  };

  // 1. Coverage: for each matched word, its best real thing to buy, then its
  //    best idea, so every interest has something purchasable where one exists
  const allWords = [...new Set(ranked.flatMap((i) => i.matched))];
  for (const buyable of [true, false]) {
    for (const word of allWords) {
      if (chosen.length >= limit) break;
      if (chosen.some((c) => c.matched.includes(word) && (c.kind !== "idea") === buyable)) continue;
      const best = ranked.find((i) => i.matched.includes(word) && (i.kind !== "idea") === buyable && fits(i));
      if (best) take(best);
    }
  }
  // 2. Fill by score, respecting the variety caps. Each pick is penalised by
  //    how often its words are already represented (a light MMR), so three
  //    interests share the list instead of one taking it over.
  const COVERED_PENALTY = 4;
  const represented = (item: Pooled) =>
    item.matched.length === 0
      ? 0
      : Math.min(...item.matched.map((w) => chosen.filter((c) => c.matched.includes(w)).length));
  while (chosen.length < limit) {
    let best: Pooled | undefined;
    let bestValue = -Infinity;
    for (const item of ranked) {
      if (!fits(item)) continue;
      const value = total(item, prefer) - COVERED_PENALTY * represented(item);
      if (value > bestValue) {
        best = item;
        bestValue = value;
      }
    }
    if (!best) break;
    take(best);
  }

  const ordered = chosen.sort((a, b) => total(b, prefer) - total(a, prefer));
  return ordered.map((item, i): ResultRef => ({
    kind: item.kind,
    id: item.id,
    matched: item.matched,
    group: groupFor(item, i, ordered.length),
  }));
}

/** The top results are "best matches"; the rest group by what kind of gift they are. */
function groupFor(item: Pooled, index: number, count: number): ResultGroup {
  // Whole rows of the 3-column grid: 6 for a long list, 3 otherwise
  const bestCount = count >= 12 ? 6 : count >= 5 ? 3 : count;
  if (index < bestCount) return "best";
  if (item.kind === "maker-product") return "makers";
  if (item.form === "experience") return "experiences";
  if (item.form === "equipment" || item.form === "learning" || item.form === "collectible") return "hobby";
  return "more";
}
