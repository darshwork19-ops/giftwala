import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { AiOutputError, type AiProvider } from "./ai-types";

/**
 * Gemini provider (Google AI Studio). Used when GEMINI_API_KEY is set on the
 * server. The key never reaches the browser.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const TIMEOUT_MS = 15_000;

let client: GoogleGenAI | undefined;

export const geminiProvider: AiProvider = {
  name: "Gemini",
  async generateJson({ system, prompt, schema }) {
    client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Gemini accepts a subset of JSON Schema; the "$schema" marker isn't part of it
    const responseJsonSchema: Record<string, unknown> = { ...z.toJSONSchema(schema) };
    delete responseJsonSchema.$schema;

    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      },
    });

    const text = response.text;
    if (!text) throw new AiOutputError("Gemini returned an empty response");
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new AiOutputError("Gemini returned malformed JSON");
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) throw new AiOutputError("Gemini output did not match the schema");
    return parsed.data;
  },
};
