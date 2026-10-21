import { KNOWN_SUBJECTS } from "./match";
import type { BriefFacts } from "./parse";
import { CONVERSATION_WORDS, DESCRIPTOR, GIFT_CONTEXT_WORDS, stem, tokenize } from "./vocabulary";

/**
 * What kind of message the shopper sent, decided BEFORE any matching so that
 * nonsense or off-topic text can never produce product cards.
 *
 * - "request":   about a gift and says something about it or the person.
 * - "vague":     about a gift but gives nothing to match on yet ("a gift for
 *                my sister") → ask one follow-up question.
 * - "off_topic": a real sentence that isn't about gifts.
 * - "nonsense":  no recognisable words ("bsibcisbc", "asdfgh 123 xyz").
 */
export type IntentKind = "request" | "vague" | "off_topic" | "nonsense";

export interface Intent {
  kind: IntentKind;
  /** Brief words the catalogue or ideas list recognises. */
  knownSubjects: string[];
  /** Meaningful words we don't recognise (e.g. "astronomy"). */
  unknownSubjects: string[];
  /** True when rules alone can't tell nonsense from an unfamiliar real word. */
  uncertain: boolean;
}

export function classifyIntent(text: string, facts: BriefFacts): Intent {
  const tokens = tokenize(text);
  const knownSubjects = facts.keywords.filter((w) => KNOWN_SUBJECTS.has(stem(w)));
  // Hyphenated words are also split into parts by the tokenizer; report the parts only
  const unknownSubjects = facts.keywords.filter(
    (w) => !w.includes("-") && !KNOWN_SUBJECTS.has(stem(w)) && /\p{L}/u.test(w),
  );

  const giftContext =
    tokens.some((t) => GIFT_CONTEXT_WORDS.has(t)) ||
    DESCRIPTOR.test(text.toLowerCase()) ||
    Boolean(facts.recipient || facts.occasion || facts.budgetMax || facts.wantsPersonalised);
  const hasSubject = knownSubjects.length > 0 || facts.interests.length > 0;

  if (hasSubject) return { kind: "request", knownSubjects, unknownSubjects, uncertain: false };
  if (giftContext) {
    // "loves astronomy": a real subject we can't match yet is still a request
    return unknownSubjects.length > 0
      ? { kind: "request", knownSubjects, unknownSubjects, uncertain: false }
      : { kind: "vague", knownSubjects, unknownSubjects, uncertain: false };
  }
  if (tokens.some((t) => CONVERSATION_WORDS.has(t))) {
    return { kind: "off_topic", knownSubjects, unknownSubjects, uncertain: false };
  }
  // No gift words and no grammar words. Could still be a real product word we
  // don't stock ("telescope"), so an AI check may overrule this.
  const wordLike = unknownSubjects.some((w) => {
    const vowels = (w.match(/[aeiouy]/g) ?? []).length;
    return w.length >= 4 && vowels / w.length >= 0.3 && !/[^aeiouy]{4,}/.test(w) && !/(.)\1\1/.test(w);
  });
  return { kind: "nonsense", knownSubjects, unknownSubjects, uncertain: wordLike };
}

/** The one follow-up question to ask for a vague request. */
export function followUpFor(facts: BriefFacts): { question: string; suggestions: string[] } {
  return {
    question: facts.recipient
      ? "What are they into? Hobbies, sports, what they read, watch or eat — anything that makes them them."
      : "Who is the gift for, and what are they into?",
    suggestions: [
      "They love cricket and travel",
      "They're a big reader",
      "They're into cooking and coffee",
      "They love plants and slow mornings",
      "They're a huge K-drama fan",
      "They're into cars and tech",
    ],
  };
}
