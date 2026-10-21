import { z } from "zod";
import { getMaker } from "@/lib/catalogue";
import type { Candidate } from "./match";

/**
 * Prompts and output shapes shared by every AI provider. The model output is
 * untrusted: the engine re-validates every id it returns.
 */

export const RankingSchema = z.object({
  summary: z
    .string()
    .describe("One short line describing the recipient from the brief, e.g. 'A friend turning 24 who loves cats and K-dramas'"),
  interests: z.array(z.string()).describe("Up to 5 short interest labels taken from the brief"),
  picks: z
    .array(
      z.object({
        productId: z.string(),
        reason: z.string().describe("Why this fits the recipient, under 22 words"),
      }),
    )
    .describe("Only candidates that genuinely fit, best first. Empty if none fit."),
});

export type Ranking = z.infer<typeof RankingSchema>;

export const RANKER_INSTRUCTIONS = `You help shoppers on GIFTWALA choose a gift for a specific person.

You receive the shopper's description of the recipient and a short list of candidate gifts from the GIFTWALA catalogue. Every candidate already fits the budget, timing and destination and shares at least one keyword with the description. Your job is to judge which candidates genuinely suit this person.

Rules:
- Return only candidates that genuinely fit the person's stated interests. It is fine to return one, two or none. Never pad the list.
- Choose only from the candidate ids provided. Never invent products, makers, prices, stock, options or delivery details.
- Write each reason to the shopper about the recipient, in plain, warm English under 22 words, grounded in the shopper's words and the product's description.
- Do not assume gender, age or taste. Use "they" unless the description makes the recipient's gender clear.
- Do not mention price or delivery; the page shows those.
- Be careful with religion, age and relationship: do not pick a religious or festival item unless the description points to it.`;

/** The user turn: the brief plus the eligible candidates as compact JSON. */
export function rankerPrompt(brief: string, candidates: Candidate[], max: number): string {
  const catalogue = candidates.map(({ product }) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    description: product.description,
    tags: product.tags,
    maker: getMaker(product.makerId).name,
    personalisation: product.personalisation.map((o) => o.label),
  }));
  return `Shopper's description:\n${brief}\n\nReturn at most ${max} gifts that genuinely fit, chosen only from these candidates:\n${JSON.stringify(catalogue)}`;
}

export const IntentCheckSchema = z.object({
  kind: z
    .enum(["gift_request", "off_topic", "nonsense"])
    .describe("gift_request: about choosing a gift or describes a gift or a person's interests. off_topic: a real message unrelated to gifts. nonsense: random characters or no meaning."),
});

export const INTENT_INSTRUCTIONS = `Classify a message typed into a gift finder search box. Reply with one kind only. A single product or hobby word (for example "telescope" or "pottery") counts as gift_request. Random letters count as nonsense.`;
