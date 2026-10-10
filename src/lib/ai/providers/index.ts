import "server-only";
import type { AIProvider } from "./types";
import { MockProvider } from "./mock-provider";
import { GeminiProvider } from "./gemini-provider";

export type { AIProvider, GenerateOptions } from "./types";
export { AIProviderError, isAIProviderRateLimitError } from "./types";
export { MockProvider } from "./mock-provider";
export { GeminiProvider } from "./gemini-provider";

let cached: AIProvider | null = null;

/**
 * Single source of truth for which AI provider the app uses. Controlled
 * by AI_PROVIDER=mock|gemini (defaults to "mock" so a missing/misconfigured
 * env never accidentally burns real API credits). Services should always
 * call this rather than instantiating a provider directly, so swapping
 * providers never requires touching a service.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const mode = (process.env.AI_PROVIDER || "mock").toLowerCase();
  cached = mode === "gemini" ? new GeminiProvider() : new MockProvider();
  return cached;
}

/** Test-only escape hatch to reset the cached singleton between test files. */
export function __resetProviderForTests() {
  cached = null;
}
