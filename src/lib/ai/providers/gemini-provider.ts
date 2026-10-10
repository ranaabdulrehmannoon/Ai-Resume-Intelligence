import "server-only";
import { GoogleGenAI } from "@google/genai";

import type { AIProvider, GenerateOptions } from "./types";
import { AIProviderError } from "./types";

const GENERATION_MODEL = process.env.GEMINI_GENERATION_MODEL ?? "gemini-3.5-flash-lite";
const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * The ONLY module in this codebase that reads GEMINI_API_KEY. The
 * `server-only` import above makes it a build error to ever import this
 * file from client code, so the key can never leak into a browser bundle.
 */
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;

  constructor(apiKey: string = process.env.GEMINI_API_KEY ?? "") {
    if (!apiKey) {
      throw new AIProviderError(
        "GEMINI_API_KEY is not set. Set it in your environment or use MockProvider for development.",
        "gemini"
      );
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateText(options: GenerateOptions): Promise<string> {
    try {
      const response = await this.client.interactions.create({
        model: GENERATION_MODEL,
        input: options.system ? `${options.system}\n\n${options.prompt}` : options.prompt,
      });
      return response.output_text ?? "";
    } catch (err) {
      throw new AIProviderError("Gemini generateText failed", "gemini", err);
    }
  }

  async generateJSON(options: GenerateOptions): Promise<string> {
    try {
      const response = await this.client.interactions.create({
        model: GENERATION_MODEL,
        input: options.system ? `${options.system}\n\n${options.prompt}` : options.prompt,
      });
      return response.output_text ?? "";
    } catch (err) {
      throw new AIProviderError("Gemini generateJSON failed", "gemini", err);
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
      });
      return response.embeddings?.[0]?.values ?? [];
    } catch (err) {
      throw new AIProviderError("Gemini embed failed", "gemini", err);
    }
  }
}
