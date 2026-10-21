import Anthropic from "@anthropic-ai/sdk";
import { interests as interestList, occasions, recipients } from "@/data/taxonomy";
import { getMaker, isPersonalisable } from "@/lib/catalogue";
import { zoneLabels } from "@/lib/finder/areas";
import { claudeAvailable, rankWithClaude, type Ranking } from "@/lib/finder/claude";
import { formatShortDate, todayInIndia } from "@/lib/finder/dates";
import { describeExclusions, filterAndScore, ruleReason, type Candidate } from "@/lib/finder/match";
import { parseBrief } from "@/lib/finder/parse";
import type { MatchCard, MatchRequest, MatchResponse } from "@/lib/finder/types";

const MATCH_COUNT = 3;
/** How many rule-ranked candidates Claude gets to choose from. */
const SHORTLIST = 15;
const MAX_BRIEF = 600;

export async function POST(request: Request) {
  let body: MatchRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim().slice(0, MAX_BRIEF) : "";
  if (brief.length < 3) {
    return Response.json({ error: "Tell us a little about who the gift is for." }, { status: 400 });
  }
  const exclude = Array.isArray(body.exclude) ? body.exclude.filter((x) => typeof x === "string") : [];

  const today = todayInIndia();
  const facts = parseBrief(brief, today);
  if (typeof body.budgetMax === "number" && body.budgetMax > 0) facts.budgetMax = body.budgetMax;

  // 1. Rules: hard filters and a relevance shortlist
  const { candidates, excluded } = filterAndScore(facts, today, exclude);
  const shortlist = candidates.slice(0, SHORTLIST);

  // 2. AI: understand the brief and pick from the shortlist (optional)
  let ranking: Ranking | undefined;
  let modeNote: string | undefined;
  if (shortlist.length === 0) {
    modeNote = undefined;
  } else if (!claudeAvailable()) {
    modeNote = "AI matching is not set up on this deployment, so these picks use keyword matching.";
  } else {
    try {
      ranking = await rankWithClaude(brief, shortlist, MATCH_COUNT);
      if (!ranking) modeNote = "AI matching couldn't answer this one, so these picks use keyword matching.";
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error(`Claude API error ${error.status}: ${error.message}`);
      } else {
        console.error("Claude ranking failed", error);
      }
      modeNote = "AI matching is unavailable right now, so these picks use keyword matching.";
    }
  }

  // 3. Assemble: AI picks first, topped up from the rule ranking if needed
  const byId = new Map(shortlist.map((c) => [c.product.id, c]));
  const chosen: { candidate: Candidate; reason: string }[] = [];
  for (const pick of ranking?.picks ?? []) {
    const candidate = byId.get(pick.productId);
    if (candidate) chosen.push({ candidate, reason: pick.reason });
  }
  for (const candidate of candidates) {
    if (chosen.length >= MATCH_COUNT) break;
    if (!chosen.some((c) => c.candidate.product.id === candidate.product.id)) {
      chosen.push({ candidate, reason: ruleReason(candidate.product, facts) });
    }
  }

  const matches: MatchCard[] = chosen.map(({ candidate: { product, arrival }, reason }) => {
    const maker = getMaker(product.makerId);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      maker: { name: maker.name, slug: maker.slug, location: maker.location },
      arrival,
      arrivalLabel: formatShortDate(arrival),
      reason,
      personalisable: isPersonalisable(product),
    };
  });

  const response: MatchResponse = {
    mode: ranking && ranking.picks.length > 0 ? "ai" : "rules",
    modeNote,
    understood: {
      summary: ranking?.summary,
      budgetMax: facts.budgetMax,
      date: facts.date && { iso: facts.date.iso, label: formatShortDate(facts.date.iso) },
      area: facts.area && { name: facts.area.area, zone: zoneLabels[facts.area.zone] },
      recipient: recipients.find((r) => r.id === facts.recipient)?.label,
      occasion: occasions.find((o) => o.id === facts.occasion)?.label,
      interests:
        ranking?.interests.slice(0, 5) ??
        facts.interests.map((id) => interestList.find((i) => i.id === id)?.label ?? id),
    },
    matches,
    excludedNote: describeExclusions(excluded, facts),
    remaining: Math.max(0, candidates.length - matches.length),
  };
  return Response.json(response);
}
