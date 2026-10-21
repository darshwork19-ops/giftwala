import type { AiProvider } from "./ai-types";
import { claudeProvider } from "./claude";
import { geminiProvider } from "./gemini";

/**
 * Server-only: picks the AI provider from environment variables.
 * Gemini when its key is set, otherwise Claude, otherwise none (rules only).
 */
export function configuredProvider(): AiProvider | undefined {
  if (process.env.GEMINI_API_KEY) return geminiProvider;
  if (process.env.ANTHROPIC_API_KEY) return claudeProvider;
  return undefined;
}
