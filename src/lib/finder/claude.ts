import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Candidate } from "./match";
import { cleanRanking, RANKER_INSTRUCTIONS, RankingSchema, rankerPrompt, type Ranking } from "./ranker";

/**
 * Claude provider. Used when ANTHROPIC_API_KEY is set on the server.
 * The key never reaches the browser.
 */

const MODEL = "claude-opus-5-5";

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

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(RankingSchema) },
    system: RANKER_INSTRUCTIONS,
    messages: [{ role: "user", content: rankerPrompt(brief, candidates, count) }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return undefined;
  return cleanRanking(response.parsed_output, candidates, count);
}
