import type { z } from "zod";
import { isAIProviderRateLimitError, type AIProvider, type GenerateOptions } from "../providers/types";
import { safeParseJSON } from "./safe-json";
import { AIValidationError } from "./errors";

export interface GenerateValidatedOptions extends GenerateOptions {
  /** Max correction attempts after the first try. Default 1 (i.e. 2 total calls). */
  maxRetries?: number;
}

/**
 * The single choke point every AI service routes through. Implements the
 * exact pipeline required by the Phase 2 spec:
 *
 *   1. Attempt safe parsing      (safeParseJSON — never throws)
 *   2. Validate                  (zod schema.safeParse)
 *   3. Retry with a correction   (re-prompt the model with the exact
 *      prompt if necessary        validation errors, asking it to fix them)
 *   4. Fail gracefully if still  (throws a typed AIValidationError the
 *      invalid                    caller can catch and handle — e.g. mark
 *                                  an Analysis row FAILED rather than
 *                                  storing garbage)
 *
 * Never returns or lets a caller store unvalidated data — the return
 * type is always `z.infer<typeof schema>`, guaranteed schema-valid.
 */
export async function generateValidated<T extends z.ZodTypeAny>(
  provider: AIProvider,
  schema: T,
  options: GenerateValidatedOptions
): Promise<z.infer<T>> {
  const { maxRetries = 1, ...generateOptions } = options;

  let lastRaw = "";
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const prompt =
      attempt === 0
        ? generateOptions.prompt
        : buildCorrectionPrompt(generateOptions.prompt, lastRaw, lastError);

    let raw: string;
    try {
      raw = await provider.generateJSON({ ...generateOptions, prompt });
    } catch (err) {
      if (isAIProviderRateLimitError(err)) throw err;
      lastError = err;
      continue; // provider-level failure — still eligible for retry
    }

    lastRaw = raw;
    const parsed = safeParseJSON(raw);

    if (parsed === null) {
      lastError = new Error("Response was not valid JSON");
      continue;
    }

    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }

    lastError = result.error;
  }

  // Fail gracefully: throw a typed, catchable error rather than ever
  // returning/storing something that didn't pass schema validation.
  throw new AIValidationError(
    `AI response failed schema validation after ${maxRetries + 1} attempt(s)`,
    lastRaw,
    lastError
  );
}

function buildCorrectionPrompt(originalPrompt: string, lastRaw: string, error: unknown): string {
  const errorDetail =
    error instanceof Error ? error.message : JSON.stringify(error, null, 2).slice(0, 1000);

  return `${originalPrompt}

Your previous response failed validation. Previous response:
${lastRaw.slice(0, 1500)}

Validation error:
${errorDetail}

Return ONLY corrected, raw, valid JSON matching the required schema exactly. No markdown, no commentary.`;
}
