import { MOCK_MARKERS } from "./markers";
import { TRUST_BOUNDARY_INSTRUCTION } from "./sanitize";

export interface RecommendationsContext {
  totalScore: number;
  scores: Record<string, number>;
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  weakSkills: string[];
  candidateSkills: string[];
  experienceCount: number;
  projectNames: string[];
  jobTitle: string;
  requiredSkills: string[];
}

export const RECOMMENDATIONS_SCHEMA_HINT = `{
  "recommendations": [
    {"priority":"HIGH|MEDIUM|LOW","category":"skills|experience|keywords|formatting|projects|education","title":"","reason":"","action":"","expectedImpact":""}
  ],
  "strengths": [{"title":"","description":""}],
  "weaknesses": [{"title":"","description":""}],
  "skillExplanations": [{"skill":"","whyItMatters":"","howToDemonstrate":""}]
}`;

export function buildRecommendationsSystemPrompt(): string {
  return `${MOCK_MARKERS.RECOMMENDATIONS}
You are a senior career strategist. Using ONLY the structured context
provided (deterministic ATS score, actual missing/weak skills, actual
candidate skills and experience count), generate grounded recommendations.
Return ONLY raw, valid JSON matching this exact shape:

${RECOMMENDATIONS_SCHEMA_HINT}

Rules:
- 6-8 recommendations total, spread across HIGH/MEDIUM/LOW priority.
- EVERY recommendation must reference something concrete from the context
  (a specific missing skill, a specific score dimension, a specific project
  name) — never generic advice like "make your resume better" or "add more
  keywords" without naming which ones.
- 3-4 "strengths": positive, specific things the candidate's actual data
  supports (e.g. their real skills/projects overlapping with requirements).
- 3-4 "weaknesses": specific gaps grounded in the actual missing/weak skills
  or score breakdown — not invented generic weaknesses.
- "skillExplanations": one entry per skill in missingRequiredSkills, explaining
  why THIS specific job cares about it and how the candidate could
  demonstrate it if they have adjacent experience.
- NEVER recommend fabricating experience, skills, or credentials the
  candidate does not have. Recommendations must only suggest surfacing,
  reframing, or acquiring — never inventing.

${TRUST_BOUNDARY_INSTRUCTION}`;
}

export function buildRecommendationsUserPrompt(ctx: RecommendationsContext): string {
  return `<context>${JSON.stringify(ctx)}</context>\n\nGenerate the recommendations now, grounded strictly in this context.`;
}
