import { interests as interestList, occasions, recipients } from "@/data/taxonomy";
import { getMaker, isPersonalisable } from "@/lib/catalogue";
import type { AiProvider } from "./ai-types";
import { formatShortDate } from "./dates";
import { SERVICE_AREA } from "./destination";
import { classifyIntent, followUpFor, type IntentKind } from "./intent";
import { getShop } from "@/data/external-products";
import { instagramUrl } from "@/data/instagram-makers";
import { routes } from "@/lib/routes";
import { instagramPostUrl } from "@/data/instagram-maker-products";
import { getStudioById, getStudioProducts, photosVisible } from "@/lib/studios";
import {
  describeExclusions,
  filterAndScore,
  matchExternal,
  ideaForm,
  matchIdeas,
  matchMakerProducts,
  matchInstagramMakers,
  popularGifts,
  ruleReason,
  type Candidate,
  type ExclusionReason,
} from "./match";
import { parseBrief, type BriefFacts } from "./parse";
import { INTENT_INSTRUCTIONS, IntentCheckSchema, RANKER_INSTRUCTIONS, RankingSchema, rankerPrompt } from "./ranker";
import { buildShortlist, TARGET_RESULTS, type Pooled } from "./shortlist";
import type { DeliveryInfo, ExternalCard, FinderResponse, IdeaCard, ListingCard, MakerCard, MakerProductCard, MatchRequest } from "./types";

/**
 * The Gift Finder pipeline, in order:
 *   1. Parse facts with rules (budget, date, destination, interests).
 *   2. Classify intent. Nonsense, off-topic and vague briefs stop here with
 *      no products — nothing falls back to "all gifts".
 *   3. Hard filters + relevance: only products matching what the brief is
 *      about, within budget/date/destination, can be shown.
 *   4. Optional AI ranking of those relevant products. The AI may drop
 *      items; any id it returns is re-validated. If the AI fails, we return
 *      an error state rather than unranked products.
 *   5. Delivery status per listing, never stronger than the data allows.
 *   6. One ranked, de-duplicated shortlist across every source (up to 15,
 *      see shortlist.ts). Fewer relevant items = a shorter list, never padding.
 */

/** Catalogue listings the AI may pick from, and the most it may return. */
export const MAX_LISTINGS = 10;
const SHORTLIST = 20;

export const MESSAGES = {
  nonsense:
    "We couldn't understand that request. Tell us about the person, their interests, or the kind of gift you're looking for.",
  off_topic:
    "This tool helps you find gifts, so we can't answer that. Tell us about the person you're buying for and what they're into.",
  ai_error:
    "Our gift matching couldn't respond just now, so we haven't shown any picks. Please try again in a moment.",
} as const;

export interface FinderDeps {
  /** Today's date (YYYY-MM-DD, India time). */
  today: string;
  /** AI provider, or undefined to rank with rules only. */
  ai?: AiProvider;
}

export async function findGifts(request: MatchRequest, deps: FinderDeps): Promise<FinderResponse> {
  const brief = request.brief.trim();
  const facts = parseBrief(brief, deps.today);
  if (request.budgetMax && request.budgetMax > 0) facts.budgetMax = request.budgetMax;
  const base = baseResponse(facts);

  // 2. Intent
  const intent = classifyIntent(brief, facts);
  let kind: IntentKind = intent.kind;
  if (kind === "nonsense" && intent.uncertain && deps.ai) {
    // Rules can't tell "telescope" from random letters; ask the model. If it
    // fails we keep the safe answer: nonsense, no products.
    try {
      const check = await deps.ai.generateJson({ system: INTENT_INSTRUCTIONS, prompt: brief, schema: IntentCheckSchema });
      kind = check.kind === "gift_request" ? "request" : check.kind;
    } catch {
      kind = "nonsense";
    }
  }
  if (kind === "nonsense") return { ...base, status: "nonsense", message: MESSAGES.nonsense };
  if (kind === "off_topic") return { ...base, status: "off_topic", message: MESSAGES.off_topic };
  if (kind === "vague") {
    return {
      ...base,
      status: "follow_up",
      message: "Happy to help. Tell us a bit more so we can suggest gifts that really fit.",
      followUp: followUpFor(facts),
    };
  }

  // 3. Hard filters and relevance
  const { relevant, excluded } = filterAndScore(facts, deps.today, request.exclude);
  const ideaMatches = matchIdeas(facts);
  const ideas = ideaMatches.map(({ idea, matched }): IdeaCard => ({
    kind: "idea",
    id: idea.id,
    title: idea.title,
    summary: idea.summary,
    category: idea.category,
    // Short words like "ca" or "f1" are usually acronyms
    reason: `Could suit them because you mentioned “${matched.slice(0, 2).map((w) => (w.length <= 3 ? w.toUpperCase() : w)).join("” and “")}”.`,
    lookFor: idea.lookFor,
    whereToFind: idea.whereToFind,
    form: ideaForm(idea),
    check: idea.check,
  }));
  const external = matchExternal(facts, brief).map(({ product, matched }): ExternalCard => {
    const shop = getShop(product.shopId);
    return {
      kind: "external",
      id: product.id,
      name: product.name,
      shop: { name: shop.name, url: shop.url },
      url: product.url,
      price: product.price,
      compareAt: product.compareAt,
      priceCheckedOn: product.priceCheckedOn,
      image: shop.photoPermission === "granted" ? product.image : null,
      category: product.category,
      summary: product.summary,
      reason: `Matches “${matched.slice(0, 2).join("” and “")}” from your description.`,
      adultsOnly: Boolean(product.adultsOnly),
    };
  });
  const makers = matchInstagramMakers(facts).map(({ maker, matched }): MakerCard => ({
    kind: "instagram-maker",
    id: maker.id,
    name: maker.name,
    handle: maker.handle,
    url: instagramUrl(maker.handle),
    studioUrl: routes.studio(maker.handle),
    preview: getStudioProducts(maker.id)
      .filter((p) => p.showPhoto)
      .slice(0, 3)
      .map((p) => p.image),
    makes: maker.makes,
    followers: maker.followers,
    medianLikes: maker.medianLikes,
    avgComments: maker.avgComments,
    checkedOn: maker.checkedOn,
    reason: `Matches “${matched.slice(0, 2).join("” and “")}” from your description.`,
  }));
  const externalMatches = new Map(matchExternal(facts, brief).map((m) => [m.product.id, m]));
  const makerProductMatches = matchMakerProducts(facts);
  const makerProductCards = makerProductMatches.map(({ product, matched }): MakerProductCard => {
    const maker = getStudioById(product.makerId);
    return {
      kind: "maker-product",
      id: product.id,
      name: product.name,
      summary: product.summary,
      category: product.category,
      image: photosVisible(maker) ? product.image : null,
      maker: { name: maker.name, handle: maker.handle, studioUrl: routes.studio(maker.handle) },
      postUrl: instagramPostUrl(product.postCode),
      reason: `Could suit them because you mentioned “${matched.slice(0, 2).join("” and “")}”.`,
    };
  });
  const excludedNote = describeExclusions(excluded, facts);
  const deliveryNote = deliveryNoteFor(facts);

  // 4. Rank: AI when configured and asked for, otherwise rules
  let picked: { candidate: Candidate; reason: string }[] = [];
  let mode: "ai" | "rules" = "rules";
  let summary: string | undefined;
  let aiInterests: string[] | undefined;
  const shortlist = relevant.slice(0, SHORTLIST);

  if (shortlist.length > 0 && deps.ai && request.mode !== "rules") {
    try {
      const ranking = await deps.ai.generateJson({
        system: RANKER_INSTRUCTIONS,
        prompt: rankerPrompt(brief, shortlist, MAX_LISTINGS),
        schema: RankingSchema,
      });
      const byId = new Map(shortlist.map((c) => [c.product.id, c]));
      const seen = new Set<string>();
      for (const pick of ranking.picks) {
        const candidate = byId.get(pick.productId);
        // Ignore ids the model invented or repeated
        if (!candidate || seen.has(pick.productId)) continue;
        seen.add(pick.productId);
        picked.push({ candidate, reason: pick.reason.trim() || ruleReason(candidate, facts) });
      }
      picked = picked.slice(0, MAX_LISTINGS);
      mode = "ai";
      summary = ranking.summary.trim() || undefined;
      aiInterests = ranking.interests.slice(0, 5);
    } catch (error) {
      console.error(`${deps.ai.name} ranking failed:`, error instanceof Error ? error.message : error);
      return {
        ...base,
        status: "ai_error",
        message: MESSAGES.ai_error,
        provider: deps.ai.name,
        excludedNote,
        deliveryNote,
        remaining: 0,
      };
    }
  } else {
    picked = shortlist.slice(0, MAX_LISTINGS).map((candidate) => ({ candidate, reason: ruleReason(candidate, facts) }));
  }

  const listings = picked.map(({ candidate, reason }) => toListing(candidate, reason, facts));

  // 6. One shortlist across every source
  const pool: Pooled[] = [
    ...picked.map(({ candidate }, i): Pooled => ({
      kind: "listing",
      id: candidate.product.id,
      // The AI's order counts a little: its first pick gets the most
      score: candidate.matched.length * 10 + (candidate.strong ? 0 : 4) + (mode === "ai" ? Math.max(0, 3 - i * 0.5) : 0),
      matched: candidate.matched.length ? candidate.matched : facts.interests,
      cluster: `listing:${candidate.product.category}`,
      name: candidate.product.name,
      form: "product",
      deliverable: listings[i].delivery.status === "estimated",
      handmade: candidate.product.tags.includes("handmade"),
    })),
    ...external.map((card): Pooled => {
      const m = externalMatches.get(card.id)!;
      return { kind: "external", id: card.id, score: m.score, matched: m.matched, cluster: `external:${m.product.shopId}`, name: card.name, form: "product" };
    }),
    ...makerProductMatches.map(({ product, matched, score }): Pooled => ({
      kind: "maker-product",
      id: product.id,
      score,
      matched,
      cluster: `maker:${product.makerId}`,
      name: product.name,
      form: "product",
      handmade: true,
    })),
    ...ideaMatches.map(({ idea, matched, score }): Pooled => ({
      kind: "idea",
      id: idea.id,
      score,
      matched,
      // Same subject and same kind = near-substitutes (two cricket experiences)
      cluster: `idea:${ideaForm(idea)}:${idea.triggers[0]}`,
      name: idea.title,
      form: ideaForm(idea),
    })),
  ];
  const results = buildShortlist(pool, request.prefer);
  const limited = results.length < TARGET_RESULTS ? limitedNote(results.length, excluded, facts) : undefined;
  const understood = {
    ...base.understood,
    summary,
    interests: aiInterests ?? base.understood.interests,
  };

  // 5. Outcome
  if (results.length === 0) {
    return {
      ...base,
      understood,
      status: "no_match",
      mode,
      provider: mode === "ai" ? deps.ai?.name : undefined,
      message: noMatchMessage(intent.unknownSubjects, relevant.length > 0, excludedNote),
      excludedNote,
      deliveryNote,
      remaining: 0,
    };
  }

  return {
    ...base,
    understood,
    status: "results",
    mode,
    provider: mode === "ai" ? deps.ai?.name : undefined,
    message:
      listings.length === 0 && external.length === 0 && makers.length === 0
        ? "Nothing we list matches yet, so here are gift ideas to look for elsewhere."
        : listings.length === 0
          ? "Nothing in the GIFTWALA catalogue matches yet, but these shops and makers have things that fit."
          : undefined,
    listings,
    external,
    makers,
    makerProducts: makerProductCards,
    results,
    limited,
    popular: popularGifts(facts, deps.today, listings.map((l) => l.id)).map((c) =>
      toListing(c, popularReason(facts), facts),
    ),
    ideas,
    excludedNote,
    deliveryNote,
    remaining: Math.max(0, relevant.length - listings.length),
  };
}

/**
 * When fewer than 10 relevant options exist, say so plainly and suggest the
 * changes that would actually widen the search (based on what was filtered).
 */
function limitedNote(
  count: number,
  excluded: Record<ExclusionReason, number>,
  facts: BriefFacts,
): NonNullable<FinderResponse["limited"]> {
  const broaden: NonNullable<FinderResponse["limited"]>["broaden"] = [];
  if (excluded.budget > 0) broaden.push("budget");
  if (excluded.date > 0) broaden.push("date");
  if (excluded.destination > 0) broaden.push("area");
  if (facts.keywords.length < 4) broaden.push("interests");
  const what = count === 1 ? "1 option" : `${count} options`;
  return {
    note: `We found ${what} that genuinely fit. That's everything relevant we have right now; we don't pad the list with unrelated gifts.`,
    broaden,
  };
}

function baseResponse(facts: BriefFacts): FinderResponse {
  return {
    status: "results",
    mode: "rules",
    understood: {
      budgetMax: facts.budgetMax,
      date: facts.date && { iso: facts.date.iso, label: formatShortDate(facts.date.iso) },
      destination: facts.destination && { label: facts.destination.label, kind: facts.destination.kind },
      recipient: recipients.find((r) => r.id === facts.recipient)?.label,
      occasion: occasions.find((o) => o.id === facts.occasion)?.label,
      interests: facts.interests.map((id) => interestList.find((i) => i.id === id)?.label ?? id),
    },
    listings: [],
    makerProducts: [],
    results: [],
    external: [],
    makers: [],
    popular: [],
    ideas: [],
    remaining: 0,
  };
}

function toListing(candidate: Candidate, reason: string, facts: BriefFacts): ListingCard {
  const { product, arrival } = candidate;
  const maker = getMaker(product.makerId);
  return {
    kind: "listing",
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0],
    maker: { name: maker.name, slug: maker.slug, location: maker.location },
    reason,
    personalisable: isPersonalisable(product),
    delivery: deliveryFor(candidate, facts),
    arrival,
  };
}

/** Delivery status for one listing, from sample data only. */
export function deliveryFor(candidate: Candidate, facts: BriefFacts): DeliveryInfo {
  const ready = formatShortDate(candidate.arrival);
  if (!facts.destination && !facts.date) {
    return { status: "not_verified", label: "Delivery not checked — add a Mumbai area or PIN and a date" };
  }
  if (!facts.destination) {
    return { status: "not_verified", label: `Could be ready by ${ready} · add a Mumbai area or PIN to check delivery` };
  }
  if (candidate.serviceability === "unconfirmed") {
    return { status: "not_verified", label: `Delivery to ${facts.destination.label} not verified for this maker` };
  }
  if (!facts.date) {
    return { status: "not_verified", label: `Delivers to this area · add a date to check timing` };
  }
  return { status: "estimated", label: `Estimated to arrive by ${ready} (sample lead times, not a confirmed slot)` };
}

function deliveryNoteFor(facts: BriefFacts): string | undefined {
  const notes: string[] = [];
  if (facts.destination?.kind === "outside") {
    notes.push(`Sample makers only deliver within ${SERVICE_AREA}, so catalogue gifts can't be sent to ${facts.destination.label}.`);
  }
  if (facts.destination?.kind === "region") {
    notes.push("A valid PIN code doesn't confirm a courier serves the address; we can only check makers that cover all of Mumbai.");
  }
  if (facts.wantsTimeSlot) notes.push("We can't book or confirm delivery time slots yet.");
  if (facts.destination || facts.date) {
    notes.push("Delivery estimates use sample maker lead times; they are not confirmed by a courier.");
  }
  return notes.length ? notes.join(" ") : undefined;
}

function noMatchMessage(unknown: string[], hadRelevantBeforeAi: boolean, excludedNote?: string): string {
  if (hadRelevantBeforeAi) return "None of our listings were a strong enough fit for this person, so we haven't shown any.";
  if (excludedNote) return `No gifts fit all of that. ${excludedNote} Try a different budget, date or destination.`;
  const subject = unknown.slice(0, 2).join(" and ");
  return subject
    ? `We don't have gifts or ideas for “${subject}” yet. Try describing other things they enjoy.`
    : "We couldn't find a strong match. Try describing other things they enjoy.";
}

function popularReason(facts: BriefFacts): string {
  const fits = [facts.budgetMax !== undefined && "your budget", facts.date && "your date", facts.destination && "the delivery area"]
    .filter(Boolean)
    .join(", ");
  return `A well-loved gift from the GIFTWALA catalogue${fits ? `, within ${fits}` : ""}. Not matched to your description.`;
}

