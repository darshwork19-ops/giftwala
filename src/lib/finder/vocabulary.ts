/**
 * Word lists and tokenising shared by intent checks, parsing and matching.
 * Kept in one place so "what counts as a meaningful word" is consistent.
 */

/** Lower-case and drop a plural "s", so "cats" matches "cat". */
export function stem(word: string): string {
  const w = word.toLowerCase();
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}

/**
 * Splits text into lower-case word tokens. Hyphenated words are kept whole
 * and also split ("cricket-loving" → "cricket-loving", "cricket", "loving").
 */
export function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[₹]/g, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^['-]+|['-]+$/g, ""))
    .filter(Boolean);
  const out: string[] = [];
  for (const t of raw) {
    out.push(t);
    if (t.includes("-")) out.push(...t.split("-").filter(Boolean));
  }
  return out;
}

/** Grammar words and filler that carry no gift meaning on their own. */
export const STOP_WORDS = new Set(
  `a an and the for to of in on at by my her his their our she he they them him its it is are was were be been am
  i me you your we us this that these those with from into onto who whom which what when where why how also but
  or not no so very really quite just too much many more most some any all each every one two own other
  loves love loved likes like liked enjoys enjoy enjoyed into fan obsessed crazy about keen passionate interested
  plays play playing collects collect hobby hobbies
  want wants wanted need needs needed looking look find finding get getting give giving buy buying send sending
  gift gifts gifting present presents surprise something anything thing things idea ideas option options
  suggest suggestion suggestions recommend recommendation please help can could would should will shall
  under below upto up within around about max budget rs inr rupees price cost costs costing worth spend
  turns turning turned year years old age aged yo is was has have had do does did
  nice good great best special perfect lovely cool fun thoughtful meaningful unique different
  today tomorrow tonight day week month next this coming by before on
  lot lots bit little big small huge`.split(/\s+/),
);

/**
 * Describe a gift rather than its subject. They can boost a match but never
 * make an unrelated product relevant on their own.
 */
export const MODIFIERS = new Set(
  `handmade hand-made handcrafted artisan custom customised customized personalised personalized engraved
  monogram unusual unique cute pretty elegant minimal minimalist premium luxury cheap affordable budget
  set pair box kit hamper bundle themed theme style styled soft bright sweet festive calm earthy`.split(/\s+/),
);

/** Words that show the text is about choosing a gift for someone. */
export const GIFT_CONTEXT_WORDS = new Set(
  `gift gifts gifting present presents surprise hamper buy buying get send shop shopping something anything
  idea ideas suggest recommend`.split(/\s+/),
);

/** Phrases describing a person's tastes ("loves", "is into", "plays"). */
export const DESCRIPTOR = /\b(loves?|loved|likes?|enjoys?|into|fan of|obsessed with|crazy about|keen on|passionate about|interested in|plays?|playing|collects?|studying|studies|hobby|hobbies|is a .+ (fan|lover|enthusiast)|enthusiast|lover)\b/;

/** Common question and conversation words, used to spot off-topic messages. */
export const CONVERSATION_WORDS = new Set(
  `what who where when why how which is are was were the of a an do does did can could would should tell explain
  define meaning capital weather news hello hi hey thanks thank please whats who's what's you your i me my`.split(
    /\s+/,
  ),
);

/** Calendar words handled by the date parser, not meaningful as subjects. */
export const CALENDAR_WORDS = new Set(
  `monday tuesday wednesday thursday friday saturday sunday mon tue wed thu fri sat sun
  january february march april may june july august september october november december
  jan feb mar apr jun jul aug sep sept oct nov dec weekend`.split(/\s+/),
);

/** True for tokens made only of digits, money or PIN-like numbers. */
export function isNumeric(token: string): boolean {
  return /^\d+(?:[.,]\d+)?k?$/.test(token);
}
