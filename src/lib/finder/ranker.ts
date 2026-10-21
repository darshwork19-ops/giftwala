import { z } from "zod";
import { getMaker } from "@/lib/catalogue";
import type { Candidate } from "./match";

/**
 * Shared by every AI provider: the instructions, the output shape and the
 * checks applied to whatever the model returns. Providers only differ in how
 * they call their API.
 */

export const RankingSchema = z.object({
  summary: z
    .string()
    .describe("One short line describing the recipient, e.g. 'Your girlfriend, turning 24, who loves cats and K-dramas'"),
  interests: z.array(z.string()).describe("Up to 5 short interest labels taken from the brief"),
  picks: z
    .array(
      z.object({
        productId: z.string(),
        reason: z.string().describe("Why this fits the recipient, under 22 words"),
      }),
    )
    .describe("The best matches, best first"),
});

export type Ranking = z.infer<typeof RankingSchema>;

export const RANKER_INSTRUCTIONS = `You help shoppers on GIFTWALA, a marketplace of handmade gifts from small Mumbai makers, choose a gift.

You receive a shopper's description of the person they are buying for and a list of candidate gifts. Every candidate already fits the budget, arrives in time and delivers to the area, so judge only how well each one suits the person.

Rules:
- Choose only from the candidate ids provided. Never invent products, makers, prices or options.
- Write each reason to the shopper, about the recipient ("She'll..." or "For someone who..."), in plain, warm English under 22 words.
- Ground every reason in the shopper's words and the product's own description. Do not mention price or delivery; the page shows those.
- Prefer variety: avoid three gifts of the same kind unless the brief asks for it.
- Be careful with religion, age and relationship: do not pick a religious or festival item unless the brief points to it.`;

/** The user turn: the brief plus the eligible candidates as compact JSON. */
export function rankerPrompt(brief: string, candidates: Candidate[], count: number): string {
  const catalogue = candidates.map(({ product }) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    description: product.description,
    tags: product.tags,
    maker: getMaker(product.makerId).name,
    personalisation: product.personalisation.map((o) => o.label),
  }));
  return `Shopper's description:\n${brief}\n\nPick the ${count} best gifts from these candidates:\n${JSON.stringify(catalogue)}`;
}

/** Keeps only real, eligible, de-duplicated picks, however the model behaved. */
export function cleanRanking(raw: unknown, candidates: Candidate[], count: number): Ranking | undefined {
  const parsed = RankingSchema.safeParse(raw);
  if (!parsed.success) return undefined;
  const allowed = new Set(candidates.map((c) => c.product.id));
  const seen = new Set<string>();
  const picks = parsed.data.picks.filter((p) => {
    if (!allowed.has(p.productId) || seen.has(p.productId)) return false;
    seen.add(p.productId);
    return true;
  });
  return { ...parsed.data, picks: picks.slice(0, count) };
}
