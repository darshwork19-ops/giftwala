import { interests as interestList, occasions, recipients } from "@/data/taxonomy";
import { getMaker, isPersonalisable } from "@/lib/catalogue";
import type { AiProvider } from "./ai-types";
import { formatShortDate } from "./dates";
import { SERVICE_AREA } from "./destination";
import { classifyIntent, followUpFor, type IntentKind } from "./intent";
import { getShop } from "@/data/external-products";
import {
  describeExclusions,
  filterAndScore,
  matchExternal,
  matchIdeas,
  popularGifts,
  ruleReason,
  type Candidate,
} from "./match";
import { parseBrief, type BriefFacts } from "./parse";
import { INTENT_INSTRUCTIONS, IntentCheckSchema, RANKER_INSTRUCTIONS, RankingSchema, rankerPrompt } from "./ranker";
import type { DeliveryInfo, ExternalCard, FinderResponse, IdeaCard, ListingCard, MatchRequest } from "./types";

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
 */

export const MAX_LISTINGS = 6;
const SHORTLIST = 12;

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
  const ideas = matchIdeas(facts).map(({ idea, matched }): IdeaCard => ({
    kind: "idea",
    id: idea.id,
    title: idea.title,
    summary: idea.summary,
    category: idea.category,
    // Short words like "ca" or "f1" are usually acronyms
    reason: `Because you mentioned “${matched.slice(0, 2).map((w) => (w.length <= 3 ? w.toUpperCase() : w)).join("” and “")}”.`,
    lookFor: idea.lookFor,
    whereToFind: idea.whereToFind,
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
      image: product.image,
      category: product.category,
      summary: product.summary,
      reason: `Matches “${matched.slice(0, 2).join("” and “")}” from your description.`,
      adultsOnly: Boolean(product.adultsOnly),
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
  const understood = {
    ...base.understood,
    summary,
    interests: aiInterests ?? base.understood.interests,
  };

  // 5. Outcome
  if (listings.length === 0 && ideas.length === 0 && external.length === 0) {
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
      listings.length === 0 && external.length === 0
        ? "Nothing we list matches yet, so here are gift ideas to look for elsewhere."
        : listings.length === 0
          ? "Nothing in the GIFTWALA catalogue matches yet, but these online shops have things that fit."
          : undefined,
    listings,
    external,
    popular: popularGifts(facts, deps.today, listings.map((l) => l.id)).map((c) =>
      toListing(c, popularReason(facts), facts),
    ),
    ideas,
    excludedNote,
    deliveryNote,
    remaining: Math.max(0, relevant.length - listings.length),
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
    external: [],
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

