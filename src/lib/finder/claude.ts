import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getMaker } from "@/lib/catalogue";
import type { Candidate } from "./match";

/**
 * Claude reads the free-text brief and ranks gifts that have ALREADY passed
 * the rule-based budget, date and area filters. It can only choose from the
 * ids it is given, and every pick is re-checked in code afterwards.
 * Server-only: the API key never reaches the browser.
 */

const MODEL = "claude-opus-5-5";

const RankingSchema = z.object({
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

const SYSTEM = `You help shoppers on GIFTWALA, a marketplace of handmade gifts from small Mumbai makers, choose a gift.

You receive a shopper's description of the person they are buying for and a list of candidate gifts. Every candidate already fits the budget, arrives in time and delivers to the area, so judge only how well each one suits the person.

Rules:
- Choose only from the candidate ids provided. Never invent products, makers, prices or options.
- Write each reason to the shopper, about the recipient ("She'll..." or "For someone who..."), in plain, warm English under 22 words.
- Ground every reason in the shopper's words and the product's own description. Do not mention price or delivery; the page shows those.
- Prefer variety: avoid three gifts of the same kind unless the brief asks for it.
- Be careful with religion, age and relationship: do not pick a religious or festival item unless the brief points to it.`;

let client: Anthropic | undefined;

export function claudeAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function rankWithClaude(
  brief: string,
  candidates: Candidate[],
  count: number,
): Promise<Ranking | undefined> {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });

  const catalogue = candidates.map(({ product }) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    description: product.description,
    tags: product.tags,
    maker: getMaker(product.makerId).name,
    personalisation: product.personalisation.map((o) => o.label),
  }));

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(RankingSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Shopper's description:\n${brief}\n\nPick the ${count} best gifts from these candidates:\n${JSON.stringify(catalogue)}`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return undefined;

  // Keep only real, eligible, de-duplicated picks
  const allowed = new Set(candidates.map((c) => c.product.id));
  const seen = new Set<string>();
  const picks = response.parsed_output.picks.filter((p) => {
    if (!allowed.has(p.productId) || seen.has(p.productId)) return false;
    seen.add(p.productId);
    return true;
  });
  return { ...response.parsed_output, picks: picks.slice(0, count) };
}
