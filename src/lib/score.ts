/**
 * Score presentation helpers. Thresholds live here once so the gauge,
 * list badges, and dashboard can never disagree about what "Strong" means.
 */
export const SCORE_THRESHOLDS = { excellent: 80, strong: 65, good: 50, fair: 35 } as const;

export type ScoreVariant = "success" | "info" | "warning" | "destructive";

export function scoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return "#10B981";
  if (score >= SCORE_THRESHOLDS.strong) return "#6366F1";
  if (score >= SCORE_THRESHOLDS.good) return "#F59E0B";
  return "#EF4444";
}

export function scoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return "Excellent Match";
  if (score >= SCORE_THRESHOLDS.strong) return "Strong Match";
  if (score >= SCORE_THRESHOLDS.good) return "Good Match";
  if (score >= SCORE_THRESHOLDS.fair) return "Fair Match";
  return "Needs Work";
}

export function scoreVariant(score: number): ScoreVariant {
  if (score >= SCORE_THRESHOLDS.excellent) return "success";
  if (score >= SCORE_THRESHOLDS.strong) return "info";
  if (score >= SCORE_THRESHOLDS.good) return "warning";
  return "destructive";
}
