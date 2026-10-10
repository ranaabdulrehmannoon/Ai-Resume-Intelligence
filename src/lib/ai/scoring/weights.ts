/**
 * Centralized ATS scoring weights. Every weight lives here and nowhere
 * else — ScoringService imports this rather than hardcoding numbers, so
 * the entire scoring rubric can be tuned in one place.
 */
export const SCORE_WEIGHTS = {
  skill: 30,
  experience: 20,
  keywords: 15,
  projects: 10,
  education: 10,
  structure: 10,
  formatting: 5,
} as const;

export type ScoreDimension = keyof typeof SCORE_WEIGHTS;

export const TOTAL_POSSIBLE_SCORE = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
