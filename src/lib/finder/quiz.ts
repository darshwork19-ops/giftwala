import { addDays, formatShortDate } from "./dates";

/**
 * The guided Gift Finder: shoppers tap choices instead of typing, and the
 * choices are written up as a short brief the finder already understands
 * ("A birthday gift for my mom. She loves coffee and plants. Under ₹2,000.
 * Needed by 29 Oct in Andheri."). Every word used here is one the parser or
 * the catalogue recognises; `quiz.test.ts` checks that.
 */

export interface Choice {
  id: string;
  label: string;
  /** Words written into the brief. */
  words: string;
}

export const RECIPIENTS: (Choice & { pronoun: "she" | "he" | "they" })[] = [
  { id: "mom", label: "Mom", words: "my mom", pronoun: "she" },
  { id: "dad", label: "Dad", words: "my dad", pronoun: "he" },
  { id: "wife", label: "Wife", words: "my wife", pronoun: "she" },
  { id: "husband", label: "Husband", words: "my husband", pronoun: "he" },
  { id: "girlfriend", label: "Girlfriend", words: "my girlfriend", pronoun: "she" },
  { id: "boyfriend", label: "Boyfriend", words: "my boyfriend", pronoun: "he" },
  { id: "sister", label: "Sister", words: "my sister", pronoun: "she" },
  { id: "brother", label: "Brother", words: "my brother", pronoun: "he" },
  { id: "friend", label: "Friend", words: "my friend", pronoun: "they" },
  { id: "best-friend", label: "Best friend", words: "my best friend", pronoun: "they" },
  { id: "grandparent", label: "Grandparent", words: "my grandparent", pronoun: "they" },
  { id: "colleague", label: "Colleague", words: "my colleague", pronoun: "they" },
  { id: "kid", label: "A kid", words: "a kid", pronoun: "they" },
];

export const OCCASIONS: Choice[] = [
  { id: "birthday", label: "Birthday", words: "birthday" },
  { id: "anniversary", label: "Anniversary", words: "anniversary" },
  { id: "wedding", label: "Wedding", words: "wedding" },
  { id: "diwali", label: "Diwali", words: "Diwali" },
  { id: "rakhi", label: "Raksha Bandhan", words: "Rakhi" },
  { id: "baby", label: "New baby", words: "new baby" },
  { id: "housewarming", label: "New home", words: "housewarming" },
  { id: "thank-you", label: "Thank you", words: "thank you" },
  { id: "just-because", label: "Just because", words: "just because" },
];

/** What they're into, grouped so the list scans quickly. */
export const INTEREST_GROUPS: { label: string; choices: Choice[] }[] = [
  {
    label: "Food & drink",
    choices: [
      { id: "coffee", label: "Coffee", words: "coffee" },
      { id: "tea", label: "Tea & chai", words: "tea" },
      { id: "chocolate", label: "Chocolate", words: "chocolate" },
      { id: "baking", label: "Baking", words: "baking" },
      { id: "cheese", label: "Cheese & snacks", words: "cheese" },
      { id: "hosting", label: "Hosting friends", words: "hosting a party" },
      { id: "drinks", label: "Cocktails & drinks", words: "drinks" },
    ],
  },
  {
    label: "Home & calm",
    choices: [
      { id: "plants", label: "Plants", words: "plants" },
      { id: "candles", label: "Candles", words: "candles" },
      { id: "self-care", label: "Self-care", words: "self-care" },
      { id: "decor", label: "Home decor", words: "home decor" },
      { id: "pooja", label: "Pooja & festivals", words: "pooja" },
    ],
  },
  {
    label: "Making & memories",
    choices: [
      { id: "reading", label: "Reading", words: "reading" },
      { id: "journaling", label: "Journaling", words: "journaling" },
      { id: "art", label: "Art", words: "art" },
      { id: "photos", label: "Photos & memories", words: "photos" },
      { id: "music", label: "Music", words: "music" },
    ],
  },
  {
    label: "Out & about",
    choices: [
      { id: "travel", label: "Travel", words: "travelling" },
      { id: "cricket", label: "Cricket", words: "cricket" },
      { id: "fitness", label: "Fitness & yoga", words: "yoga" },
      { id: "gaming", label: "Gaming", words: "gaming" },
      { id: "movies", label: "Movies & series", words: "movies" },
      { id: "jewellery", label: "Jewellery & fashion", words: "jewellery" },
      { id: "pets", label: "Their pet", words: "dogs" },
    ],
  },
];

export const STYLES: Choice[] = [
  { id: "personalised", label: "Personalised", words: "personalised" },
  { id: "handmade", label: "Handmade", words: "handmade" },
  { id: "luxury", label: "A little luxurious", words: "luxury" },
  { id: "unusual", label: "Unusual", words: "unusual" },
];

export const BUDGETS: (Choice & { max?: number })[] = [
  { id: "500", label: "Under ₹500", words: "Under ₹500", max: 500 },
  { id: "1000", label: "Under ₹1,000", words: "Under ₹1,000", max: 1000 },
  { id: "1500", label: "Under ₹1,500", words: "Under ₹1,500", max: 1500 },
  { id: "2000", label: "Under ₹2,000", words: "Under ₹2,000", max: 2000 },
  { id: "3000", label: "Under ₹3,000", words: "Under ₹3,000", max: 3000 },
  { id: "5000", label: "Under ₹5,000", words: "Under ₹5,000", max: 5000 },
  { id: "any", label: "No fixed budget", words: "" },
];

export type WhenId = "tomorrow" | "weekend" | "week" | "two-weeks" | "date" | "no-rush";
export const WHEN: { id: WhenId; label: string }[] = [
  { id: "tomorrow", label: "Tomorrow" },
  { id: "weekend", label: "This weekend" },
  { id: "week", label: "Within a week" },
  { id: "two-weeks", label: "Within 2 weeks" },
  { id: "date", label: "Pick a date" },
  { id: "no-rush", label: "No rush" },
];

export interface QuizAnswers {
  recipient?: string;
  occasion?: string;
  interests: string[];
  styles: string[];
  budget?: string;
  when?: WhenId;
  /** ISO date, when `when` is "date". */
  date?: string;
  /** A Mumbai area name, or "" when not given. */
  area: string;
  view: "all" | "buy" | "ideas";
}

export const emptyAnswers: QuizAnswers = { interests: [], styles: [], area: "", view: "all" };

export const MAX_INTERESTS = 5;

const find = <T extends { id: string }>(list: T[], id?: string) => list.find((c) => c.id === id);
export const allInterests = INTEREST_GROUPS.flatMap((g) => g.choices);

function listWords(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** The date phrase for "when", in a form the brief parser reads. */
export function whenPhrase(answers: QuizAnswers, today: string): string | undefined {
  switch (answers.when) {
    case "tomorrow":
      return "tomorrow";
    case "weekend":
      return "Saturday";
    case "week":
      return formatShortDate(addDays(today, 7)).replace(/^\w+, /, "");
    case "two-weeks":
      return formatShortDate(addDays(today, 14)).replace(/^\w+, /, "");
    case "date":
      return answers.date ? formatShortDate(answers.date).replace(/^\w+, /, "") : undefined;
    default:
      return undefined;
  }
}

/** Writes the answers up as a brief, e.g. "A birthday gift for my mom. She loves coffee and plants. Under ₹2,000." */
export function composeBrief(answers: QuizAnswers, today: string): string {
  const recipient = find(RECIPIENTS, answers.recipient);
  const occasion = find(OCCASIONS, answers.occasion);
  const interests = answers.interests.map((id) => find(allInterests, id)?.words).filter((w): w is string => Boolean(w));
  const styles = answers.styles.map((id) => find(STYLES, id)?.words).filter((w): w is string => Boolean(w));
  const budget = find(BUDGETS, answers.budget);
  const when = whenPhrase(answers, today);

  const subject = recipient ? recipient.words : "someone special";
  const sentences = [`A ${occasion ? `${occasion.words} ` : ""}gift for ${subject}.`];
  if (interests.length) {
    const who = recipient?.pronoun === "she" ? "She loves" : recipient?.pronoun === "he" ? "He loves" : "They love";
    sentences.push(`${who} ${listWords(interests)}.`);
  }
  if (styles.length) sentences.push(`Something ${listWords(styles)}.`);
  if (budget?.words) sentences.push(`${budget.words}.`);
  const where = answers.area ? ` in ${answers.area}` : "";
  if (when) sentences.push(`Needed by ${when}${where}.`);
  else if (where) sentences.push(`Delivered${where}.`);
  return sentences.join(" ");
}

/** Short labels for the "your picks so far" strip. */
export function answerLabels(answers: QuizAnswers): { step: number; label: string }[] {
  const out: { step: number; label: string }[] = [];
  const r = find(RECIPIENTS, answers.recipient);
  if (r) out.push({ step: 0, label: `For ${r.label.toLowerCase()}` });
  const o = find(OCCASIONS, answers.occasion);
  if (o) out.push({ step: 1, label: o.label });
  answers.interests.forEach((id) => {
    const c = find(allInterests, id);
    if (c) out.push({ step: 2, label: c.label });
  });
  answers.styles.forEach((id) => {
    const c = find(STYLES, id);
    if (c) out.push({ step: 3, label: c.label });
  });
  const b = find(BUDGETS, answers.budget);
  if (b) out.push({ step: 4, label: b.label });
  const w = WHEN.find((x) => x.id === answers.when);
  if (w) out.push({ step: 5, label: w.id === "date" && answers.date ? `By ${formatShortDate(answers.date)}` : w.label });
  if (answers.area) out.push({ step: 5, label: answers.area });
  return out;
}
