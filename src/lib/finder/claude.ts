import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AiOutputError, type AiProvider } from "./ai-types";

/**
 * Claude provider. Used when ANTHROPIC_API_KEY is set (and no Gemini key).
 * The key never reaches the browser.
 */

const MODEL = "claude-opus-5-5";

let client: Anthropic | undefined;

export const claudeProvider: AiProvider = {
  name: "Claude",
  async generateJson({ system, prompt, schema }) {
    client ??= new Anthropic({ timeout: 20_000, maxRetries: 1 });

    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") throw new AiOutputError("Claude declined the request");
    const parsed = schema.safeParse(response.parsed_output);
    if (!parsed.success) throw new AiOutputError("Claude output did not match the schema");
    return parsed.data;
  },
};
