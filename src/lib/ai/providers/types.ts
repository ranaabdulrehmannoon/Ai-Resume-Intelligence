/**
 * Every AI service in this codebase depends on this interface, never on
 * GeminiProvider or MockProvider directly. Swapping providers (or adding
 * a third — OpenAI, Anthropic, etc.) never requires touching a service.
 */
export interface GenerateOptions {
  /** System-level instructions. Always takes priority over user content. */
  system: string;
  /** The user-turn prompt, including any untrusted content (pre-wrapped). */
  prompt: string;
  /** Upper bound on output tokens. */
  maxOutputTokens?: number;
  /** Sampling temperature. Lower = more deterministic extraction. */
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;

  /**
   * Generate raw text from the model. Services should generally prefer
   * `generateJSON`, but this is exposed for cases (like a correction
   * retry prompt) that need the raw string.
   */
  generateText(options: GenerateOptions): Promise<string>;

  /**
   * Convenience wrapper that asks the model for JSON and returns the
   * raw string response — parsing/validation is the *service* layer's
   * job (via `generateValidated`), not the provider's, so provider
   * swaps can never change validation behavior.
   */
  generateJSON(options: GenerateOptions): Promise<string>;

  /**
   * Returns a numeric embedding vector for the given text, used by
   * SkillMatchingService for semantic (non-exact) skill matching.
   */
  embed(text: string): Promise<number[]>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export function isAIProviderRateLimitError(error: unknown): error is AIProviderError {
  if (!(error instanceof AIProviderError)) return false;

  const cause = error.cause as { status?: unknown; statusCode?: unknown; message?: unknown } | undefined;
  return (
    cause?.status === 429 ||
    cause?.statusCode === 429 ||
    (typeof cause?.message === "string" && /rate limit|too many requests/i.test(cause.message))
  );
}
