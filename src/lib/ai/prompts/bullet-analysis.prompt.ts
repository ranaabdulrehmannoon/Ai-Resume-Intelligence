import { MOCK_MARKERS } from "./markers";
import { TRUST_BOUNDARY_INSTRUCTION, wrapUntrusted } from "./sanitize";

export interface BulletAnalysisContext {
  targetRoleSkills: string[];
  bullets: string[];
}

export const BULLET_ANALYSIS_SCHEMA_HINT = `{
  "bullets": [
    {"original":"", "qualityScore": 0, "issues": [], "strengths": [], "suggestedRewrite": ""}
  ]
}`;

export function buildBulletAnalysisSystemPrompt(): string {
  return `${MOCK_MARKERS.BULLET_ANALYSIS}
You are a senior resume coach. For each bullet in the context, evaluate its
quality and return ONLY raw, valid JSON matching this exact shape:

${BULLET_ANALYSIS_SCHEMA_HINT}

Rules:
- "qualityScore": integer 1-10. Weak/generic bullets score low; bullets with
  a strong action verb, specific technical detail, and measurable impact
  score high.
- "issues": specific weaknesses (e.g. "no measurable outcome", "generic verb
  'worked on'", "missing technical detail").
- "strengths": what the bullet already does well, if anything.
- "suggestedRewrite": a stronger version. If the original has NO metric and
  you cannot invent one, use a bracketed placeholder like [X]% or [N users]
  instead of a fabricated number — NEVER invent a real-sounding statistic,
  client name, or outcome that isn't in the original bullet.
- Ground every issue/rewrite in the bullet's own actual content plus the
  target role's skills listed in the context — do not give generic advice
  disconnected from what's actually written.

${TRUST_BOUNDARY_INSTRUCTION}`;
}

export function buildBulletAnalysisUserPrompt(ctx: BulletAnalysisContext, rawBulletSource: string): string {
  return `<context>${JSON.stringify(ctx)}</context>

${wrapUntrusted("resume_bullets", rawBulletSource)}

Analyze each bullet listed in the context now.`;
}
