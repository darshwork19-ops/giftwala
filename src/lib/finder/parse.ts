import type { InterestId, OccasionId, RecipientId } from "@/lib/types";
import { allAreaNames } from "./areas";
import { parseDate } from "./dates";
import { findDestination, type Destination } from "./destination";
import { CALENDAR_WORDS, isNumeric, MODIFIERS, STOP_WORDS, tokenize } from "./vocabulary";

/**
 * Facts with a right answer (budget, date, area) are read by rules, never by
 * AI, so the hard filters are predictable. Softer signals (recipient,
 * occasion, interests) are read here too, so the finder works without AI.
 */
export interface BriefFacts {
  budgetMax?: number;
  budgetMin?: number;
  date?: { iso: string; phrase: string };
  destination?: Destination;
  /** True when the brief asks for an exact time ("by 6pm", "midnight"). */
  wantsTimeSlot: boolean;
  recipient?: RecipientId;
  occasion?: OccasionId;
  age?: number;
  /** Interest groups named in the brief ("reading" → books-stationery). */
  interests: InterestId[];
  /** Asked for something personalised (a modifier, not a subject). */
  wantsPersonalised: boolean;
  /** Meaningful words: what the gift or the person is about. */
  keywords: string[];
  /** Words describing the gift's style ("handmade", "custom"). */
  modifiers: string[];
}

const RECIPIENT_WORDS: [RegExp, RecipientId][] = [
  [/\b(gf|girlfriend|bf|boyfriend|wife|husband|partner|fianc[eé]e?|spouse|bae)\b/, "partner"],
  [/\b(mom|mum|mother|maa|dad|father|papa|parents?|in-laws?)\b/, "parent"],
  [/\b(sister|brother|sis|bro|sibling|cousin)\b/, "sibling"],
  [/\b(colleague|coworker|co-worker|boss|manager|teammate|team mate)\b/, "colleague"],
  [/\b(friend|bestie|bff|best friend|roommate|flatmate)\b/, "friend"],
];

const OCCASION_WORDS: [RegExp, OccasionId][] = [
  [/\b(birthday|bday|b'day|turns \d+|turning \d+)\b/, "birthday"],
  [/\banniversary\b/, "anniversary"],
  [/\b(wedding|marriage|getting married|engagement)\b/, "wedding"],
  [/\b(thank|thanks|thank you|grateful|farewell)\b/, "thank-you"],
  [/\b(diwali|holi|eid|christmas|rakhi|raksha bandhan|festival|navratri|pongal)\b/, "festivals"],
  [/\b(just because|no reason|cheer (her|him|them) up)\b/, "just-because"],
];

const INTEREST_WORDS: [RegExp, InterestId][] = [
  [/\b(read|reading|reader|books?|novels?|writing|journal(ing)?|stationery|poetry)\b/, "books-stationery"],
  [/\b(coffee|tea|chai|food|foodie|cook(ing)?|bak(ing|er)|chocolate|sweets?|snacks?|ramen)\b/, "food-coffee"],
  [/\b(art|artsy|crafts?|crafty|pottery|ceramics?|paint(ing)?|draw(ing)?|illustration)\b/, "art-handmade"],
  [/\b(home|decor|interiors?|house ?warming|new (flat|home|house))\b/, "home-decor"],
  [/\b(self[- ]care|relax(ing)?|spa|candles?|skincare|wellness|yoga|calm|sleep(ing)?|slow mornings?)\b/, "self-care"],
  [/\b(memories|keepsakes?|sentimental|nostalgic|photos?|scrapbook)\b/, "keepsakes"],
  [/\b(plants?|gardening|garden|flowers?|houseplants?)\b/, "plants-nature"],
];

const PERSONALISED = /\b(personali[sz]ed|custom(ised|ized)?|engraved|name on|monogram(med)?)\b/;
const TIME_SLOT = /\b(\d{1,2}(:\d{2})?\s*(am|pm)|midnight|noon|morning|afternoon|evening|time slot|slot)\b/;

// Words that name the recipient or occasion are context, not gift subjects
const CONTEXT_WORDS = new Set(
  `gf girlfriend bf boyfriend wife husband partner fiance fiancee spouse bae mom mum mother maa dad father papa
  parent parents sister brother sis bro sibling cousin colleague coworker boss manager teammate friend bestie bff
  roommate flatmate son daughter kid kids child baby grandma grandpa grandmother grandfather nani dadi aunt uncle
  niece nephew birthday bday anniversary wedding marriage engagement thank thanks farewell diwali holi eid
  christmas rakhi festival navratri pongal occasion mumbai`.split(/\s+/),
);
const AREA_WORDS = new Set(allAreaNames.flatMap((a) => a.toLowerCase().split(" ")));

/** "₹1,500", "Rs 1500", "1.5k", "under 2000", "1000-2000", "2k budget" */
function parseBudget(lower: string): { min?: number; max?: number } {
  const amount = String.raw`(?:₹|rs\.?|inr)?\s*(\d+(?:[.,]\d+)?)\s*(k)?`;
  const toRupees = (n: string, k?: string) =>
    Math.round(Number(n.replace(/,/g, "")) * (k ? 1000 : 1));

  const range = lower.match(new RegExp(`${amount}\\s*(?:-|–|to)\\s*${amount}`));
  if (range && /₹|rs|inr|k\b|budget/.test(range[0] + lower)) {
    const min = toRupees(range[1], range[2]);
    const max = toRupees(range[3], range[4]);
    if (max >= 100 && max > min) return { min, max };
  }
  // A number with a currency marker, "k", or a budget word nearby
  const money = [
    ...lower.matchAll(
      /(under|below|upto|up to|max|within|around|about|budget(?: of| is)?)?\s*(₹|rs\.?|inr)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?|(under|below|upto|up to|max|within|around|about|budget(?: of| is)?)\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?|\b(\d+(?:\.\d+)?)\s*k\b/g,
    ),
  ];
  for (const m of money) {
    const raw = m[3] ?? m[6] ?? m[8];
    const k = m[4] ?? m[7] ?? (m[8] ? "k" : undefined);
    if (!raw) continue;
    const value = toRupees(raw, k);
    if (value < 100) continue; // "turns 24" is not a budget
    const qualifier = m[1] ?? m[5];
    if (qualifier && /around|about/.test(qualifier)) {
      return { max: Math.round(value * 1.15) };
    }
    return { max: value };
  }
  return {};
}

export function parseBrief(text: string, today: string): BriefFacts {
  const lower = text.toLowerCase();
  const budget = parseBudget(lower);
  const ageMatch = lower.match(/\b(?:turns?|turning|aged?|is)\s+(\d{1,2})\b|\b(\d{1,2})\s*(?:f|m|yo|years? old)\b/);
  const age = ageMatch ? Number(ageMatch[1] ?? ageMatch[2]) : undefined;

  const interests = INTEREST_WORDS.filter(([re]) => re.test(lower)).map(([, id]) => id);
  const tokens = tokenize(text);
  const keywords: string[] = [];
  const modifiers: string[] = [];
  for (const t of new Set(tokens)) {
    if (t.length < 2 || isNumeric(t) || STOP_WORDS.has(t) || CALENDAR_WORDS.has(t)) continue;
    if (CONTEXT_WORDS.has(t) || AREA_WORDS.has(t)) continue;
    if (/^\d+(st|nd|rd|th)$/.test(t) || /^\d{1,2}(f|m)$/.test(t)) continue;
    if (MODIFIERS.has(t)) modifiers.push(t);
    else keywords.push(t);
  }

  return {
    budgetMax: budget.max,
    budgetMin: budget.min,
    date: parseDate(text, today),
    destination: findDestination(text),
    wantsTimeSlot: TIME_SLOT.test(lower),
    recipient: RECIPIENT_WORDS.find(([re]) => re.test(lower))?.[1],
    occasion: OCCASION_WORDS.find(([re]) => re.test(lower))?.[1],
    age: age && age > 0 && age < 100 ? age : undefined,
    interests: [...new Set(interests)],
    wantsPersonalised: PERSONALISED.test(lower),
    keywords,
    modifiers,
  };
}
