/**
 * Every prompt builder tags its system prompt with one of these markers
 * as the first line. GeminiProvider ignores it entirely (harmless stray
 * text to the model). MockProvider reads it to decide which canned,
 * context-grounded response shape to synthesize — without MockProvider
 * needing to know anything about prompt internals or import from
 * `prompts/`, keeping the provider layer decoupled from prompt content.
 */
export const MOCK_MARKERS = {
  RESUME_EXTRACTION: "[[MOCK:RESUME_EXTRACTION]]",
  JOB_EXTRACTION: "[[MOCK:JOB_EXTRACTION]]",
  BULLET_ANALYSIS: "[[MOCK:BULLET_ANALYSIS]]",
  RECOMMENDATIONS: "[[MOCK:RECOMMENDATIONS]]",
  INTERVIEW_PREP: "[[MOCK:INTERVIEW_PREP]]",
} as const;

export type MockMarker = (typeof MOCK_MARKERS)[keyof typeof MOCK_MARKERS];

/** Extracts and JSON.parses a `<context>...</context>` block from a prompt. */
export function extractContext<T = unknown>(prompt: string): T | null {
  const match = prompt.match(/<context>([\s\S]*?)<\/context>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as T;
  } catch {
    return null;
  }
}
