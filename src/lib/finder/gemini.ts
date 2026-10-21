import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import type { Candidate } from "./match";
import { cleanRanking, RANKER_INSTRUCTIONS, RankingSchema, rankerPrompt, type Ranking } from "./ranker";

/**
 * Gemini provider (Google AI Studio). Used when GEMINI_API_KEY is set on the
 * server. The key never reaches the browser.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
// Gemini accepts a subset of JSON Schema; the "$schema" marker isn't part of it
const responseJsonSchema: Record<string, unknown> = { ...z.toJSONSchema(RankingSchema) };
delete responseJsonSchema.$schema;

let client: GoogleGenAI | undefined;

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function rankWithGemini(
  brief: string,
  candidates: Candidate[],
  count: number,
): Promise<Ranking | undefined> {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await client.models.generateContent({
    model: MODEL,
    contents: rankerPrompt(brief, candidates, count),
    config: {
      systemInstruction: RANKER_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseJsonSchema,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      abortSignal: AbortSignal.timeout(20_000),
    },
  });

  const text = response.text;
  if (!text) return undefined;
  try {
    return cleanRanking(JSON.parse(text), candidates, count);
  } catch {
    return undefined;
  }
}
