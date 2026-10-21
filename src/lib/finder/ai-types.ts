import type { z } from "zod";

/**
 * The small surface the Gift Finder needs from an AI model: given
 * instructions, a prompt and a schema, return schema-valid JSON or throw.
 */
export interface AiProvider {
  name: "Gemini" | "Claude";
  generateJson<T>(request: { system: string; prompt: string; schema: z.ZodType<T> }): Promise<T>;
}

/** The model answered, but with nothing usable (empty, malformed, refused). */
export class AiOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiOutputError";
  }
}
