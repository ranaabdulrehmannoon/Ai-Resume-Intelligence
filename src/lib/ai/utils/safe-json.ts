/**
 * Best-effort JSON extraction from a raw LLM text response.
 *
 * Models occasionally wrap JSON in markdown code fences, prepend a
 * sentence of preamble, or otherwise slightly malform their output.
 * This never throws — it returns `null` on total failure so callers
 * can decide what to do next (retry, fail gracefully, etc.) rather
 * than crashing on a JSON.parse exception.
 */
export function safeParseJSON(raw: string): unknown | null {
  if (!raw || typeof raw !== "string") return null;

  const attempts: string[] = [
    raw.trim(),
    // Strip ```json ... ``` or ``` ... ``` fences
    raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim(),
  ];

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through to the next strategy
    }
  }

  // Last resort: extract the largest {...} or [...] span and try that.
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  const span = objectMatch?.[0] ?? arrayMatch?.[0];

  if (span) {
    try {
      return JSON.parse(span);
    } catch {
      return null;
    }
  }

  return null;
}
