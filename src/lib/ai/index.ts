// ============================================================
// Public barrel export for the AI engine. Application code (API
// routes, server actions) should import from here rather than
// reaching into individual files under src/lib/ai/**.
// ============================================================

export { getAIProvider, MockProvider, GeminiProvider, AIProviderError, isAIProviderRateLimitError } from "./providers";
export type { AIProvider, GenerateOptions } from "./providers";

export { ResumeExtractionService } from "./services/resume-extraction.service";
export { JobExtractionService } from "./services/job-extraction.service";
export { SkillMatchingService } from "./services/skill-matching.service";
export type { SkillMatchResult, MatchedSkill, MissingSkill } from "./services/skill-matching.service";
export { ScoringService, estimateYearsOfExperience } from "./services/scoring.service";
export type { ATSScoreResult, ScoreExplanation } from "./services/scoring.service";
export { BulletAnalysisService } from "./services/bullet-analysis.service";
export { RecommendationService } from "./services/recommendation.service";
export { InterviewPreparationService } from "./services/interview-preparation.service";
export { AnalysisOrchestratorService } from "./services/analysis-orchestrator.service";
export type { FullAnalysisResult } from "./services/analysis-orchestrator.service";

export { SCORE_WEIGHTS, TOTAL_POSSIBLE_SCORE } from "./scoring/weights";

export { structuredResumeSchema } from "./schemas/resume.schema";
export type { StructuredResume } from "./schemas/resume.schema";
export { structuredJobSchema } from "./schemas/job.schema";
export type { StructuredJob } from "./schemas/job.schema";
export * from "./schemas/analysis.schema";

export { AIValidationError } from "./utils/errors";
